import { expect, test, type Page } from '@playwright/test';

import { gotoReady } from './support';

const openGallery = async (page: Page, index = 0) => {
  await gotoReady(page, '/');

  // The card the button sits on is still being revealed until its block reports in, and clicking
  // a control that is mid-flight is how a click ends up landing on nothing.
  const trigger = page.getByRole('button', { name: 'Open gallery' }).nth(index);
  await trigger.scrollIntoViewIfNeeded();
  await expect(page.locator('[data-reveal]').filter({ has: trigger })).toHaveAttribute(
    'data-reveal-done',
    '',
  );

  await trigger.click();

  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  // Visible is not settled: the panel enters on `translateY: 8px → 0` over `--dur-base`
  // (tech.md 9.3), so every box measured before that finishes is a box mid-flight.
  await dialog.evaluate((node) => Promise.all(node.getAnimations().map((a) => a.finished)));
};

test.describe('gallery modal', () => {
  test('opens with the first slide of the right project', async ({ page }) => {
    await openGallery(page);

    await expect(page.getByRole('dialog')).toContainText('COS Code — gallery');
    await expect(page.getByRole('dialog')).toContainText('01 / 13');
  });

  test('navigates with the arrow controls and loops at both ends', async ({ page }) => {
    await openGallery(page);
    const dialog = page.getByRole('dialog');

    await page.getByRole('button', { name: 'Next image' }).click();
    await expect(dialog).toContainText('02 / 13');

    await page.getByRole('button', { name: 'Previous image' }).click();
    await expect(dialog).toContainText('01 / 13');

    // Looping is on, so stepping back from the first slide lands on the last.
    await page.getByRole('button', { name: 'Previous image' }).click();
    await expect(dialog).toContainText('13 / 13');

    await page.getByRole('button', { name: 'Next image' }).click();
    await expect(dialog).toContainText('01 / 13');
  });

  test('navigates by keyboard, including Home and End', async ({ page }) => {
    await openGallery(page);
    const dialog = page.getByRole('dialog');

    await page.keyboard.press('ArrowRight');
    await expect(dialog).toContainText('02 / 13');

    await page.keyboard.press('End');
    await expect(dialog).toContainText('13 / 13');

    await page.keyboard.press('Home');
    await expect(dialog).toContainText('01 / 13');

    await page.keyboard.press('ArrowLeft');
    await expect(dialog).toContainText('13 / 13');
  });

  test('jumps to a slide from the thumbnail strip', async ({ page }) => {
    await openGallery(page);

    await page.getByRole('button', { name: 'Go to image 5' }).click();

    await expect(page.getByRole('dialog')).toContainText('05 / 13');
    await expect(page.getByRole('button', { name: 'Go to image 5' })).toHaveAttribute(
      'aria-current',
      'true',
    );
  });

  test('never lets a slide render at its intrinsic size', async ({ page }) => {
    await openGallery(page);

    // tech.md 6.4: the stage decides the box, never the image's own pixels. The narrowest shot in
    // this set is 310x817 and the widest 1280x535; neither may size its own slot.
    const boxes = await page
      .getByRole('dialog')
      .locator('img[sizes="100vw"]')
      .evaluateAll((nodes) =>
        nodes.map((node) => {
          const rect = node.getBoundingClientRect();
          return { w: Math.round(rect.width), h: Math.round(rect.height) };
        }),
      );

    expect(boxes.length).toBeGreaterThan(1);
    for (const box of boxes) expect(box).toEqual(boxes[0]);
  });

  test('holds the stage size while the slide changes', async ({ page }) => {
    await openGallery(page);
    await page.evaluate(() => document.fonts.ready);
    const stage = page.getByRole('dialog').locator('img[sizes="100vw"]').first();

    const before = await stage.boundingBox();
    await page.getByRole('button', { name: 'Go to image 6' }).click();
    await expect(page.getByRole('dialog')).toContainText('06 / 13');
    const after = await stage.boundingBox();

    // Sub-pixel tolerance: `100dvh` in a flex column lands on a fraction that jitters between
    // reads. The rule under test is that the stage does not reflow, not that it is pixel-exact.
    expect(after?.width).toBeCloseTo(before?.width ?? 0, 1);
    expect(after?.height).toBeCloseTo(before?.height ?? 0, 1);
  });

  test('closes on escape, on the backdrop and on the close button', async ({ page }) => {
    await openGallery(page);
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toBeHidden();

    await page.getByRole('button', { name: 'Open gallery' }).first().click();
    await page.getByRole('button', { name: 'Close gallery' }).click();
    await expect(page.getByRole('dialog')).toBeHidden();
  });

  test('restores focus to the trigger and leaves no scroll lock behind', async ({ page }) => {
    await gotoReady(page, '/');
    await page.evaluate(() => {
      window.scrollTo(0, 300);
    });
    const trigger = page.getByRole('button', { name: 'Open gallery' }).first();
    await trigger.click();
    await expect(page.getByRole('dialog')).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toBeHidden();

    await expect(trigger).toBeFocused();
    const canScroll = await page.evaluate(() => {
      const before = window.scrollY;
      window.scrollBy(0, 50);
      return window.scrollY !== before;
    });
    expect(canScroll).toBe(true);
  });

  test('traps focus inside the dialog', async ({ page }) => {
    await openGallery(page);

    for (let i = 0; i < 25; i += 1) {
      await page.keyboard.press('Tab');
      const inside = await page.evaluate(() => {
        const dialog = document.querySelector('[role="dialog"]');
        return dialog ? dialog.contains(document.activeElement) : false;
      });
      expect(inside).toBe(true);
    }
  });

  test('resets the slide between projects', async ({ page }) => {
    await openGallery(page);
    await page.keyboard.press('End');
    await expect(page.getByRole('dialog')).toContainText('13 / 13');
    await page.keyboard.press('Escape');

    await page.getByRole('button', { name: 'Open gallery' }).nth(1).click();

    await expect(page.getByRole('dialog')).toContainText('01 / 05');
    await expect(page.getByRole('dialog')).toContainText('DMLs Solutions — gallery');
  });

  test('translates the alt text with the page', async ({ page }) => {
    await gotoReady(page, '/');
    await page.getByRole('button', { name: 'UA', exact: true }).click();
    await page.getByRole('button', { name: 'Відкрити галерею' }).first().click();

    await expect(page.getByRole('dialog').getByAltText(/Лендинг COS Code/)).toBeAttached();
  });
});
