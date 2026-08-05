import { expect, test, type Locator, type Page } from '@playwright/test';

import { gotoReady } from './support';

const revealIn = (page: Page, section: string): Locator =>
  page.locator(`[aria-labelledby="${section}-title"] > [data-reveal]`);

const opacity = (target: Locator) =>
  target.evaluate((element) => getComputedStyle(element).opacity);

/** The uncovered share of a wipe, read off `inset(top right bottom left)`: 100 hidden, 0 done. */
const coveredPercent = (target: Locator) =>
  target.evaluate((element) => {
    const match = /inset\(([^)]+)\)/.exec(getComputedStyle(element).clipPath);
    if (!match?.[1]) return 0;
    return Number.parseFloat(match[1].split(/\s+/)[1] ?? '0');
  });

test.describe('section reveals', () => {
  test('holds a section back until it is scrolled to', async ({ page }) => {
    await gotoReady(page, '/');

    const first = revealIn(page, 'about').locator('> *').first();
    await expect.poll(() => opacity(first), { timeout: 10_000 }).toBe('0');

    await first.scrollIntoViewIfNeeded();

    await expect.poll(() => opacity(first), { timeout: 10_000 }).toBe('1');
  });

  test('uncovers the accent band left to right without fading it', async ({ page }) => {
    await gotoReady(page, '/');

    // The band arrives as one object, ground and all, so the reveal is the band itself.
    const band = revealIn(page, 'contact');
    await expect.poll(() => coveredPercent(band), { timeout: 10_000 }).toBeGreaterThan(50);
    // The whole point of the wipe: it is a mask moving, never a fade.
    expect(await opacity(band)).toBe('1');

    await band.scrollIntoViewIfNeeded();

    await expect.poll(() => coveredPercent(band), { timeout: 10_000 }).toBe(0);
    expect(await opacity(band)).toBe('1');
  });

  test('leaves no clip behind once the band has arrived', async ({ page }) => {
    await gotoReady(page, '/');

    const band = revealIn(page, 'contact');
    await band.scrollIntoViewIfNeeded();

    // A clip flush with the border box shears the tops and tails off the display face, so the
    // mask has to be gone at rest rather than merely opened.
    await expect
      .poll(() => band.evaluate((element) => getComputedStyle(element).clipPath), {
        timeout: 10_000,
      })
      .toBe('none');
  });

  test('plays the hero on load, with nothing to scroll to', async ({ page }) => {
    await gotoReady(page, '/');

    // No scrolling anywhere in this test: the hero is above the fold and runs on no trigger.
    await expect
      .poll(() => opacity(page.locator('[data-reveal-immediate]').first()), { timeout: 10_000 })
      .toBe('1');

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect
      .poll(
        () =>
          page
            .locator('#hero-title')
            .evaluate((element) => getComputedStyle(element).clipPath !== 'none'),
        { timeout: 10_000 },
      )
      .toBe(false);
  });

  test('hands the text back once it has been set', async ({ page }) => {
    await gotoReady(page, '/');

    // The split rewrites the headline into lines and masks. Leaving that markup behind would
    // hand every downstream reader — a resize, a locale switch, a screen reader — a DOM that no
    // component wrote.
    await expect
      .poll(() => page.locator('#hero-title').innerHTML(), { timeout: 10_000 })
      .toBe('Full-stack systems that stay up.');
  });

  test('staggers the children, not the container', async ({ page }) => {
    await gotoReady(page, '/');

    const projects = revealIn(page, 'projects');
    await expect
      .poll(() => opacity(projects.locator('> *').first()), { timeout: 10_000 })
      .toBe('0');
    // The container carries the trigger and must never be the thing that moves.
    expect(await opacity(projects)).toBe('1');
  });

  test('reveals the panel a deep link opens', async ({ page }) => {
    await gotoReady(page, '/#stack-backend');

    await expect(page.getByRole('button', { name: 'Backend' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    await expect.poll(() => opacity(revealIn(page, 'stack')), { timeout: 10_000 }).toBe('1');
  });
});

test.describe('section reveals under reduced motion', () => {
  test.beforeEach(async ({ page }) => {
    // Emulated before navigation: the runtime decides whether to exist during its mount effect.
    await page.emulateMedia({ reducedMotion: 'reduce' });
  });

  test('leaves every section on screen and untouched', async ({ page }) => {
    await gotoReady(page, '/');
    await page.waitForTimeout(1200);

    const styled = await page.locator('[data-reveal]').evaluateAll((containers) => {
      const offenders: string[] = [];

      for (const container of containers) {
        for (const element of [container, ...container.children]) {
          const style = getComputedStyle(element);
          if (style.opacity !== '1' || style.clipPath !== 'none') offenders.push(element.tagName);
        }
      }

      return offenders;
    });

    expect(styled).toEqual([]);
  });
});
