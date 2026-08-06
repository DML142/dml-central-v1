import { expect, test } from '@playwright/test';

import { gotoReady } from './support';

test.describe('page chrome', () => {
  test.beforeEach(async ({ page }) => {
    await gotoReady(page, '/');
  });

  test('exposes the landmarks and a single level-one heading', async ({ page }) => {
    await expect(page.getByRole('banner')).toBeVisible();
    await expect(page.getByRole('main')).toBeVisible();
    await expect(page.getByRole('contentinfo')).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Elsewhere' })).toBeAttached();

    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  });

  test('never skips a heading level', async ({ page }) => {
    const levels = await page
      .locator('h1, h2, h3, h4, h5, h6')
      .evaluateAll((nodes) => nodes.map((node) => Number(node.tagName.slice(1))));

    expect(levels[0]).toBe(1);
    for (let i = 1; i < levels.length; i += 1) {
      expect(levels[i]! - levels[i - 1]!).toBeLessThanOrEqual(1);
    }
  });

  test('puts the skip link first in the tab order', async ({ page }) => {
    await page.keyboard.press('Tab');

    const focused = page.locator(':focus');
    await expect(focused).toHaveText('Skip to content');
    await expect(focused).toBeInViewport();
  });

  test('describes the document to a crawler and to a browser chrome', async ({ page }) => {
    await expect(page).toHaveTitle('DML — Full-stack engineer');

    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /^https?:\/\/.+/);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      'content',
      /fullstack developer/,
    );
    await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'website');
    await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute('content', 'en_US');
    await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#07060B');
    await expect(page.locator('meta[name="color-scheme"]')).toHaveAttribute('content', 'dark');
  });

  test('renders the hero field without exposing it to assistive tech', async ({ page }) => {
    const field = page.locator('svg').first();

    await expect(field).toBeAttached();
    await expect(field.locator('circle')).toHaveCount(150);
    await expect(page.locator('[aria-hidden="true"] > svg')).toHaveCount(1);
  });
});

test.describe('keyboard traversal', () => {
  // tech.md §14 item 5. Past the last control, Chromium/WebKit wrap to the top and Firefox just
  // stays put in headless mode, so the contract checked here stops at reachability and the ring.
  test('reaches every control, each with a visible ring, and never traps midway', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await gotoReady(page, '/');

    const expectedOutlineColor = await page.evaluate(() => {
      const probe = document.createElement('div');
      probe.style.color = 'var(--color-violet-bright)';
      document.body.appendChild(probe);
      const rgb = getComputedStyle(probe).color;
      probe.remove();
      return rgb;
    });

    const seen: string[] = [];

    for (let i = 0; i < 40; i += 1) {
      await page.keyboard.press('Tab');

      const step = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null;
        if (!el || el === document.body) return null;
        if (!el.dataset.kbProbe) el.dataset.kbProbe = crypto.randomUUID();
        const style = getComputedStyle(el);
        return {
          id: el.dataset.kbProbe,
          outlineStyle: style.outlineStyle,
          outlineColor: style.outlineColor,
        };
      });

      if (!step) continue; // the natural gap between the last control and the wrap

      if (seen.includes(step.id)) break; // reached the natural end, wrapped or parked

      expect(step.outlineStyle, `no visible ring at step ${i}`).toBe('solid');
      expect(step.outlineColor, `wrong ring colour at step ${i}`).toBe(expectedOutlineColor);
      seen.push(step.id);
    }

    // Chrome, hero CTA, both project cards, six stack triggers, footer CTA — 21 today. The upper
    // bound catches a trap bouncing between an unexpectedly large but wrong subset.
    expect(seen.length).toBeGreaterThan(15);
    expect(seen.length).toBeLessThan(25);
  });
});

