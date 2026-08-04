import { expect, test } from '@playwright/test';

const LATIN = 'Full-stack systems that stay up';
// Ukrainian ґ є і ї live in cyrillic-ext, the rest in cyrillic — both subsets have to resolve.
const CYRILLIC = 'Повностековий Українська Русский ґєії';

test.describe('self-hosted faces', () => {
  test('the display face covers latin and cyrillic', async ({ page }) => {
    await page.goto('/');

    const result = await page.evaluate(async () => {
      await document.fonts.load('700 16px Oswald', 'A Повностековий ґєії');
      await document.fonts.ready;
      return {
        family: getComputedStyle(document.documentElement).getPropertyValue('--font-display'),
        latin: document.fonts.check('700 16px Oswald', 'Full-stack systems that stay up'),
        cyrillic: document.fonts.check('700 16px Oswald', 'Повностековий Українська Русский ґєії'),
      };
    });

    expect(result.family).toContain('Oswald');
    expect(result.latin).toBe(true);
    expect(result.cyrillic).toBe(true);
  });

  test('the body and mono faces cover cyrillic', async ({ page }) => {
    await page.goto('/');

    const result = await page.evaluate(
      async ([latin, cyrillic]) => {
        await Promise.all([
          document.fonts.load('400 16px Geist', cyrillic),
          document.fonts.load('400 16px "JetBrains Mono"', cyrillic),
        ]);
        await document.fonts.ready;
        return {
          bodyLatin: document.fonts.check('400 16px Geist', latin),
          bodyCyrillic: document.fonts.check('400 16px Geist', cyrillic),
          monoLatin: document.fonts.check('400 16px "JetBrains Mono"', latin),
          monoCyrillic: document.fonts.check('400 16px "JetBrains Mono"', cyrillic),
        };
      },
      [LATIN, CYRILLIC],
    );

    expect(result).toEqual({
      bodyLatin: true,
      bodyCyrillic: true,
      monoLatin: true,
      monoCyrillic: true,
    });
  });

  test('the headline actually renders in the display face', async ({ page }) => {
    await page.goto('/');

    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toHaveCSS('text-transform', 'uppercase');
    expect(await heading.evaluate((el) => getComputedStyle(el).fontFamily)).toContain('Oswald');
  });
});
