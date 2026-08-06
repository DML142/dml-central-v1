import { render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { useLocaleSync } from '@/hooks/use-locale-sync';
import { useLocaleStore } from '@/stores/locale-store';

const KEY = 'dml-central.locale';

function Probe() {
  useLocaleSync();
  return null;
}

function setup(path: string) {
  window.history.pushState(null, '', path);
  render(<Probe />);
}

beforeEach(() => {
  window.localStorage.clear();
  useLocaleStore.setState({ locale: 'en' });
});

afterEach(() => {
  window.localStorage.clear();
  window.history.pushState(null, '', '/');
});

describe('useLocaleSync', () => {
  it('leaves the default locale and writes nothing when there is no stored value and no query', () => {
    setup('/');

    expect(useLocaleStore.getState().locale).toBe('en');
    expect(window.localStorage.getItem(KEY)).toBeNull();
  });

  it('applies and persists a first-time visitor’s ?lang=', () => {
    setup('/?lang=uk');

    expect(useLocaleStore.getState().locale).toBe('uk');
    expect(window.localStorage.getItem(KEY)).toBe('uk');
  });

  it('accepts the ua alias for a first-time visitor', () => {
    setup('/?lang=ua');

    expect(useLocaleStore.getState().locale).toBe('uk');
    expect(window.localStorage.getItem(KEY)).toBe('uk');
  });

  it('lets a stored choice win over ?lang=, unchanged', () => {
    window.localStorage.setItem(KEY, 'ru');

    setup('/?lang=uk');

    expect(useLocaleStore.getState().locale).toBe('ru');
    expect(window.localStorage.getItem(KEY)).toBe('ru');
  });

  it('reapplies a stored choice when there is no query param', () => {
    window.localStorage.setItem(KEY, 'ru');

    setup('/');

    expect(useLocaleStore.getState().locale).toBe('ru');
  });
});
