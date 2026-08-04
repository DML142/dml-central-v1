import { afterEach, describe, expect, it, vi } from 'vitest';

import { readStoredLocale, writeStoredLocale } from '@/lib/locale-storage';

const KEY = 'dml-central.locale';

afterEach(() => {
  window.localStorage.clear();
  vi.restoreAllMocks();
});

describe('readStoredLocale', () => {
  it('returns null when nothing is stored', () => {
    expect(readStoredLocale()).toBeNull();
  });

  it('returns a stored locale', () => {
    window.localStorage.setItem(KEY, 'uk');
    expect(readStoredLocale()).toBe('uk');
  });

  it('returns null for a value that is not a known locale', () => {
    window.localStorage.setItem(KEY, 'de');
    expect(readStoredLocale()).toBeNull();
  });

  it('returns null when storage throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });

    expect(readStoredLocale()).toBeNull();
  });
});

describe('writeStoredLocale', () => {
  it('persists the locale and reports success', () => {
    expect(writeStoredLocale('ru')).toBe(true);
    expect(window.localStorage.getItem(KEY)).toBe('ru');
  });

  it('reports failure when storage throws', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });

    expect(writeStoredLocale('ru')).toBe(false);
  });
});
