import { renderHook, act, waitFor } from '@testing-library/react';
import { useRegistrationForm } from './useRegistrationForm';
import { registrationFixture } from '@/test/registrationFixtures';
import type {
  RegistrationInput,
  RegistrationResult,
  AvailabilityResult,
} from '@/domain/registration';
function prepare(
  register = vi
    .fn<(_input: RegistrationInput) => Promise<RegistrationResult>>()
    .mockResolvedValue({ kind: 'success' }),
  ensure = vi.fn<() => Promise<AvailabilityResult>>().mockResolvedValue({ kind: 'ready' }),
) {
  const onSuccess = vi.fn();
  const hook = renderHook(() => useRegistrationForm(register, ensure, onSuccess));
  const data = registrationFixture();
  act(() => {
    for (const [field, value] of Object.entries(data))
      hook.result.current.dispatch({
        type: 'change',
        field: field as keyof RegistrationInput,
        value,
      });
  });
  return { ...hook, register, ensure, onSuccess };
}
describe('FR-018 operaciones del formulario', () => {
  it('bloquea segundo envío en vuelo', async () => {
    let resolve: ((r: RegistrationResult) => void) | undefined;
    const p = prepare(
      vi.fn(
        () =>
          new Promise((r) => {
            resolve = r;
          }),
      ),
    );
    act(() => {
      p.result.current.submit();
      p.result.current.submit();
      p.result.current.retry();
    });
    expect(p.register).toHaveBeenCalledOnce();
    expect(p.ensure).not.toHaveBeenCalled();
    await act(async () => {
      resolve?.({ kind: 'success' });
    });
    expect(p.onSuccess).toHaveBeenCalledOnce();
  });
  it('valores validados por caso de uso actualizan errores', async () => {
    const p = prepare(
      vi.fn().mockResolvedValue({ kind: 'validation-error', errors: { email: 'error externo' } }),
    );
    act(() => {
      p.result.current.submit();
    });
    await waitFor(() => expect(p.result.current.state.errors.email).toBe('error externo'));
  });
  it('rechazo asíncrono muestra fallo sin éxito', async () => {
    const p = prepare(vi.fn().mockRejectedValue(new Error('failure')));
    act(() => {
      p.result.current.submit();
    });
    await waitFor(() => expect(p.result.current.state.unavailable).toBe(true));
    expect(p.onSuccess).not.toHaveBeenCalled();
  });
  it('respuestas tras desmontar no notifican éxito', async () => {
    let resolve: ((r: RegistrationResult) => void) | undefined;
    const p = prepare(
      vi.fn(
        () =>
          new Promise((r) => {
            resolve = r;
          }),
      ),
    );
    act(() => {
      p.result.current.submit();
    });
    p.unmount();
    await act(async () => {
      resolve?.({ kind: 'success' });
    });
    expect(p.onSuccess).not.toHaveBeenCalled();
  });
  it('reintento con error y rechazo conserva cuenta sin enviar', async () => {
    const ensure = vi
      .fn<() => Promise<AvailabilityResult>>()
      .mockResolvedValue({ kind: 'unavailable' });
    const p = prepare(undefined, ensure);
    act(() => {
      p.result.current.retry();
    });
    await waitFor(() => expect(p.result.current.state.unavailable).toBe(true));
    ensure.mockRejectedValue(new Error('failure'));
    act(() => {
      p.result.current.retry();
    });
    await waitFor(() => expect(p.result.current.state.status).toBe('editing'));
    expect(p.register).not.toHaveBeenCalled();
  });
});

it('FR-018 respuestas tardías de reintento no actualizan UI desmontada', async () => {
  for (const reject of [false, true]) {
    let finish: ((r: AvailabilityResult) => void) | undefined;
    let fail: ((e: Error) => void) | undefined;
    const ensure = vi.fn(
      () =>
        new Promise<AvailabilityResult>((resolve, reject) => {
          finish = resolve;
          fail = reject;
        }),
    );
    const p = prepare(undefined, ensure);
    act(() => {
      p.result.current.retry();
    });
    p.unmount();
    await act(async () => {
      if (reject) fail?.(new Error('late'));
      else finish?.({ kind: 'ready' });
    });
    expect(p.register).not.toHaveBeenCalled();
  }
});
