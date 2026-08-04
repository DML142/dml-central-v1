'use client';

import { useEffect } from 'react';

import { useLocaleStore } from '@/stores/locale-store';

/**
 * Reapplies the stored locale after mount and keeps `<html lang>` in step with it. The first paint
 * is always the default locale so server and client markup match; the stored choice lands one tick
 * later. Persisting a switch is the store's job, not this hook's, so restoring never writes back.
 */
export function useLocaleSync(): void {
  const locale = useLocaleStore((state) => state.locale);
  const restoreLocale = useLocaleStore((state) => state.restoreLocale);

  useEffect(() => {
    restoreLocale();
  }, [restoreLocale]);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
}
