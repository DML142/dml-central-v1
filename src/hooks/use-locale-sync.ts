'use client';

import { useEffect } from 'react';

import { readQueryLocale } from '@/lib/locale-query';
import { readStoredLocale } from '@/lib/locale-storage';
import { useLocaleStore } from '@/stores/locale-store';

/**
 * Reapplies the stored locale after mount and keeps `<html lang>` in step with it. The first paint
 * is always the default locale so server and client markup match; the resolved choice lands one
 * tick later.
 *
 * A stored choice always wins over `?lang=` — a reader who already picked a language never has it
 * overridden by a link. `?lang=` only seeds the choice for a first-time visitor, and it persists
 * exactly like an explicit switch would (tech.md 19.2). No stored value and no query param leaves
 * the default locale untouched and writes nothing, same as before.
 */
export function useLocaleSync(): void {
  const locale = useLocaleStore((state) => state.locale);
  const restoreLocale = useLocaleStore((state) => state.restoreLocale);
  const setLocale = useLocaleStore((state) => state.setLocale);

  useEffect(() => {
    if (readStoredLocale()) {
      restoreLocale();
      return;
    }

    const queryLocale = readQueryLocale(window.location.search);
    if (queryLocale) setLocale(queryLocale);
  }, [restoreLocale, setLocale]);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
}
