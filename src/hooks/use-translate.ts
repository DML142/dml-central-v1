'use client';

import { useCallback } from 'react';

import { translate, type Locale, type TranslationKey } from '@/content/i18n';
import { useLocaleStore } from '@/stores/locale-store';

export type Translate = (key: TranslationKey, vars?: Record<string, string | number>) => string;

export function useLocale(): Locale {
  return useLocaleStore((state) => state.locale);
}

export function useTranslate(): Translate {
  const locale = useLocale();

  return useCallback<Translate>((key, vars) => translate(locale, key, vars), [locale]);
}
