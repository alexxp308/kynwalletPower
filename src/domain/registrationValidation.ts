import type { RegistrationInput, RegistrationErrors } from './registration';
import {
  normalizeEmail,
  isValidEmail,
  PASSWORD_MIN_LENGTH,
  PASSWORD_MAX_LENGTH,
  EMAIL_MAX_LENGTH,
} from './validation';
import { REGISTRATION_MESSAGES as M } from './messages';
export function validateRegistration(input: RegistrationInput): RegistrationErrors {
  const errors: RegistrationErrors = {};
  const name = input.displayName.trim();
  const email = normalizeEmail(input.email);
  if (!name) errors.displayName = M.NAME_REQUIRED;
  else if (name.length > 80) errors.displayName = M.NAME_LONG;
  else if (name.split(/\s+/u).length < 2) errors.displayName = M.NAME_WORDS;
  if (!email) errors.email = M.EMAIL_REQUIRED;
  else if (email.length > EMAIL_MAX_LENGTH) errors.email = M.EMAIL_LONG;
  else if (!isValidEmail(email)) errors.email = M.EMAIL_INVALID;
  if (!input.password) errors.password = M.PASSWORD_REQUIRED;
  else if (input.password.length < PASSWORD_MIN_LENGTH) errors.password = M.PASSWORD_SHORT;
  else if (input.password.length > PASSWORD_MAX_LENGTH) errors.password = M.PASSWORD_LONG;
  if (!input.confirmation) errors.confirmation = M.CONFIRM_REQUIRED;
  else if (input.confirmation !== input.password) errors.confirmation = M.CONFIRM_MISMATCH;
  if (!input.termsAccepted) errors.termsAccepted = M.TERMS_REQUIRED;
  return errors;
}
