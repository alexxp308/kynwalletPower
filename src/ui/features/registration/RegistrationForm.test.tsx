import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RegistrationForm } from './RegistrationForm';
import { expectNoA11yViolations } from '@/test/a11y';
const props = () => ({
  register: vi.fn().mockResolvedValue({ kind: 'success' }),
  ensureAvailable: vi.fn().mockResolvedValue({ kind: 'ready' }),
  onSuccess: vi.fn(),
  onLogin: vi.fn(),
});
async function fill() {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText('Nombre completo'), 'Ana María');
  await user.type(screen.getByLabelText('Correo electrónico'), 'ana@example.test');
  const password = crypto.randomUUID();
  await user.type(screen.getByLabelText('Contraseña', { exact: true }), password);
  await user.type(screen.getByLabelText('Confirmar contraseña'), password);
  await user.click(screen.getByRole('checkbox'));
  return user;
}
describe('Registro UI', () => {
  it('FR-005 cinco errores y foco antes de enviar', async () => {
    const p = props();
    const { container } = render(<RegistrationForm {...p} />);
    await userEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }));
    expect(p.register).not.toHaveBeenCalled();
    expect(screen.getByLabelText('Nombre completo')).toHaveFocus();
    expect(screen.getByText('Confirma tu contraseña')).toBeVisible();
    await expectNoA11yViolations(container);
  });
  it('FR-009 alta llama éxito una vez', async () => {
    const p = props();
    render(<RegistrationForm {...p} />);
    const user = await fill();
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }));
    await waitFor(() => expect(p.onSuccess).toHaveBeenCalledOnce());
  });
  it('FR-018 reintento conserva datos sin registrar automáticamente', async () => {
    const p = props();
    p.register.mockResolvedValue({ kind: 'unavailable' });
    render(<RegistrationForm {...p} />);
    const user = await fill();
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }));
    await screen.findByText('No se pudo completar el registro. Intenta de nuevo.');
    await user.click(screen.getByRole('button', { name: 'Reintentar' }));
    await waitFor(() => expect(p.ensureAvailable).toHaveBeenCalledOnce());
    expect(p.register).toHaveBeenCalledOnce();
    expect(p.onSuccess).not.toHaveBeenCalled();
    expect(screen.getByLabelText('Nombre completo')).toHaveValue('Ana María');
  });
  it('FR-006 corrige errores y reevalúa confirmación', async () => {
    render(<RegistrationForm {...props()} />);
    const user = await fill();
    await user.type(screen.getByLabelText('Contraseña', { exact: true }), 'x');
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }));
    expect(screen.getByText('Las contraseñas no coinciden')).toBeVisible();
    await user.type(screen.getByLabelText('Confirmar contraseña'), 'x');
    expect(screen.queryByText('Las contraseñas no coinciden')).not.toBeInTheDocument();
  });
  it('FR-007 duplicado inline y controles independientes', async () => {
    const p = props();
    p.register.mockResolvedValue({ kind: 'duplicate-email' });
    render(<RegistrationForm {...p} />);
    const user = await fill();
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }));
    await screen.findByText('Este correo ya está registrado');
    await user.click(
      screen.getAllByRole('button', { name: 'Mostrar contraseña' })[0] as HTMLElement,
    );
    expect(screen.getByLabelText('Contraseña', { exact: true })).toHaveAttribute('type', 'text');
    expect(screen.getByLabelText('Confirmar contraseña')).toHaveAttribute('type', 'password');
  });
});

it('FR-012 proveedores no envían y el enlace conserva navegación accesible', async () => {
  const p = props();
  const alert = vi.spyOn(window, 'alert').mockImplementation(() => {});
  render(<RegistrationForm {...p} />);
  await userEvent.click(screen.getByRole('button', { name: 'Google' }));
  await userEvent.click(screen.getByRole('button', { name: 'Apple' }));
  expect(alert).toHaveBeenNthCalledWith(1, 'Próximamente');
  expect(p.register).not.toHaveBeenCalled();
  await userEvent.click(screen.getByRole('link', { name: 'Inicia sesión' }));
  expect(p.onLogin).toHaveBeenCalledOnce();
  alert.mockRestore();
});
