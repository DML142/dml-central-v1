import { expect, test } from '@playwright/test';

import { gotoReady } from './support';

const FIELD = '[data-webgl]';

test.describe('hero particle field', () => {
  test('fades the canvas in over the static constellation', async ({ page }) => {
    await gotoReady(page, '/');

    const field = page.locator(FIELD);
    const constellation = field.locator('svg');

    // The static field carries the first paint, so it is on screen before the canvas exists.
    await expect(constellation).toBeAttached();
    await expect(constellation.locator('circle')).toHaveCount(150);

    await expect(field).toHaveAttribute('data-webgl', 'ready', { timeout: 15_000 });
    await expect(field.locator('canvas')).toBeAttached();

    await expect
      .poll(async () => constellation.evaluate((node) => getComputedStyle(node).opacity))
      .toBe('0');
  });

  test('keeps the whole field out of the accessibility tree', async ({ page }) => {
    await gotoReady(page, '/');
    await expect(page.locator(FIELD)).toHaveAttribute('data-webgl', 'ready', { timeout: 15_000 });

    await expect(page.locator(FIELD)).toHaveAttribute('aria-hidden', 'true');
    await expect(page.locator('canvas')).toHaveCount(1);
    await expect(page.locator('canvas')).not.toBeFocused();
  });

  test('reports no console errors while the field runs', async ({ page }) => {
    const problems: string[] = [];

    page.on('console', (message) => {
      if (message.type() === 'error') problems.push(message.text());
    });
    page.on('pageerror', (error) => problems.push(String(error)));

    await gotoReady(page, '/');
    await expect(page.locator(FIELD)).toHaveAttribute('data-webgl', 'ready', { timeout: 15_000 });
    await page.mouse.move(400, 300);
    await page.mouse.move(600, 420);
    await page.waitForTimeout(1000);

    expect(problems).toEqual([]);
  });
});

test.describe('hero particle field under reduced motion', () => {
  test.beforeEach(async ({ page }) => {
    // Emulated before navigation: the field decides whether to mount a canvas as it mounts.
    await page.emulateMedia({ reducedMotion: 'reduce' });
  });

  test('never mounts a canvas and leaves the static field visible', async ({ page }) => {
    await gotoReady(page, '/');
    await page.waitForTimeout(2000);

    await expect(page.locator(FIELD)).toHaveAttribute('data-webgl', 'static');
    await expect(page.locator('canvas')).toHaveCount(0);
    await expect(page.locator(`${FIELD} svg`)).toBeVisible();
  });
});
