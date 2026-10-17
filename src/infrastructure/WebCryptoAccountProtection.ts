import type { RegisteredAccount, PasswordVerifier } from '@/domain/registration';
import { isValidEmail, normalizeEmail } from '@/domain/validation';
export type Envelope = { iv: Uint8Array<ArrayBuffer>; ciphertext: ArrayBuffer };
const aad = new TextEncoder().encode('kynwallet-demo:1');
function validVerifier(value: unknown): value is PasswordVerifier {
  if (!value || typeof value !== 'object') return false;
  const v = value as PasswordVerifier;
  return (
    v.algorithm === 'PBKDF2' &&
    v.hash === 'SHA-256' &&
    v.iterations === 600000 &&
    [v.salt, v.value].every(
      (a, i) =>
        Array.isArray(a) &&
        a.length === (i === 0 ? 16 : 32) &&
        a.every((n) => Number.isInteger(n) && n >= 0 && n <= 255),
    )
  );
}
export class WebCryptoAccountProtection {
  constructor(private readonly cryptoApi: Crypto = globalThis.crypto) {}
  createKey() {
    return this.cryptoApi.subtle.generateKey({ name: 'AES-GCM', length: 256 }, false, [
      'encrypt',
      'decrypt',
    ]);
  }
  async derive(password: string): Promise<PasswordVerifier> {
    const salt = this.cryptoApi.getRandomValues(new Uint8Array(16));
    const value = await this.bits(password, salt);
    return {
      algorithm: 'PBKDF2',
      hash: 'SHA-256',
      iterations: 600000,
      salt: Array.from(salt),
      value: Array.from(new Uint8Array(value)),
    };
  }
  private async bits(password: string, salt: Uint8Array<ArrayBuffer>) {
    const key = await this.cryptoApi.subtle.importKey(
      'raw',
      new TextEncoder().encode(password),
      'PBKDF2',
      false,
      ['deriveBits'],
    );
    return this.cryptoApi.subtle.deriveBits(
      { name: 'PBKDF2', hash: 'SHA-256', iterations: 600000, salt },
      key,
      256,
    );
  }
  async verify(password: string, verifier: PasswordVerifier) {
    if (!validVerifier(verifier)) throw new Error('Invalid verifier');
    const bytes = new Uint8Array(await this.bits(password, new Uint8Array(verifier.salt)));
    return (
      bytes.reduce((diff, value, index) => diff | (value ^ (verifier.value[index] ?? 256)), 0) === 0
    );
  }
  async encrypt(key: CryptoKey, accounts: RegisteredAccount[]): Promise<Envelope> {
    const iv = this.cryptoApi.getRandomValues(new Uint8Array(12));
    const ciphertext = await this.cryptoApi.subtle.encrypt(
      { name: 'AES-GCM', iv, additionalData: aad, tagLength: 128 },
      key,
      new TextEncoder().encode(JSON.stringify(accounts)),
    );
    return { iv, ciphertext };
  }
  async decrypt(key: CryptoKey, envelope: Envelope): Promise<RegisteredAccount[]> {
    if (
      !key ||
      key.extractable ||
      key.algorithm.name !== 'AES-GCM' ||
      !key.usages.includes('decrypt') ||
      !key.usages.includes('encrypt') ||
      envelope.iv.length !== 12
    )
      throw new Error('Invalid envelope');
    const plaintext = await this.cryptoApi.subtle.decrypt(
      { name: 'AES-GCM', iv: new Uint8Array(envelope.iv), additionalData: aad, tagLength: 128 },
      key,
      envelope.ciphertext,
    );
    const accounts: unknown = JSON.parse(new TextDecoder().decode(plaintext));
    if (!Array.isArray(accounts)) throw new Error('Invalid accounts');
    const emails = new Set<string>();
    for (const a of accounts as unknown[]) {
      if (!a || typeof a !== 'object') throw new Error('Invalid account');
      const v = a as RegisteredAccount;
      if (
        Object.keys(v).sort().join(',') !== 'displayName,normalizedEmail,passwordVerifier' ||
        typeof v.displayName !== 'string' ||
        v.displayName.trim().length === 0 ||
        v.displayName.length > 80 ||
        typeof v.normalizedEmail !== 'string' ||
        !isValidEmail(v.normalizedEmail) ||
        normalizeEmail(v.normalizedEmail) !== v.normalizedEmail ||
        !validVerifier(v.passwordVerifier) ||
        emails.has(v.normalizedEmail)
      )
        throw new Error('Invalid account');
      emails.add(v.normalizedEmail);
    }
    return accounts as RegisteredAccount[];
  }
}
