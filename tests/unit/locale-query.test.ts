import { describe, expect, it } from 'vitest';

import { readQueryLocale } from '@/lib/locale-query';

describe('readQueryLocale', () => {
  it('reads a known locale code', () => {
    expect(readQueryLocale('?lang=uk')).toBe('uk');
    expect(readQueryLocale('?lang=ru')).toBe('ru');
    expect(readQueryLocale('?lang=en')).toBe('en');
  });

  it('aliases the country code to the language code', () => {
    expect(readQueryLocale('?lang=ua')).toBe('uk');
    expect(readQueryLocale('?lang=UA')).toBe('uk');
  });

  it('is case-insensitive on a known locale code', () => {
    expect(readQueryLocale('?lang=RU')).toBe('ru');
  });

  it('returns null for an unknown code', () => {
    expect(readQueryLocale('?lang=de')).toBeNull();
  });

  it('returns null when the param is absent', () => {
    expect(readQueryLocale('')).toBeNull();
    expect(readQueryLocale('?foo=bar')).toBeNull();
  });
});
