import { expect, test } from '@playwright/test';

import { gotoReady } from './support';

test('the page carries Person and WebSite JSON-LD', async ({ page }) => {
  await gotoReady(page, '/');

  const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
  const types = blocks.map((block) => (JSON.parse(block) as { '@type': string })['@type']);

  expect(types).toEqual(expect.arrayContaining(['Person', 'WebSite']));
});

test('robots.txt allows every crawler and points at the sitemap', async ({ request }) => {
  const response = await request.get('/robots.txt');
  expect(response.status()).toBe(200);

  const body = await response.text();
  expect(body).toContain('Allow: /');
  expect(body).toMatch(/Sitemap: .*\/sitemap\.xml/);
});

test('sitemap.xml lists the single route', async ({ request }) => {
  const response = await request.get('/sitemap.xml');
  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toContain('xml');

  const body = await response.text();
  expect(body).toContain('<loc>');
});

test('the OpenGraph image route renders a PNG', async ({ request }) => {
  const response = await request.get('/opengraph-image');
  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toBe('image/png');
});
