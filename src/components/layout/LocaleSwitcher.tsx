'use client';

import { LOCALE_LABELS, LOCALES } from '@/content/i18n';
import { useTranslate } from '@/hooks/use-translate';
import { useLocaleStore } from '@/stores/locale-store';

export function LocaleSwitcher() {
  const t = useTranslate();
  const locale = useLocaleStore((state) => state.locale);
  const setLocale = useLocaleStore((state) => state.setLocale);

  return (
    <div role="group" aria-label={t('lang.label')} className="border-line flex border">
      {LOCALES.map((option) => (
        <button
          key={option}
          type="button"
          aria-pressed={locale === option}
          onClick={() => {
            setLocale(option);
          }}
          className="micro text-text-faint hover:bg-surface hover:text-text aria-pressed:bg-surface-raised aria-pressed:text-violet-bright border-line min-h-11 min-w-11 cursor-pointer border-l px-3 py-2 font-medium transition-colors duration-(--dur-fast) first:border-l-0"
        >
          {LOCALE_LABELS[option]}
        </button>
      ))}
    </div>
  );
}
