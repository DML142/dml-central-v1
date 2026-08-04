import { expect, test } from '@playwright/test';

test('the page loads and exposes its main landmark', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('main')).toBeVisible();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Full-stack systems that stay up.',
  );
});
