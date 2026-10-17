export type RegistrationInput = {
  displayName: string;
  email: string;
  password: string;
  confirmation: string;
  termsAccepted: boolean;
};
export type RegistrationErrors = Partial<Record<keyof RegistrationInput, string>>;
export type PasswordVerifier = {
  algorithm: 'PBKDF2';
  hash: 'SHA-256';
  iterations: 600000;
  salt: number[];
  value: number[];
};
export type RegisteredAccount = {
  displayName: string;
  normalizedEmail: string;
  passwordVerifier: PasswordVerifier;
};
export type RegistrationResult =
  | { kind: 'success' }
  | { kind: 'validation-error'; errors: RegistrationErrors }
  | { kind: 'duplicate-email' }
  | { kind: 'unavailable' };
export type AvailabilityResult = { kind: 'ready' } | { kind: 'unavailable' };
