// @vitest-environment node
import { BrowserAccountGateway } from './BrowserAccountGateway';
import type { RegisteredAccount } from '@/domain/registration';
const password = crypto.randomUUID();
const account = {
  displayName: 'Ana María',
  normalizedEmail: 'ana@example.test',
  passwordVerifier: {},
} as RegisteredAccount;
const protection = {
  derive: vi.fn().mockResolvedValue({}),
  verify: vi.fn(async (p: string) => p === password),
};
function setup(kind: 'absent' | 'valid' | 'invalid' = 'absent', collide = false) {
  const local: RegisteredAccount[] = [account];
  const store = {
    read: vi.fn(async () => local),
    add: vi.fn(async (a: RegisteredAccount) => {
      if (local.some((x) => x.normalizedEmail === a.normalizedEmail)) return 'duplicate' as const;
      local.push(a);
      return 'success' as const;
    }),
  };
  const config =
    kind === 'valid'
      ? {
          kind,
          accounts: [
            {
              email: collide ? account.normalizedEmail : 'seed@example.test',
              password,
              displayName: 'Seed',
            },
          ],
        }
      : { kind };
  const gateway = new BrowserAccountGateway(config, store, protection, undefined, 0);
  return { gateway, store, local };
}
describe('FR-007–011 matriz gateway', () => {
  it('autentica cuenta local sin catálogo y rechaza credenciales', async () => {
    const { gateway } = setup();
    expect((await gateway.authenticate({ email: ' ANA@EXAMPLE.TEST ', password })).kind).toBe(
      'success',
    );
    expect(
      (await gateway.authenticate({ email: account.normalizedEmail, password: password + 'x' }))
        .kind,
    ).toBe('invalid-credentials');
    expect((await gateway.authenticate({ email: 'other@example.test', password })).kind).toBe(
      'invalid-credentials',
    );
  });
  it('rechaza duplicado sin sobrescribir y permite otra alta', async () => {
    const { gateway, local } = setup();
    expect(
      (
        await gateway.register({
          email: ' ANA@EXAMPLE.TEST ',
          password,
          displayName: 'Otro Nombre',
        })
      ).kind,
    ).toBe('duplicate-email');
    expect(local).toHaveLength(1);
    expect(
      (await gateway.register({ email: 'new@example.test', password, displayName: 'Otro Nombre' }))
        .kind,
    ).toBe('success');
  });
  it('inválida impide alta y permite local íntegra', async () => {
    const { gateway } = setup('invalid');
    expect(
      (await gateway.register({ email: 'new@example.test', password, displayName: 'Ana María' }))
        .kind,
    ).toBe('unavailable');
    expect((await gateway.authenticate({ email: account.normalizedEmail, password })).kind).toBe(
      'success',
    );
    expect((await gateway.authenticate({ email: 'unknown@example.test', password })).kind).toBe(
      'unavailable',
    );
  });
  it('válida acepta ambas fuentes y reserva semilla', async () => {
    const { gateway } = setup('valid');
    expect((await gateway.authenticate({ email: 'seed@example.test', password })).kind).toBe(
      'success',
    );
    expect(
      (await gateway.register({ email: 'seed@example.test', password, displayName: 'Ana María' }))
        .kind,
    ).toBe('duplicate-email');
  });
  it('colisión bloquea ese correo sin cambiar cuentas', async () => {
    const { gateway, local } = setup('valid', true);
    expect((await gateway.authenticate({ email: account.normalizedEmail, password })).kind).toBe(
      'unavailable',
    );
    expect(local).toEqual([account]);
  });
  it('falla cerrado si bóveda no puede leerse', async () => {
    const { gateway, store } = setup('valid');
    store.read.mockRejectedValue(new Error('corrupt'));
    expect((await gateway.authenticate({ email: 'seed@example.test', password })).kind).toBe(
      'unavailable',
    );
    expect(
      (await gateway.register({ email: 'new@example.test', password, displayName: 'Ana María' }))
        .kind,
    ).toBe('unavailable');
    expect(await gateway.ensureAvailable()).toEqual({ kind: 'unavailable' });
  });
  it('reintentar no registra', async () => {
    const { gateway, store } = setup();
    expect(await gateway.ensureAvailable()).toEqual({ kind: 'ready' });
    expect(store.add).not.toHaveBeenCalled();
  });
});

it('FR-018 espera de Login y conflicto durante commit', async () => {
  const store = {
    read: vi.fn().mockResolvedValue([]),
    add: vi.fn().mockResolvedValue('duplicate'),
  };
  const gateway = new BrowserAccountGateway({ kind: 'absent' }, store, protection, undefined, 1);
  expect((await gateway.authenticate({ email: 'missing@example.test', password })).kind).toBe(
    'invalid-credentials',
  );
  expect(
    (await gateway.register({ displayName: 'Ana María', email: 'other@example.test', password }))
      .kind,
  ).toBe('duplicate-email');
});
