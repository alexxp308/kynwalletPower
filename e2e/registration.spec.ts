import { test, expect } from '@playwright/test';
import { fillRegistration, login } from './fixtures.js';
test('SC-001 cuenta persiste tras recarga y nueva página, sesión no', async ({ page, context }) => {
  await page.goto('/registro');
  const a = await fillRegistration(page);
  await page.getByRole('button', { name: 'Crear cuenta', exact: true }).click();
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole('status')).toHaveText(
    'Cuenta creada correctamente. Ya puedes iniciar sesión',
  );
  await page.reload();
  await expect(page.getByRole('status')).toHaveCount(0);
  await login(page, a);
  await expect(page.getByRole('heading', { name: /Bienvenido,/ })).toContainText(a.displayName);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Bienvenido de nuevo' })).toBeVisible();
  await login(page, a);
  await page.getByRole('button', { name: 'Cerrar sesión' }).click();
  await page.close();
  const next = await context.newPage();
  await next.goto('/login');
  await login(next, a);
  await expect(next.getByRole('heading', { name: /Bienvenido,/ })).toBeVisible();
});

test('recorrido móvil automatizado con CPU moderada', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  const start = Date.now();
  await page.goto('/registro');
  const a = await fillRegistration(page);
  await page.getByRole('button', { name: 'Crear cuenta', exact: true }).click();
  await expect(page).toHaveURL(/[/]login$/);
  await page.reload();
  await login(page, a);
  await expect(page.getByRole('heading', { name: /Bienvenido,/ })).toBeVisible();
  expect(Date.now() - start).toBeLessThan(120000);
});
