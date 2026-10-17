import type { Page } from '@playwright/test';
import { randomUUID } from 'node:crypto';
export const account = () => ({
  displayName: 'Ana María',
  email: `demo-${randomUUID()}@example.test`,
  password: String(randomUUID()),
});
export async function fillRegistration(page: Page, a = account()) {
  await page.getByLabel('Nombre completo', { exact: true }).fill(a.displayName);
  await page.getByLabel('Correo electrónico', { exact: true }).fill(a.email);
  await page.getByLabel('Contraseña', { exact: true }).fill(a.password);
  await page.getByLabel('Confirmar contraseña', { exact: true }).fill(a.password);
  await page.getByRole('checkbox').check();
  return a;
}
export async function login(page: Page, a: ReturnType<typeof account>) {
  await page.getByLabel('Correo electrónico', { exact: true }).fill(a.email);
  await page.getByLabel('Contraseña', { exact: true }).fill(a.password);
  await page.getByRole('button', { name: 'Iniciar sesión', exact: true }).click();
}
