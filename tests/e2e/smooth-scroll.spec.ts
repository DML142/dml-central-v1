import { expect, test, type Page } from '@playwright/test';

import { gotoReady } from './support';

/** Samples the scroll offset over twelve frames after one wheel tick. */
const sampleAfterWheel = (page: Page, deltaY: number) =>
  page.evaluate(async (delta) => {
    const samples: number[] = [];
    window.dispatchEvent(
      new WheelEvent('wheel', { deltaY: delta, bubbles: true, cancelable: true }),
    );
    for (let i = 0; i < 12; i += 1) {
      await new Promise((resolve) => requestAnimationFrame(resolve));
      samples.push(Math.round(window.scrollY));
    }
    return samples;
  }, deltaY);

test.describe('smooth scroll', () => {
  test('eases the page towards the target instead of jumping', async ({ page }) => {
    await gotoReady(page, '/');
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(600);

    const samples = await sampleAfterWheel(page, 600);
    const last = samples.at(-1) ?? 0;

    expect(last).toBeGreaterThan(0);
    // Eased, not teleported: the first frame covers only part of the distance.
    expect(samples[0] ?? 0).toBeLessThan(last);
    // Monotonic, so it never overshoots and snaps back.
    for (let i = 1; i < samples.length; i += 1) {
      expect(samples[i]! >= samples[i - 1]!).toBe(true);
    }
  });

  test('leaves the sticky rail sticking', async ({ page, isMobile }) => {
    // The rail only exists from `lg` up, and `mouse.wheel` is not available on a touch context.
    test.skip(isMobile, 'the rail is collapsed into the top bar below lg');
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoReady(page, '/');
    await page.evaluate(() => document.fonts.ready);

    const brand = page.locator('a[href="#main"]').last();
    const before = await brand.boundingBox();

    await page.mouse.wheel(0, 1200);
    await page.waitForTimeout(1600);
    const after = await brand.boundingBox();

    // ScrollSmoother put this at y = -1117; a sticky rail stays on screen.
    expect(after?.y ?? -1).toBeGreaterThanOrEqual(0);
    expect(after?.y ?? 0).toBeLessThanOrEqual(before?.y ?? 0);
  });

  test('holds the frame inset', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoReady(page, '/');

    const inset = await page.evaluate(() => {
      const frame = document.querySelector('main')?.parentElement;
      return frame ? frame.getBoundingClientRect().left : 0;
    });

    expect(inset).toBeGreaterThan(0);
  });

  test('stops while a modal owns the scroll', async ({ page }) => {
    await gotoReady(page, '/');
    await page.waitForTimeout(600);

    // Playwright scrolls the trigger into view before clicking, so the page is already partway
    // down; the assertion is that the wheel moves nothing further, not that the offset is zero.
    await page.getByRole('button', { name: 'Open gallery' }).first().click();
    await expect(page.getByRole('dialog')).toBeVisible();
    const locked = await page.evaluate(() => window.scrollY);

    expect((await sampleAfterWheel(page, 600)).at(-1)).toBe(locked);

    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toBeHidden();
    await page.waitForTimeout(400);

    expect((await sampleAfterWheel(page, 600)).at(-1)).toBeGreaterThan(locked);
  });
});

test.describe('smooth scroll under reduced motion', () => {
  test.beforeEach(async ({ page }) => {
    // Emulated before navigation: the smoother decides whether to exist during its mount effect.
    await page.emulateMedia({ reducedMotion: 'reduce' });
  });

  test('does not smooth the scroll at all', async ({ page }) => {
    await gotoReady(page, '/');
    await page.waitForTimeout(600);

    const jumped = await page.evaluate(() => {
      window.scrollTo(0, 500);
      return window.scrollY;
    });

    // No easing means the position is exact on the very next read.
    expect(jumped).toBe(500);
  });

  test('still renders every section', async ({ page }) => {
    await gotoReady(page, '/');

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Projects', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Stack', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'About', exact: true })).toBeVisible();
  });
});
