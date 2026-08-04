'use client';

import { useEffect } from 'react';

import { useLocaleSync } from '@/hooks/use-locale-sync';

/**
 * Renders nothing. It is the root client boundary: it runs the locale effects, and it marks the
 * document once React has taken over, so nothing — a test, an analytics probe, a stylesheet — has
 * to guess whether a click will reach a handler yet.
 */
export function LocaleSync() {
  useLocaleSync();

  useEffect(() => {
    document.documentElement.dataset['hydrated'] = 'true';
  }, []);

  return null;
}
