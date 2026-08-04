'use client';

import { Eyebrow } from '@/components/common/Eyebrow';
import { LocaleSwitcher } from '@/components/layout/LocaleSwitcher';
import { useTranslate } from '@/hooks/use-translate';

export function TopBar() {
  const t = useTranslate();

  return (
    <header className="text-text-faint flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-2">
      <Eyebrow>{t('meta.identity')}</Eyebrow>
      <LocaleSwitcher />
      <Eyebrow className="ml-auto text-right">{t('meta.attribution')}</Eyebrow>
    </header>
  );
}
