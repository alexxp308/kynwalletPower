import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoA11yViolations } from '@/test/a11y';
import { createAuthStub } from '@/test/authStub';
import { TEST_ACCOUNT } from '@/test/fixtures';
import { App } from './App';

describe('App · accesibilidad de la pantalla completa (FR-015, SC-005)', () => {
  it('vista de login sin violaciones', async () => {
    const { container } = render(<App authenticate={createAuthStub().authenticate} />);
    await expectNoA11yViolations(container);
  });

  it('vista de login con errores visibles sin violaciones', async () => {
    const { container } = render(<App authenticate={createAuthStub().authenticate} />);
    await userEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }));
    await userEvent.click(screen.getByRole('button', { name: 'Google' }));
    await expectNoA11yViolations(container);
  });

  it('vista de bienvenida sin violaciones', async () => {
    const { container } = render(<App authenticate={createAuthStub().authenticate} />);
    await userEvent.type(screen.getByLabelText('Correo electrónico'), TEST_ACCOUNT.email);
    await userEvent.type(screen.getByLabelText('Contraseña'), TEST_ACCOUNT.password);
    await userEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }));
    await screen.findByRole('heading', { name: /Bienvenido,/ });
    await expectNoA11yViolations(container);
  });
});

describe('Integración Registro/Login FR-009,013,019', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/login');
    vi.stubGlobal('scrollTo', vi.fn());
  });
  afterEach(() => {
    window.history.replaceState(null, '', '/');
    vi.unstubAllGlobals();
  });
  it('navega Registro, vuelve a Login y maneja popstate sin aviso', async () => {
    render(<App authenticate={createAuthStub().authenticate} />);
    await userEvent.click(screen.getByRole('link', { name: 'Regístrate' }));
    expect(screen.getByRole('heading', { name: 'Crea tu cuenta' })).toBeVisible();
    await userEvent.click(screen.getByRole('link', { name: 'Inicia sesión' }));
    expect(screen.getByRole('heading', { name: 'Bienvenido de nuevo' })).toBeVisible();
    window.history.replaceState(null, '', '/registro');
    window.dispatchEvent(new PopStateEvent('popstate'));
    await screen.findByRole('heading', { name: 'Crea tu cuenta' });
  });
  it('llega con éxito, limpia aviso al acceder y no reaparece al salir', async () => {
    window.history.replaceState(null, '', '/registro');
    render(
      <App
        authenticate={createAuthStub().authenticate}
        register={async () => ({ kind: 'success' })}
      />,
    );
    const user = userEvent.setup();
    const password = String(crypto.randomUUID());
    await user.type(screen.getByLabelText('Nombre completo'), 'Ana María');
    await user.type(screen.getByLabelText('Correo electrónico'), 'ana@example.test');
    await user.type(screen.getByLabelText('Contraseña', { exact: true }), password);
    await user.type(screen.getByLabelText('Confirmar contraseña'), password);
    await user.click(screen.getByRole('checkbox'));
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }));
    await screen.findByText('Cuenta creada correctamente. Ya puedes iniciar sesión');
    await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }));
    expect(
      screen.queryByText('Cuenta creada correctamente. Ya puedes iniciar sesión'),
    ).not.toBeInTheDocument();
  });
});

it('App sin puerto de registro muestra indisponibilidad y reintento explícito', async () => {
  window.history.replaceState(null, '', '/registro');
  const user = userEvent.setup();
  const { unmount } = render(<App authenticate={createAuthStub().authenticate} />);
  const password = String(crypto.randomUUID());
  await user.type(screen.getByLabelText('Nombre completo'), 'Ana María');
  await user.type(screen.getByLabelText('Correo electrónico'), 'ana@example.test');
  await user.type(screen.getByLabelText('Contraseña', { exact: true }), password);
  await user.type(screen.getByLabelText('Confirmar contraseña'), password);
  await user.click(screen.getByRole('checkbox'));
  await user.click(screen.getByRole('button', { name: 'Crear cuenta' }));
  await screen.findByText('No se pudo completar el registro. Intenta de nuevo.');
  await user.click(screen.getByRole('button', { name: 'Reintentar' }));
  await screen.findByRole('button', { name: 'Reintentar' });
  unmount();
  window.history.replaceState(null, '', '/');
});

it('FR-013 clic con modificador conserva navegación nativa', () => {
  window.history.replaceState(null, '', '/login');
  const { unmount } = render(<App authenticate={createAuthStub().authenticate} />);
  const link = screen.getByRole('link', { name: 'Regístrate' });
  link.addEventListener('click', (event) => event.preventDefault(), { once: true });
  fireEvent.click(link, { ctrlKey: true });
  expect(window.location.pathname).toBe('/login');
  unmount();
  window.history.replaceState(null, '', '/');
});
