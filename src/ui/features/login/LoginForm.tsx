import { useEffect, useRef, type FormEvent } from 'react';
import type { Authenticate } from '@/application/authenticate';
import { REGISTRATION_MESSAGES, MESSAGES } from '@/domain/messages';
import { Alert } from '@/ui/components/Alert/Alert';
import { Button } from '@/ui/components/Button/Button';
import { Checkbox } from '@/ui/components/Checkbox/Checkbox';
import { Divider } from '@/ui/components/Divider/Divider';
import { PasswordField } from '@/ui/components/PasswordField/PasswordField';
import { SocialButton } from '@/ui/components/SocialButton/SocialButton';
import { TextField } from '@/ui/components/TextField/TextField';
import { useLoginForm } from './useLoginForm';
import { WelcomeView } from './WelcomeView';
import styles from './LoginForm.module.css';

type LoginFormProps = {
  authenticate: Authenticate;
  onRegister?: () => void;
  registrationNotice?: boolean;
  onAccessAttempt?: () => void;
};

export function LoginForm({
  authenticate,
  onRegister,
  registrationNotice = false,
  onAccessAttempt,
}: LoginFormProps) {
  const { state, change, blur, submit, logout, toggleRemember, showNotice } =
    useLoginForm(authenticate);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  // US2-4: tras credenciales incorrectas, el foco vuelve a la contraseña.
  useEffect(() => {
    if (state.authError === 'invalid-credentials') passwordRef.current?.focus();
  }, [state.authError]);

  if (state.status === 'welcome' && state.welcomeName) {
    return <WelcomeView name={state.welcomeName} onLogout={logout} />;
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onAccessAttempt?.();
    const errors = submit();
    // US3-1: el foco va al primer campo con error.
    if (errors.email) emailRef.current?.focus();
    else if (errors.password) passwordRef.current?.focus();
  };

  // FR-016: elementos del diseño fuera del alcance de la demostración.
  const notAvailable = () => showNotice(MESSAGES.FEATURE_UNAVAILABLE);

  return (
    <form className={styles.form} noValidate onSubmit={handleSubmit}>
      <div className={styles.heading}>
        <h1 className={styles.title}>Bienvenido de nuevo</h1>
        <p className={styles.subtitle}>Ingresa a tu cuenta para continuar</p>
      </div>

      {registrationNotice && <Alert tone="info">{REGISTRATION_MESSAGES.SUCCESS}</Alert>}

      <TextField
        label="Correo electrónico"
        ref={emailRef}
        type="email"
        name="email"
        autoComplete="username"
        placeholder="tucorreo@ejemplo.com"
        value={state.values.email}
        error={state.fieldErrors.email}
        onChange={(event) => change('email', event.target.value)}
        onBlur={() => blur('email')}
      />

      <PasswordField
        label="Contraseña"
        ref={passwordRef}
        name="password"
        autoComplete="current-password"
        placeholder="••••••••"
        value={state.values.password}
        error={state.fieldErrors.password}
        onChange={(event) => change('password', event.target.value)}
        onBlur={() => blur('password')}
      />

      <div className={styles.options}>
        <Checkbox label="Recordarme" checked={state.rememberMe} onChange={toggleRemember} />
        <Button variant="link" onClick={notAvailable}>
          ¿Olvidaste tu contraseña?
        </Button>
      </div>

      {state.authError && (
        <Alert tone="error">
          {state.authError === 'invalid-credentials'
            ? MESSAGES.INVALID_CREDENTIALS
            : MESSAGES.UNAVAILABLE}
        </Alert>
      )}

      <Button
        type="submit"
        loading={state.status === 'submitting'}
        loadingLabel="Iniciando sesión…"
      >
        Iniciar sesión
      </Button>

      <Divider>o continúa con</Divider>

      <div className={styles.social}>
        <SocialButton provider="Google" onClick={notAvailable} />
        <SocialButton provider="Apple" onClick={notAvailable} />
      </div>

      {state.notice && <Alert tone="info">{state.notice}</Alert>}

      <p className={styles.footer}>
        ¿No tienes cuenta?
        {onRegister ? (
          <a
            href="/registro"
            onClick={(event) => {
              if (!event.ctrlKey && !event.metaKey && !event.shiftKey && event.button === 0) {
                event.preventDefault();
                onRegister();
              }
            }}
          >
            Regístrate
          </a>
        ) : (
          <Button variant="link" onClick={notAvailable}>
            Regístrate
          </Button>
        )}
      </p>
    </form>
  );
}
