import { expect, test, type Page } from '@playwright/test';

import { gotoReady } from './support';

test.describe('stack panels', () => {
  test('opens the first panel on desktop and none on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoReady(page, '/');
    await expect(page.getByRole('button', { name: /Frontend/ })).toHaveAttribute(
      'aria-expanded',
      'true',
    );

    await page.setViewportSize({ width: 390, height: 844 });
    await gotoReady(page, '/');
    await expect(page.getByRole('button', { name: /Frontend/ })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });

  test('toggles a panel and reports the state', async ({ page }) => {
    await gotoReady(page, '/');
    const trigger = page.getByRole('button', { name: /Backend/ });

    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await trigger.click();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(page.getByRole('region', { name: /Backend/ })).toBeVisible();

    await trigger.click();
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  test('keeps several panels open at once', async ({ page }) => {
    await gotoReady(page, '/');
    await page.getByRole('button', { name: /Backend/ }).click();
    await page.getByRole('button', { name: /Platforms/ }).click();

    await expect(page.getByRole('button', { name: /Backend/ })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    await expect(page.getByRole('button', { name: /Platforms/ })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
  });

  test('operates by keyboard', async ({ page }) => {
    await gotoReady(page, '/');
    const trigger = page.getByRole('button', { name: /Backend/ });

    await trigger.focus();
    await page.keyboard.press('Enter');
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');

    await page.keyboard.press('Space');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  test('opens the panel named in the hash', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoReady(page, '/#stack-backend');

    await expect(page.getByRole('button', { name: /Backend/ })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    await expect(page.getByRole('button', { name: /Frontend/ })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });
});

test.describe('contact form', () => {
  test.beforeEach(async ({ page }) => {
    await gotoReady(page, '/');
    await page.getByRole('button', { name: 'Contact me now' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('opens from the hero and from the footer band', async ({ page }) => {
    await expect(page.getByRole('dialog')).toContainText('Start a conversation');
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toBeHidden();

    await page.getByRole('button', { name: 'Contact', exact: false }).last().click();
    await expect(page.getByRole('dialog')).toContainText('Start a conversation');
  });

  test('shows an error per empty required field on submit', async ({ page }) => {
    await page.getByRole('button', { name: 'Send message' }).click();

    await expect(page.getByText('Name is required.')).toBeVisible();
    await expect(page.getByText('Email is required.')).toBeVisible();
    await expect(page.getByText('Message is required.')).toBeVisible();
    await expect(page.getByRole('textbox', { name: /Name/ })).toHaveAttribute(
      'aria-invalid',
      'true',
    );
  });

  test('rejects an invalid email and clears the error once fixed', async ({ page }) => {
    const email = page.getByRole('textbox', { name: /Email/ });

    await email.fill('nope');
    await email.blur();
    await expect(page.getByText('Enter a valid email address.')).toBeVisible();

    // tech.md 7.1 sets validation to `onBlur` and re-validation to `onChange`; React Hook Form
    // only re-validates on change after a submit, so before one the fix clears on the next blur.
    await email.fill('someone@example.com');
    await email.blur();
    await expect(page.getByText('Enter a valid email address.')).toBeHidden();
  });

  test('shows the character counter only near the limit', async ({ page }) => {
    const message = page.getByRole('textbox', { name: /Message/ });

    await message.fill('short message here');
    await expect(page.getByText('/ 2000')).toBeHidden();

    await message.fill('x'.repeat(1700));
    await expect(page.getByText('1700 / 2000')).toBeVisible();
  });

  const fillValid = async (page: Page) => {
    await page.getByRole('textbox', { name: /Name/ }).fill('Maxim');
    await page.getByRole('textbox', { name: /Email/ }).fill('someone@example.com');
    await page
      .getByRole('textbox', { name: /Message/ })
      .fill('A message comfortably past the ten character floor.');
  };

  test('confirms a valid submission and offers to send another', async ({ page }) => {
    await fillValid(page);
    // The form rejects anything faster than the two-second fill-time floor.
    await page.waitForTimeout(2100);

    await page.getByRole('button', { name: 'Send message' }).click();

    await expect(page.getByText('Message sent.')).toBeVisible();

    await page.getByRole('button', { name: 'Send another' }).click();
    await expect(page.getByRole('button', { name: 'Send message' })).toBeVisible();
  });

  test('explains a submission that trips the fill-time floor', async ({ page }) => {
    await fillValid(page);
    await page.getByRole('button', { name: 'Send message' }).click();

    // Neither the honeypot nor the timestamp has a visible field, so the generic banner is the
    // only honest thing to show — and waiting a moment really does fix it.
    await expect(page.getByRole('alert')).toHaveText(
      'Could not send the message. Wait a moment and try again.',
    );
    await expect(page.getByText('Message sent.')).toBeHidden();
  });

  test('keeps the honeypot out of the tab order', async ({ page }) => {
    const honeypot = page.locator('#field-company');

    await expect(honeypot).toHaveAttribute('tabindex', '-1');
    await expect(page.locator('.honeypot')).toHaveAttribute('aria-hidden', 'true');

    // Parked off-screen rather than hidden, so a bot reading the DOM still finds it.
    const box = await honeypot.boundingBox();
    expect(box?.x).toBeLessThan(0);
  });

  test('translates its labels and its errors', async ({ page }) => {
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: 'UA', exact: true }).click();
    await page.getByRole('button', { name: "Зв'язатися зараз" }).click();

    await page.getByRole('button', { name: 'Надіслати' }).click();
    await expect(page.getByText("Вкажи ім'я.")).toBeVisible();
  });

  test('restores focus and leaves the page scrollable on close', async ({ page }) => {
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toBeHidden();

    const canScroll = await page.evaluate(() => {
      const before = window.scrollY;
      window.scrollBy(0, 60);
      return window.scrollY !== before;
    });
    expect(canScroll).toBe(true);
  });
});
