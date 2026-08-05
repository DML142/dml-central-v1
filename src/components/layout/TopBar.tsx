'use client';

import { Eyebrow } from '@/components/common/Eyebrow';
import { Reveal } from '@/components/common/Reveal';
import { LocaleSwitcher } from '@/components/layout/LocaleSwitcher';
import { useLocale, useTranslate } from '@/hooks/use-translate';

export function TopBar() {
  const t = useTranslate();
  const locale = useLocale();

  return (
    <header className="text-text-faint flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-2">
      <Reveal key={locale} variant="type" immediate>
        <Eyebrow>{t('meta.identity')}</Eyebrow>
      </Reveal>
      <LocaleSwitcher />
      <Eyebrow className="ml-auto text-right">{t('meta.attribution')}</Eyebrow>
    </header>
  );
}
