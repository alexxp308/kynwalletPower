import type { Authenticate } from '@/application/authenticate';
import type { RegisterAccount } from '@/application/registerAccount';
import type { EnsureAccountAvailability } from '@/application/ensureAccountAvailability';
import { LoginForm } from '@/ui/features/login/LoginForm';
import { LoginScreen } from '@/ui/features/login/LoginScreen';
import { RegistrationForm } from '@/ui/features/registration/RegistrationForm';
import { RegistrationScreen } from '@/ui/features/registration/RegistrationScreen';
import { useAppNavigation } from '@/ui/navigation/useAppNavigation';
type AppProps = {
  authenticate: Authenticate;
  register?: RegisterAccount;
  ensureAvailable?: EnsureAccountAvailability;
};
const unavailable = async () => ({ kind: 'unavailable' }) as const;
export function App({
  authenticate,
  register = unavailable,
  ensureAvailable = unavailable,
}: AppProps) {
  const { path, notice, navigate, clearNotice } = useAppNavigation();
  if (path === '/registro')
    return (
      <RegistrationScreen>
        <RegistrationForm
          register={register}
          ensureAvailable={ensureAvailable}
          onSuccess={() => navigate('/login', true)}
          onLogin={() => navigate('/login')}
        />
      </RegistrationScreen>
    );
  return (
    <LoginScreen>
      <LoginForm
        key={path}
        authenticate={authenticate}
        onRegister={() => navigate('/registro')}
        registrationNotice={notice}
        onAccessAttempt={clearNotice}
      />
    </LoginScreen>
  );
}
