import type { RegistrationInput, RegistrationErrors } from '@/domain/registration';
import { validateRegistration } from '@/domain/registrationValidation';
export const emptyRegistration: RegistrationInput = {
  displayName: '',
  email: '',
  password: '',
  confirmation: '',
  termsAccepted: false,
};
export type RegistrationState = {
  values: RegistrationInput;
  errors: RegistrationErrors;
  touched: Partial<Record<keyof RegistrationInput, boolean>>;
  status: 'editing' | 'submitting' | 'retrying';
  unavailable: boolean;
};
export const initialRegistration: RegistrationState = {
  values: emptyRegistration,
  errors: {},
  touched: {},
  status: 'editing',
  unavailable: false,
};
export type Action =
  | { type: 'change'; field: keyof RegistrationInput; value: string | boolean }
  | { type: 'blur'; field: keyof RegistrationInput }
  | { type: 'submit' }
  | { type: 'errors'; errors: RegistrationErrors }
  | { type: 'unavailable' }
  | { type: 'retry' }
  | { type: 'ready' };
export function registrationReducer(state: RegistrationState, action: Action): RegistrationState {
  switch (action.type) {
    case 'change': {
      const values = { ...state.values, [action.field]: action.value };
      const all = validateRegistration(values);
      const errors = { ...state.errors };
      for (const field of Object.keys(state.touched) as (keyof RegistrationInput)[]) {
        if (all[field]) errors[field] = all[field];
        else Reflect.deleteProperty(errors, field);
      }
      return { ...state, values, errors };
    }
    case 'blur': {
      const all = validateRegistration(state.values);
      const errors = { ...state.errors };
      if (all[action.field]) errors[action.field] = all[action.field];
      else Reflect.deleteProperty(errors, action.field);
      return { ...state, errors, touched: { ...state.touched, [action.field]: true } };
    }
    case 'submit':
      return { ...state, status: 'submitting', unavailable: false };
    case 'errors':
      return {
        ...state,
        status: 'editing',
        errors: action.errors,
        touched: {
          displayName: true,
          email: true,
          password: true,
          confirmation: true,
          termsAccepted: true,
        },
      };
    case 'unavailable':
      return { ...state, status: 'editing', unavailable: true };
    case 'retry':
      return { ...state, status: 'retrying' };
    case 'ready':
      return { ...state, status: 'editing', unavailable: false };
  }
}
