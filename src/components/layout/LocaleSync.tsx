'use client';

import { useLocaleSync } from '@/hooks/use-locale-sync';

/** Renders nothing. Exists so the layout can run the locale effects from a server component. */
export function LocaleSync() {
  useLocaleSync();
  return null;
}
