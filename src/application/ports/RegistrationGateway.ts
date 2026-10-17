import type { RegistrationInput, RegistrationResult } from '@/domain/registration';
export interface RegistrationGateway {
  register(
    input: Pick<RegistrationInput, 'displayName' | 'email' | 'password'>,
  ): Promise<Exclude<RegistrationResult, { kind: 'validation-error' }>>;
}
