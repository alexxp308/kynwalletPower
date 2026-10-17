import { createRegisterAccount } from './registerAccount';
import { createEnsureAccountAvailability } from './ensureAccountAvailability';
const input = () => {
  const password = crypto.randomUUID();
  return {
    displayName: 'Ana María',
    email: ' ANA@EXAMPLE.TEST ',
    password,
    confirmation: password,
    termsAccepted: true,
  };
};
describe('Registro y disponibilidad', () => {
  it('valida antes de puerto y quita confirmación', async () => {
    const register = vi.fn().mockResolvedValue({ kind: 'success' });
    const run = createRegisterAccount({ register });
    expect((await run({ ...input(), termsAccepted: false })).kind).toBe('validation-error');
    expect(register).not.toHaveBeenCalled();
    const a = input();
    expect(await run(a)).toEqual({ kind: 'success' });
    expect(register).toHaveBeenCalledWith({
      displayName: 'Ana María',
      email: 'ana@example.test',
      password: a.password,
    });
  });
  it('transforma rechazos en indisponibilidad', async () => {
    const run = createRegisterAccount({
      register: vi.fn().mockRejectedValue(new Error('interno')),
    });
    expect(await run(input())).toEqual({ kind: 'unavailable' });
  });
  it('reintenta sin registrar o autenticar y controla error', async () => {
    const ensureAvailable = vi.fn().mockResolvedValue({ kind: 'ready' });
    expect(await createEnsureAccountAvailability({ ensureAvailable })()).toEqual({ kind: 'ready' });
    ensureAvailable.mockRejectedValue(new Error('interno'));
    expect(await createEnsureAccountAvailability({ ensureAvailable })()).toEqual({
      kind: 'unavailable',
    });
  });
});
