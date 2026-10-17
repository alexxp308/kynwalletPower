import { test, expect } from '@playwright/test';
import { fillRegistration } from './fixtures.js';
for (const width of [320, 768, 1024, 1440, 1920])
  test(`FR-014 layout ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1024 });
    await page.goto('/registro');
    const brand = page.getByTestId('registration-brand');
    if (width < 1024) await expect(brand).toBeHidden();
    else await expect(brand).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
    await expect(page.getByRole('button', { name: 'Crear cuenta', exact: true })).toBeVisible();
  });
test('resize no remonta formulario', async ({ page }) => {
  await page.goto('/registro');
  const a = await fillRegistration(page);
  for (const width of [1023, 1024, 1023]) {
    await page.setViewportSize({ width, height: 900 });
    await expect(page.getByLabel('Nombre completo')).toHaveValue(a.displayName);
    await expect(page.getByRole('checkbox')).toBeChecked();
  }
});

import axe from 'axe-core';
test('FR-015 axe sobre Registro y modal en navegador real', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1024 });
  await page.goto('/registro');
  await page.addScriptTag({ content: axe.source });
  const inspect = async () =>
    page.evaluate(async () => {
      const result = await (window as unknown as Window & { axe: typeof axe }).axe.run(document, {
        runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] },
      });
      return result.violations.map((v) => ({ id: v.id, targets: v.nodes.map((n) => n.target) }));
    });
  expect(await inspect()).toEqual([]);
  await page.getByRole('button', { name: 'términos y condiciones', exact: true }).click();
  expect(await inspect()).toEqual([]);
});
