import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

import { gotoReady } from './support';

// axe samples actual rendered pixels, so a section mid-fade reads as a blended, lower-contrast
// colour. Reveals hold at exactly opacity 0 or 1 once settled (tech.md 9.2), so this is real.
const waitForRevealsToSettle = (page: Page) =>
  expect
    .poll(() =>
      page.evaluate(() =>
        [...document.querySelectorAll<HTMLElement>('[data-reveal]')].every((element) => {
          const opacity = getComputedStyle(element).opacity;
          return opacity === '0' || opacity === '1';
        }),
      ),
    )
    .toBe(true);

// A dialog is `toBeVisible()` the instant it mounts, but its own enter animation (tech.md 9.3)
// is still running — the same race gallery.spec.ts's `openGallery` already waits out.
const waitForDialogSettled = (page: Page) =>
  page
    .getByRole('dialog')
    .evaluate((node) => Promise.all(node.getAnimations().map((a) => a.finished)));

// tech.md §14 item 7.
const assertNoSeriousViolations = async (page: Page) => {
  await waitForRevealsToSettle(page);
  const results = await new AxeBuilder({ page }).analyze();
  const blocking = results.violations.filter(
    (violation) => violation.impact === 'serious' || violation.impact === 'critical',
  );

  expect(blocking, JSON.stringify(blocking, null, 2)).toEqual([]);
};

test.describe('accessibility scan', () => {
  test('the page has no serious or critical violations', async ({ page }) => {
    await gotoReady(page, '/');
    await assertNoSeriousViolations(page);
  });

  test('the gallery modal has no serious or critical violations', async ({ page }) => {
    await gotoReady(page, '/');
    const trigger = page.getByRole('button', { name: 'Open gallery' }).first();
    await trigger.scrollIntoViewIfNeeded();
    await expect(page.locator('[data-reveal]').filter({ has: trigger })).toHaveAttribute(
      'data-reveal-done',
      '',
    );
    await trigger.click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await waitForDialogSettled(page);

    await assertNoSeriousViolations(page);
  });

  test('the contact modal has no serious or critical violations', async ({ page }) => {
    await gotoReady(page, '/');
    await page.getByRole('button', { name: 'Contact me now' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await waitForDialogSettled(page);

    await assertNoSeriousViolations(page);
  });

  test('an expanded stack panel has no serious or critical violations', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoReady(page, '/');
    await page.getByRole('button', { name: /Backend/ }).click();
    await expect(page.getByRole('button', { name: /Backend/ })).toHaveAttribute(
      'aria-expanded',
      'true',
    );

    await assertNoSeriousViolations(page);
  });
});
