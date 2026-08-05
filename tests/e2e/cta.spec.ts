import { expect, test, type Locator } from '@playwright/test';

import { gotoReady } from './support';

/** How much of the rule is still covered, off `inset(top right bottom left)`: 100 hidden, 0 drawn. */
const coveredPercent = (rule: Locator) =>
  rule.evaluate((element) => {
    const match = /inset\(([^)]+)\)/.exec(getComputedStyle(element).clipPath);
    if (!match?.[1]) return 0;
    const parts = match[1].split(/\s+/);
    // A single value in the shorthand applies to every side.
    return Number.parseFloat(parts[1] ?? parts[0] ?? '0');
  });

test.describe('cta', () => {
  test('draws its rule only once the button is pointed at', async ({ page, isMobile }) => {
    test.skip(isMobile, 'there is no hover on a touch context');
    await gotoReady(page, '/');

    const cta = page.getByRole('button', { name: /contact me now/i }).first();
    const rule = cta.locator('.cta-rule');

    expect(await coveredPercent(rule)).toBe(100);

    await cta.hover();

    await expect.poll(() => coveredPercent(rule), { timeout: 5000 }).toBe(0);
    // It keeps stepping to the right while the pointer stays on it.
    expect(await rule.evaluate((element) => getComputedStyle(element).animationName)).toBe(
      'cta-dash-march',
    );
  });

  test('gives a keyboard reader the same affordance', async ({ page, isMobile }) => {
    test.skip(isMobile, 'the keyboard pass is a desktop concern');
    await gotoReady(page, '/');

    const cta = page.getByRole('button', { name: /contact me now/i }).first();
    await cta.focus();

    await expect.poll(() => coveredPercent(cta.locator('.cta-rule')), { timeout: 5000 }).toBe(0);
  });

  test('costs the button no height', async ({ page }) => {
    await gotoReady(page, '/');

    // The rule sits in the bottom padding rather than in flow. In flow it made every button nine
    // pixels taller, which pushed the foot of the contact panel off a phone screen (tech.md 12).
    const geometry = await page
      .getByRole('button', { name: /contact me now/i })
      .first()
      .evaluate((element) => {
        const rule = element.querySelector('.cta-rule');
        return {
          height: Math.round(element.getBoundingClientRect().height),
          rulePosition: rule ? getComputedStyle(rule).position : 'missing',
        };
      });

    expect(geometry.rulePosition).toBe('absolute');
    expect(geometry.height).toBe(44);
  });

  test('keeps the rule out of the accessible name', async ({ page }) => {
    await gotoReady(page, '/');

    const cta = page.getByRole('button', { name: 'Contact me now', exact: true });

    await expect(cta.first()).toBeVisible();
    await expect(cta.first().locator('.cta-rule')).toHaveAttribute('aria-hidden', 'true');
  });
});
