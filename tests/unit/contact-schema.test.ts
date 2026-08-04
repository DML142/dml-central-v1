import { describe, expect, it } from 'vitest';

import { translate, type TranslationKey } from '@/content/i18n';
import { createContactSchema, MESSAGE_MAX, MIN_FILL_MS } from '@/lib/validation/contact';

const t = (key: TranslationKey, vars?: Record<string, string | number>) =>
  translate('en', key, vars);
const schema = createContactSchema(t);

const valid = {
  name: 'Maxim',
  email: 'someone@example.com',
  telegram: '@volnowan',
  message: 'A message that is comfortably past the ten character floor.',
  company: '',
  startedAt: Date.now() - MIN_FILL_MS - 1000,
};

const errorFor = (input: Record<string, unknown>, field: string) => {
  const result = schema.safeParse(input);
  expect(result.success).toBe(false);
  if (result.success) return undefined;
  return result.error.issues.find((issue) => issue.path[0] === field)?.message;
};

describe('contact schema', () => {
  it('accepts a filled form', () => {
    expect(schema.safeParse(valid).success).toBe(true);
  });

  it('accepts an empty telegram handle', () => {
    expect(schema.safeParse({ ...valid, telegram: '' }).success).toBe(true);
  });

  it('accepts a handle without the leading at sign', () => {
    expect(schema.safeParse({ ...valid, telegram: 'volnowan' }).success).toBe(true);
  });

  it.each([
    ['', 'Name is required.'],
    ['M', 'Name must be at least 2 characters.'],
    ['x'.repeat(65), 'Name must be 64 characters or fewer.'],
  ])('rejects the name %o', (name, message) => {
    expect(errorFor({ ...valid, name }, 'name')).toBe(message);
  });

  it.each([
    ['', 'Email is required.'],
    ['not-an-email', 'Enter a valid email address.'],
    ['someone@', 'Enter a valid email address.'],
    [`${'x'.repeat(250)}@example.com`, 'Email must be 254 characters or fewer.'],
  ])('rejects the email %o', (email, message) => {
    expect(errorFor({ ...valid, email }, 'email')).toBe(message);
  });

  it.each([['abc'], ['x'.repeat(33)], ['has space'], ['has-dash'], ['@@handle']])(
    'rejects the handle %o',
    (telegram) => {
      expect(errorFor({ ...valid, telegram }, 'telegram')).toBe(
        'Use 4–32 letters, digits or underscores.',
      );
    },
  );

  it.each([
    ['', 'Message is required.'],
    ['too short', 'Message must be at least 10 characters.'],
    ['x'.repeat(MESSAGE_MAX + 1), `Message must be ${String(MESSAGE_MAX)} characters or fewer.`],
  ])('rejects the message %o', (message, expected) => {
    expect(errorFor({ ...valid, message }, 'message')).toBe(expected);
  });

  it('trims before measuring, so whitespace is not a message', () => {
    expect(errorFor({ ...valid, message: '          ' }, 'message')).toBe('Message is required.');
  });

  it('rejects a filled honeypot', () => {
    expect(schema.safeParse({ ...valid, company: 'Acme' }).success).toBe(false);
  });

  it('rejects a submission faster than the fill-time floor', () => {
    expect(schema.safeParse({ ...valid, startedAt: Date.now() }).success).toBe(false);
    expect(schema.safeParse({ ...valid, startedAt: Date.now() - MIN_FILL_MS }).success).toBe(true);
  });

  it('speaks whichever locale it is given', () => {
    const uk = createContactSchema((key, vars) => translate('uk', key, vars));
    const result = uk.safeParse({ ...valid, name: '' });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("Вкажи ім'я.");
    }
  });

  it('reports every invalid field at once', () => {
    const result = schema.safeParse({ ...valid, name: '', email: 'nope', message: 'short' });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(new Set(result.error.issues.map((issue) => issue.path[0]))).toEqual(
        new Set(['name', 'email', 'message']),
      );
    }
  });
});
