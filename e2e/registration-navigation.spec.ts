import { test, expect } from '@playwright/test';
import { fillRegistration } from './fixtures.js';
test('FR-012,013,021 alertas, términos y navegación', async ({ page }) => {
  await page.goto('/registro');
  await page.getByLabel('Nombre completo').fill('Ana María');
  for (const provider of ['Google', 'Apple']) {
    const handled = page.waitForEvent('dialog').then(async (alert) => {
      expect(alert.message()).toBe('Próximamente');
      await alert.accept();
    });
    await page.getByRole('button', { name: provider, exact: true }).click();
    await handled;
    await expect(page.getByLabel('Nombre completo')).toHaveValue('Ana María');
  }
  const trigger = page.getByRole('button', { name: 'términos y condiciones', exact: true });
  await trigger.click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByText('Contenido de demostración, sin validez legal')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
  await expect(page.getByRole('checkbox')).not.toBeChecked();
  await trigger.click();
  await page.getByRole('button', { name: 'Cerrar', exact: true }).click();
  await expect(trigger).toBeFocused();
  await page.getByRole('link', { name: 'Inicia sesión', exact: true }).click();
  await expect(page).toHaveURL(/[/]login$/);
  await page.getByRole('link', { name: 'Regístrate', exact: true }).click();
  await expect(page).toHaveURL(/[/]registro$/);
  await page.goBack();
  await expect(page).toHaveURL(/[/]login$/);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Bienvenido de nuevo' })).toBeVisible();
});
test('FR-016 Enter envía, visibilidad independiente', async ({ page }) => {
  await page.goto('/registro');
  await fillRegistration(page);
  await page.getByRole('button', { name: 'Mostrar contraseña', exact: true }).first().click();
  await expect(page.getByLabel('Contraseña', { exact: true })).toHaveAttribute('type', 'text');
  await expect(page.getByLabel('Confirmar contraseña')).toHaveAttribute('type', 'password');
  await page.getByLabel('Confirmar contraseña').press('Enter');
  await expect(page).toHaveURL(/[/]login$/);
});
