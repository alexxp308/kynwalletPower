import { test, expect } from '@playwright/test';
import { fillRegistration, login, account } from './fixtures.js';
test('SC-004 rechazo de credenciales y correo normalizado', async ({ page }) => {
  await page.goto('/registro');
  const a = await fillRegistration(page);
  await page.getByRole('button', { name: 'Crear cuenta', exact: true }).click();
  await expect(page).toHaveURL(/[/]login$/);
  await login(page, { ...a, password: a.password + 'x' });
  await expect(page.getByRole('alert')).toHaveText('Correo o contraseña incorrectos');
  await login(page, { ...account(), displayName: a.displayName });
  await expect(page.getByRole('alert')).toHaveText('Correo o contraseña incorrectos');
  await login(page, { ...a, email: ` ${a.email.toUpperCase()} ` });
  await expect(page.getByRole('heading', { name: /Bienvenido,/ })).toBeVisible();
});
test('cuenta inicial y correo reservado', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'seeded', 'Solo catálogo inicial');
  const seed = JSON.parse(process.env.E2E_SEED ?? '{}') as ReturnType<typeof account>;
  await page.goto('/login');
  await login(page, seed);
  await expect(page.getByRole('heading', { name: /Bienvenido,/ })).toBeVisible();
  await page.goto('/registro');
  await fillRegistration(page, seed);
  await page.getByRole('button', { name: 'Crear cuenta', exact: true }).click();
  await expect(page.getByText('Este correo ya está registrado')).toBeVisible();
});

test('FR-010 colisión entre fuentes no prioriza identidades', async ({ page }, info) => {
  test.skip(info.project.name !== 'seeded', 'Solo catálogo inicial');
  const seed = JSON.parse(process.env.E2E_SEED ?? '{}') as ReturnType<typeof account>;
  await page.goto('/registro');
  const local = await fillRegistration(page);
  await page.getByRole('button', { name: 'Crear cuenta', exact: true }).click();
  await expect(page).toHaveURL(/[/]login$/);
  await page.evaluate(async (email) => {
    const db = await new Promise<IDBDatabase>((resolve) => {
      const req = indexedDB.open('kynwallet-demo', 1);
      req.onsuccess = () => resolve(req.result);
    });
    const row = await new Promise<Record<string, unknown>>((resolve) => {
      const req = db.transaction('vault').objectStore('vault').get('accounts');
      req.onsuccess = () => resolve(req.result);
    });
    const key = row.encryptionKey as CryptoKey;
    const envelope = row.envelope as { iv: Uint8Array; ciphertext: ArrayBuffer };
    const aad = new TextEncoder().encode('kynwallet-demo:1');
    const raw = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: new Uint8Array(envelope.iv), additionalData: aad, tagLength: 128 },
      key,
      envelope.ciphertext,
    );
    const accounts = JSON.parse(new TextDecoder().decode(raw)) as { normalizedEmail: string }[];
    const first = accounts[0];
    if (!first) throw new Error('missing account');
    first.normalizedEmail = email;
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const ciphertext = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv, additionalData: aad, tagLength: 128 },
      key,
      new TextEncoder().encode(JSON.stringify(accounts)),
    );
    row.envelope = { iv, ciphertext };
    const tx = db.transaction('vault', 'readwrite');
    tx.objectStore('vault').put(row, 'accounts');
    await new Promise<void>((resolve) => {
      tx.oncomplete = () => resolve();
    });
    db.close();
  }, seed.email);
  await login(page, { ...local, email: seed.email });
  await expect(page.getByRole('alert')).toHaveText(
    'Servicio de acceso no disponible. Intenta más tarde.',
  );
  await page.goto('/registro');
  const other = await fillRegistration(page);
  await page.getByRole('button', { name: 'Crear cuenta', exact: true }).click();
  await expect(page).toHaveURL(/[/]login$/);
  await login(page, other);
  await expect(page.getByRole('heading', { name: /Bienvenido,/ })).toBeVisible();
});
