import { type FormEvent } from 'react';
import type { RegisterAccount } from '@/application/registerAccount';
import type { EnsureAccountAvailability } from '@/application/ensureAccountAvailability';
import type { RegistrationInput } from '@/domain/registration';
import { REGISTRATION_MESSAGES as M } from '@/domain/messages';
import { TextField } from '@/ui/components/TextField/TextField';
import { PasswordField } from '@/ui/components/PasswordField/PasswordField';
import { Button } from '@/ui/components/Button/Button';
import { Checkbox } from '@/ui/components/Checkbox/Checkbox';
import { Alert } from '@/ui/components/Alert/Alert';
import { Divider } from '@/ui/components/Divider/Divider';
import { SocialButton } from '@/ui/components/SocialButton/SocialButton';
import { TermsDialog } from '@/ui/components/TermsDialog/TermsDialog';
import { useRegistrationForm } from './useRegistrationForm';
import styles from './RegistrationForm.module.css';
type Props = {
  register: RegisterAccount;
  ensureAvailable: EnsureAccountAvailability;
  onSuccess: () => void;
  onLogin: () => void;
};
export function RegistrationForm({ register, ensureAvailable, onSuccess, onLogin }: Props) {
  const { state, dispatch, submit, retry } = useRegistrationForm(
    register,
    ensureAvailable,
    onSuccess,
  );
  const bind = (field: 'displayName' | 'email' | 'password' | 'confirmation') => ({
    name: field,
    value: state.values[field],
    error: state.errors[field],
    onChange: (event: React.ChangeEvent<HTMLInputElement>) =>
      dispatch({ type: 'change', field, value: event.target.value }),
    onBlur: () => dispatch({ type: 'blur', field }),
  });
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const errors = submit();
    const field = (Object.keys(errors) as (keyof RegistrationInput)[])[0];
    if (field) {
      const control = event.currentTarget.elements.namedItem(field);
      if (control instanceof HTMLInputElement) control.focus();
    }
  };
  const busy = state.status !== 'editing';
  return (
    <form className={styles.form} noValidate onSubmit={handleSubmit}>
      <div className={styles.heading}>
        <h1>Crea tu cuenta</h1>
        <p>Completa tus datos para comenzar</p>
      </div>
      <TextField
        {...bind('displayName')}
        label="Nombre completo"
        autoComplete="name"
        placeholder="Ej: Diego Martínez"
      />
      <TextField
        {...bind('email')}
        label="Correo electrónico"
        type="email"
        autoComplete="username"
        placeholder="tucorreo@ejemplo.com"
      />
      <PasswordField
        {...bind('password')}
        label="Contraseña"
        autoComplete="new-password"
        placeholder="••••••••"
      />
      <PasswordField
        {...bind('confirmation')}
        label="Confirmar contraseña"
        autoComplete="new-password"
        placeholder="••••••••"
      />
      <div className={styles.terms}>
        <Checkbox
          label="Acepto los términos y condiciones"
          visualLabel="Acepto los"
          checked={state.values.termsAccepted}
          name="termsAccepted"
          error={state.errors.termsAccepted}
          onBlur={() => dispatch({ type: 'blur', field: 'termsAccepted' })}
          onChange={(value) => dispatch({ type: 'change', field: 'termsAccepted', value })}
        />
        <TermsDialog />
      </div>
      {state.unavailable && (
        <>
          <Alert tone="error">{M.UNAVAILABLE}</Alert>
          <Button
            variant="secondary"
            loading={state.status === 'retrying'}
            loadingLabel="Reintentando…"
            onClick={retry}
          >
            Reintentar
          </Button>
        </>
      )}
      <Button
        type="submit"
        disabled={busy}
        loading={state.status === 'submitting'}
        loadingLabel="Creando cuenta…"
      >
        Crear cuenta
      </Button>
      {busy && (
        <span role="status" className={styles.processing}>
          {state.status === 'submitting' ? 'Creando cuenta…' : 'Comprobando disponibilidad…'}
        </span>
      )}
      <Divider>o regístrate con</Divider>
      <div className={styles.social}>
        <SocialButton provider="Google" onClick={() => window.alert('Próximamente')} />
        <SocialButton provider="Apple" onClick={() => window.alert('Próximamente')} />
      </div>
      <p className={styles.footer}>
        ¿Ya tienes cuenta?{' '}
        <a
          href="/login"
          onClick={(event) => {
            if (!event.ctrlKey && !event.metaKey && !event.shiftKey && event.button === 0) {
              event.preventDefault();
              onLogin();
            }
          }}
        >
          Inicia sesión
        </a>
      </p>
    </form>
  );
}
