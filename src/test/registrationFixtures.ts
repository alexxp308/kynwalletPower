import type { RegistrationInput } from '@/domain/registration';
export function registrationFixture(): RegistrationInput {
  const password = String(crypto.randomUUID());
  return {
    displayName: 'Ana María',
    email: `demo-${crypto.randomUUID()}@example.test`,
    password,
    confirmation: password,
    termsAccepted: true,
  };
}
