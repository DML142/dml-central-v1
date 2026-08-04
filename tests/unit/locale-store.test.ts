import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { useLocaleStore } from '@/stores/locale-store';

const KEY = 'dml-central.locale';

beforeEach(() => {
  window.localStorage.clear();
  useLocaleStore.setState({ locale: 'en' });
});

afterEach(() => {
  window.localStorage.clear();
});

describe('locale store', () => {
  it('starts on the default locale', () => {
    expect(useLocaleStore.getState().locale).toBe('en');
  });

  it('persists an explicit switch', () => {
    useLocaleStore.getState().setLocale('uk');

    expect(useLocaleStore.getState().locale).toBe('uk');
    expect(window.localStorage.getItem(KEY)).toBe('uk');
  });

  it('reapplies a stored locale without writing back', () => {
    window.localStorage.setItem(KEY, 'ru');
    window.localStorage.setItem('other', 'untouched');

    useLocaleStore.getState().restoreLocale();

    expect(useLocaleStore.getState().locale).toBe('ru');
    expect(window.localStorage.getItem(KEY)).toBe('ru');
    expect(window.localStorage.getItem('other')).toBe('untouched');
  });

  it('keeps the default when nothing is stored', () => {
    useLocaleStore.getState().restoreLocale();

    expect(useLocaleStore.getState().locale).toBe('en');
    expect(window.localStorage.getItem(KEY)).toBeNull();
  });

  it('ignores a stored value that is not a known locale', () => {
    window.localStorage.setItem(KEY, 'de');

    useLocaleStore.getState().restoreLocale();

    expect(useLocaleStore.getState().locale).toBe('en');
  });
});