test.describe('locale switching', () => {
  test('swaps the copy and the document language', async ({ page }) => {
    await gotoReady(page, '/');

    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Full-stack systems that stay up.',
    );
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');

    await page.getByRole('button', { name: 'UA', exact: true }).click();

    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Системи, які не падають.');
    await expect(page.locator('html')).toHaveAttribute('lang', 'uk');
    await expect(page.getByRole('button', { name: 'UA', exact: true })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  test('applies ?lang= for a first-time visitor and persists it', async ({ page }) => {
    await gotoReady(page, '/?lang=ua');

    await expect(page.locator('html')).toHaveAttribute('lang', 'uk');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Системи, які не падають.');

    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('lang', 'uk');
  });

  test('lets an already-stored locale win over ?lang=', async ({ page }) => {
    await gotoReady(page, '/');
    await page.getByRole('button', { name: 'RU', exact: true }).click();
    await expect(page.locator('html')).toHaveAttribute('lang', 'ru');

    await gotoReady(page, '/?lang=uk');

    await expect(page.locator('html')).toHaveAttribute('lang', 'ru');
  });

  test('remembers the choice across a reload', async ({ page }) => {
    await gotoReady(page, '/');
    await page.getByRole('button', { name: 'RU', exact: true }).click();

    await page.reload();

    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Системы, которые не падают.');
    await expect(page.locator('html')).toHaveAttribute('lang', 'ru');
  });

  test('keeps the reading position instead of jumping to the top', async ({ page }) => {
    await gotoReady(page, '/');

    const before = await page.evaluate(() => {
      window.scrollTo(0, 400);
      return window.scrollY;
    });
    expect(before).toBeGreaterThan(0);

    // Dispatched rather than clicked: Playwright scrolls a target into view first, which would
    // move the page itself and hide the behaviour under test.
    await page.getByRole('button', { name: 'UA', exact: true }).dispatchEvent('click');
    await expect(page.getByRole('button', { name: 'UA', exact: true })).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    // Translated copy is a different length, so the document reflows and each engine's scroll
    // anchoring compensates by its own amount — Chrome moved 23px here, WebKit 39px. Pinning an
    // exact offset would be testing the engine. The contract in §19.3 is that the reader keeps
    // their place: no return to the top, no leap of a screenful.
    const { after, viewport } = await page.evaluate(() => ({
      after: window.scrollY,
      viewport: window.innerHeight,
    }));

    expect(after).toBeGreaterThan(0);
    expect(Math.abs(after - before)).toBeLessThan(viewport / 2);
  });

  test('leaves an open accordion panel open', async ({ page }) => {
    await gotoReady(page, '/');
    await page.getByRole('button', { name: /Backend/ }).click();
    await expect(page.getByRole('button', { name: /Backend/ })).toHaveAttribute(
      'aria-expanded',
      'true',
    );

    await page.getByRole('button', { name: 'UA', exact: true }).click();

    await expect(page.getByRole('button', { name: /Бекенд/ })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
  });

  // §19.3 also says a switch must not close an open modal. That state cannot be reached: a modal
  // hides the rest of the page from the accessibility tree, so the switcher is not operable while
  // one is open. What is worth asserting is that it really does hide it.
  test('is unreachable while a modal owns the page', async ({ page }) => {
    await gotoReady(page, '/');
    await expect(page.getByRole('button', { name: 'UA', exact: true })).toBeVisible();

    await page.getByRole('button', { name: 'Contact me now' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    await expect(page.getByRole('button', { name: 'UA', exact: true })).toHaveCount(0);

    await page.keyboard.press('Escape');
    await expect(page.getByRole('button', { name: 'UA', exact: true })).toBeVisible();
  });
});

const WIDTHS = [320, 360, 390, 744, 1024, 1280, 1440, 1920];
const SWITCHER_LABELS = { en: 'EN', uk: 'UA', ru: 'RU' } as const;

test.describe('responsive', () => {
  for (const width of WIDTHS) {
    test(`never scrolls sideways at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await gotoReady(page, '/');
      await page.evaluate(() => document.fonts.ready);

      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );

      expect(overflow).toBeLessThanOrEqual(0);
    });
  }

  // The Cyrillic type scale check from roadmap 1.8: Oswald is narrower, and UK/RU run longer.
  for (const [locale, label] of Object.entries(SWITCHER_LABELS)) {
    for (const width of WIDTHS) {
      test(`holds the type scale in ${locale} at ${width}px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await gotoReady(page, '/');
        await page.getByRole('button', { name: label, exact: true }).click();
        await page.evaluate(() => document.fonts.ready);

        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        );
        expect(overflow).toBeLessThanOrEqual(0);

        // The headline is the tightest measure on the page; nothing may spill out of its column.
        const spill = await page.getByRole('heading', { level: 1 }).evaluate((node) => {
          const parent = node.parentElement;
          if (!parent) return 0;
          return node.getBoundingClientRect().right - parent.getBoundingClientRect().right;
        });
        expect(spill).toBeLessThanOrEqual(1);
      });
    }
  }
});
