import type { RegistrationInput, RegistrationResult } from '@/domain/registration';
import { validateRegistration } from '@/domain/registrationValidation';
import { normalizeEmail } from '@/domain/validation';
import type { SecurityEvents } from './ports/SecurityEvents';
import type { RegistrationGateway } from './ports/RegistrationGateway';
export type RegisterAccount = (input: RegistrationInput) => Promise<RegistrationResult>;
export function createRegisterAccount(
  gateway: RegistrationGateway,
  events?: SecurityEvents,
): RegisterAccount {
  return async (input) => {
    const errors = validateRegistration(input);
    if (Object.keys(errors).length) return { kind: 'validation-error', errors };
    try {
      return await gateway.register({
        displayName: input.displayName.trim(),
        email: normalizeEmail(input.email),
        password: input.password,
      });
    } catch {
      events?.record({ operation: 'register', result: 'unavailable' });
      return { kind: 'unavailable' };
    }
  };
}
