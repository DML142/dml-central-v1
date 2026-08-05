import { expect, type Page } from '@playwright/test';

/**
 * Navigates and waits for the page to finish setting itself up.
 *
 * Two gates, both for the same reason: Playwright's actionability checks say nothing about whether
 * the page is ready for a reader. `data-hydrated` is React attaching its handlers — WebKit
 * hydrates late enough that a click can otherwise land on inert markup and be swallowed.
 * `data-motion` is the load sequence still being held back, during which the hero is deliberately
 * covered and takes no clicks. Under reduced motion the second is never set, so the wait costs
 * nothing.
 */
export async function gotoReady(page: Page, path = '/'): Promise<void> {
  await page.goto(path);
  await expect(page.locator('html')).toHaveAttribute('data-hydrated', 'true');
  await expect(page.locator('html')).not.toHaveAttribute('data-motion', /.*/);
}
