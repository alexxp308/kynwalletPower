import type { AuthGateway } from '@/application/ports/AuthGateway';
import type { RegistrationGateway } from '@/application/ports/RegistrationGateway';
import type { AccountAvailabilityGateway } from '@/application/ports/AccountAvailabilityGateway';
import type { SecurityEvents, SecurityEvent } from '@/application/ports/SecurityEvents';
import type { InitialAccountConfig, LoginCredentials, AuthResult } from '@/domain/auth';
import type {
  RegistrationInput,
  RegistrationResult,
  AvailabilityResult,
} from '@/domain/registration';
import { normalizeEmail } from '@/domain/validation';
import type { AccountStore } from './EncryptedAccountStore';
import type { WebCryptoAccountProtection } from './WebCryptoAccountProtection';
export class BrowserAccountGateway
  implements AuthGateway, RegistrationGateway, AccountAvailabilityGateway
{
  constructor(
    private readonly config: InitialAccountConfig,
    private readonly store: AccountStore,
    private readonly protection: Pick<WebCryptoAccountProtection, 'derive' | 'verify'>,
    private readonly events?: SecurityEvents,
    private readonly delayMs = 1000,
  ) {}
  private event(operation: SecurityEvent['operation'], result: SecurityEvent['result']) {
    this.events?.record({ operation, result });
  }
  async ensureAvailable(): Promise<AvailabilityResult> {
    try {
      await this.store.read();
      this.event('availability', 'success');
      return { kind: 'ready' };
    } catch {
      this.event('availability', 'unavailable');
      return { kind: 'unavailable' };
    }
  }
  async register(
    input: Pick<RegistrationInput, 'displayName' | 'email' | 'password'>,
  ): Promise<Exclude<RegistrationResult, { kind: 'validation-error' }>> {
    try {
      if (this.config.kind === 'invalid') {
        this.event('register', 'unavailable');
        return { kind: 'unavailable' };
      }
      const email = normalizeEmail(input.email);
      const accounts = await this.store.read();
      if (
        accounts.some((a) => a.normalizedEmail === email) ||
        (this.config.kind === 'valid' && this.config.accounts.some((a) => a.email === email))
      ) {
        this.event('register', 'rejected');
        return { kind: 'duplicate-email' };
      }
      const result = await this.store.add({
        displayName: input.displayName.trim(),
        normalizedEmail: email,
        passwordVerifier: await this.protection.derive(input.password),
      });
      this.event('register', result === 'success' ? 'success' : 'rejected');
      return { kind: result === 'success' ? 'success' : 'duplicate-email' };
    } catch {
      this.event('register', 'unavailable');
      return { kind: 'unavailable' };
    }
  }
  async authenticate(input: LoginCredentials): Promise<AuthResult> {
    if (this.delayMs > 0) await new Promise((resolve) => setTimeout(resolve, this.delayMs));
    try {
      const accounts = await this.store.read();
      const email = normalizeEmail(input.email);
      const local = accounts.find((a) => a.normalizedEmail === email);
      const initial =
        this.config.kind === 'valid'
          ? this.config.accounts.find((a) => a.email === email)
          : undefined;
      if (local && initial) {
        this.event('authenticate', 'conflict');
        return { kind: 'unavailable' };
      }
      const valid = local
        ? await this.protection.verify(input.password, local.passwordVerifier)
        : initial
          ? initial.password === input.password
          : false;
      if (valid) {
        this.event('authenticate', 'success');
        return { kind: 'success', displayName: local?.displayName ?? initial?.displayName ?? '' };
      }
      if (!local && this.config.kind === 'invalid') {
        this.event('authenticate', 'unavailable');
        return { kind: 'unavailable' };
      }
      this.event('authenticate', 'rejected');
      return { kind: 'invalid-credentials' };
    } catch {
      this.event('authenticate', 'unavailable');
      return { kind: 'unavailable' };
    }
  }
}
