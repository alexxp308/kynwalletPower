import { useReducer, useRef, useEffect } from 'react';
import type { RegisterAccount } from '@/application/registerAccount';
import type { EnsureAccountAvailability } from '@/application/ensureAccountAvailability';
import { validateRegistration } from '@/domain/registrationValidation';
import { REGISTRATION_MESSAGES as M } from '@/domain/messages';
import { registrationReducer, initialRegistration } from './registrationReducer';
export function useRegistrationForm(
  register: RegisterAccount,
  ensureAvailable: EnsureAccountAvailability,
  onSuccess: () => void,
) {
  const [state, dispatch] = useReducer(registrationReducer, initialRegistration);
  const flight = useRef(false);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const submit = () => {
    if (flight.current) return {};
    const errors = validateRegistration(state.values);
    if (Object.keys(errors).length) {
      dispatch({ type: 'errors', errors });
      return errors;
    }
    flight.current = true;
    dispatch({ type: 'submit' });
    void register(state.values)
      .then((result) => {
        if (!mounted.current) return;
        if (result.kind === 'success') onSuccess();
        else if (result.kind === 'validation-error')
          dispatch({ type: 'errors', errors: result.errors });
        else if (result.kind === 'duplicate-email')
          dispatch({ type: 'errors', errors: { email: M.DUPLICATE } });
        else dispatch({ type: 'unavailable' });
      })
      .catch(() => {
        if (mounted.current) dispatch({ type: 'unavailable' });
      })
      .finally(() => {
        flight.current = false;
      });
    return {};
  };
  const retry = () => {
    if (flight.current) return;
    flight.current = true;
    dispatch({ type: 'retry' });
    void ensureAvailable()
      .then((result) => {
        if (mounted.current) dispatch({ type: result.kind === 'ready' ? 'ready' : 'unavailable' });
      })
      .catch(() => {
        if (mounted.current) dispatch({ type: 'unavailable' });
      })
      .finally(() => {
        flight.current = false;
      });
  };
  return { state, dispatch, submit, retry };
}
