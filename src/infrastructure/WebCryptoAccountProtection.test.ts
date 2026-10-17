// @vitest-environment node
import { WebCryptoAccountProtection } from './WebCryptoAccountProtection';
const protection = new WebCryptoAccountProtection();
describe('FR-017 protección', () => {
  it('verifica contraseña exacta sin recuperarla', async () => {
    const password = crypto.randomUUID();
    const verifier = await protection.derive(password);
    expect(verifier.iterations).toBe(600000);
    expect(verifier.salt).toHaveLength(16);
    expect(verifier.value).toHaveLength(32);
    expect(await protection.verify(password, verifier)).toBe(true);
    expect(await protection.verify(password + 'x', verifier)).toBe(false);
    expect(JSON.stringify(verifier)).not.toContain(password);
  });
  it('cifra, descifra y rechaza manipulación con clave no extraíble', async () => {
    const key = await protection.createKey();
    expect(key.extractable).toBe(false);
    const first = await protection.encrypt(key, []);
    const second = await protection.encrypt(key, []);
    expect(first.iv).not.toEqual(second.iv);
    expect(await protection.decrypt(key, first)).toEqual([]);
    const bytes = new Uint8Array(first.ciphertext);
    bytes[0] = (bytes[0] ?? 0) ^ 1;
    await expect(protection.decrypt(key, { ...first, ciphertext: bytes.buffer })).rejects.toThrow();
  });
  it('rechaza costes y payload inválidos', async () => {
    await expect(
      protection.verify('x', {
        algorithm: 'PBKDF2',
        hash: 'SHA-256',
        iterations: 1,
        salt: [],
        value: [],
      } as never),
    ).rejects.toThrow();
    const key = await protection.createKey();
    const envelope = await protection.encrypt(key, [{ bad: true }] as never);
    await expect(protection.decrypt(key, envelope)).rejects.toThrow();
  });
});

it('FR-017 rechaza verificador ausente y payload no colección', async () => {
  await expect(protection.verify('x', null as never)).rejects.toThrow();
  const key = await protection.createKey();
  await expect(
    protection.decrypt(key, await protection.encrypt(key, {} as never)),
  ).rejects.toThrow();
  await expect(
    protection.decrypt(key, await protection.encrypt(key, [null] as never)),
  ).rejects.toThrow();
});
