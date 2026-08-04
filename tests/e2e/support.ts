import { expect, type Page } from '@playwright/test';

/**
 * Navigates and waits for React to take over. Playwright's actionability checks say nothing about
 * whether a handler is attached yet, and WebKit hydrates late enough that a click can land on
 * inert markup and be swallowed.
 */
export async function gotoReady(page: Page, path = '/'): Promise<void> {
  await page.goto(path);
  await expect(page.locator('html')).toHaveAttribute('data-hydrated', 'true');
}
