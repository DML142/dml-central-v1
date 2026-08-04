import { expect, test } from '@playwright/test';

import { gotoReady } from './support';

test('the page loads and exposes its main landmark', async ({ page }) => {
  await gotoReady(page, '/');

  await expect(page.getByRole('main')).toBeVisible();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Full-stack systems that stay up.',
  );
});
