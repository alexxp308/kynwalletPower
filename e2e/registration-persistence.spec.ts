import { test, expect } from '@playwright/test';
import { fillRegistration, account, login } from './fixtures.js';
test('FR-007 altas concurrentes no se pierden', async ({ page, context }) => {
  const other = await context.newPage();
  await page.goto('/registro');
  await other.goto('/registro');
  const a = account();
  const b = account();
  await fillRegistration(page, a);
  await fillRegistration(other, b);
  await Promise.all([
    page.getByRole('button', { name: 'Crear cuenta', exact: true }).click(),
    other.getByRole('button', { name: 'Crear cuenta', exact: true }).click(),
  ]);
  await expect(page).toHaveURL(/[/]login$/);
  await expect(other).toHaveURL(/[/]login$/);
  await login(page, a);
  await login(other, b);
  await expect(page.getByRole('heading', { name: /Bienvenido,/ })).toBeVisible();
  await expect(other.getByRole('heading', { name: /Bienvenido,/ })).toBeVisible();
});
test('mismo correo concurrente tiene un ganador', async ({ page, context }) => {
  const other = await context.newPage();
  await page.goto('/registro');
  await other.goto('/registro');
  const a = account();
  await fillRegistration(page, a);
  await fillRegistration(other, a);
  await Promise.all([
    page.getByRole('button', { name: 'Crear cuenta', exact: true }).click(),
    other.getByRole('button', { name: 'Crear cuenta', exact: true }).click(),
  ]);
  await expect
    .poll(async () => [page, other].filter((p) => new URL(p.url()).pathname === '/login').length)
    .toBe(1);
  const rejected = new URL(page.url()).pathname === '/registro' ? page : other;
  await expect(rejected.getByText('Este correo ya está registrado')).toBeVisible();
});
for (const failure of ['ciphertext', 'key'])
  test(`FR-017 corrupción ${failure} falla cerrado`, async ({ page }) => {
    await page.goto('/registro');
    const a = await fillRegistration(page);
    await page.getByRole('button', { name: 'Crear cuenta', exact: true }).click();
    await expect(page).toHaveURL(/[/]login$/);
    const protectedData = await page.evaluate(
      async ({ failure, email, password }) => {
        const db = await new Promise<IDBDatabase>((resolve, reject) => {
          const req = indexedDB.open('kynwallet-demo', 1);
          req.onsuccess = () => resolve(req.result);
          req.onerror = () => reject(new Error('open'));
        });
        const tx = db.transaction('vault', 'readwrite');
        const store = tx.objectStore('vault');
        const get = store.get('accounts');
        let protectedData = false;
        get.onsuccess = () => {
          const row = get.result;
          protectedData =
            !JSON.stringify(row).includes(email) &&
            !JSON.stringify(row).includes(password) &&
            row.encryptionKey.extractable === false;
          if (failure === 'key') Reflect.deleteProperty(row, 'encryptionKey');
          else {
            const bytes = new Uint8Array(row.envelope.ciphertext);
            bytes[0] = (bytes[0] ?? 0) ^ 1;
            row.envelope.ciphertext = bytes.buffer;
          }
          store.put(row, 'accounts');
        };
        await new Promise<void>((resolve, reject) => {
          tx.oncomplete = () => resolve();
          tx.onerror = () => reject(new Error('write'));
        });
        db.close();
        return protectedData;
      },
      { failure, email: a.email, password: a.password },
    );
    expect(protectedData).toBe(true);
    await login(page, a);
    await expect(page.getByRole('alert')).toHaveText(
      'Servicio de acceso no disponible. Intenta más tarde.',
    );
    await page.goto('/registro');
    await fillRegistration(page);
    await page.getByRole('button', { name: 'Crear cuenta', exact: true }).click();
    await expect(
      page.getByText('No se pudo completar el registro. Intenta de nuevo.'),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Reintentar', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Reintentar', exact: true })).toBeEnabled();
    await expect(page).toHaveURL(/[/]registro$/);
  });

test('FR-018 apertura bloqueada vence y reintento conserva cuentas', async ({ page, context }) => {
  await page.goto('/registro');
  const a = await fillRegistration(page);
  await page.getByRole('button', { name: 'Crear cuenta', exact: true }).click();
  await expect(page).toHaveURL(/[/]login$/);
  const blocker = await context.newPage();
  await blocker.goto('/login');
  await blocker.evaluate(async () => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const req = indexedDB.open('kynwallet-demo', 1);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(new Error('open'));
    });
    db.onversionchange = () => {};
    (window as Window & { blocker?: IDBDatabase }).blocker = db;
    const upgrade = indexedDB.open('kynwallet-demo', 2);
    upgrade.onupgradeneeded = () => upgrade.transaction?.abort();
    upgrade.onerror = (event) => event.preventDefault();
  });
  await page.goto('/registro');
  await fillRegistration(page);
  await page.getByRole('button', { name: 'Crear cuenta', exact: true }).click();
  await expect(page.getByText('No se pudo completar el registro. Intenta de nuevo.')).toBeVisible({
    timeout: 10000,
  });
  await blocker.evaluate(() => {
    (window as Window & { blocker?: IDBDatabase }).blocker?.close();
  });
  await page.getByRole('button', { name: 'Reintentar', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Reintentar', exact: true })).toHaveCount(0);
  await expect(page).toHaveURL(/[/]registro$/);
  await page.goto('/login');
  await login(page, a);
  await expect(page.getByRole('heading', { name: /Bienvenido,/ })).toBeVisible();
});
