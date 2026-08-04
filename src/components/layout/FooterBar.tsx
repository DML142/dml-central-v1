'use client';

import { Eyebrow } from '@/components/common/Eyebrow';
import { useTranslate } from '@/hooks/use-translate';

export function FooterBar() {
  const t = useTranslate();

  return (
    <footer className="text-text-faint flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-2">
      <Eyebrow>{t('meta.domain')}</Eyebrow>
      <Eyebrow className="ml-auto text-right">{t('meta.location')}</Eyebrow>
    </footer>
  );
}
