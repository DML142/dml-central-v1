import { expect, test } from '@playwright/test';

test.describe('not found', () => {
  test('shows the 404 page and links back home', async ({ page }) => {
    const response = await page.goto('/this-page-does-not-exist');

    expect(response?.status()).toBe(404);
    await expect(page.getByText('404')).toBeVisible();
    await expect(page.getByText('Page not found')).toBeVisible();

    await page.getByRole('link', { name: /back home/i }).click();
    await expect(page).toHaveURL('/');
  });
});
