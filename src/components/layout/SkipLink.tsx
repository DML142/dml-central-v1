'use client';

import { useTranslate } from '@/hooks/use-translate';

export function SkipLink() {
  const t = useTranslate();

  return (
    <a href="#main" className="micro skip-link bg-violet text-void px-4 py-3 no-underline">
      {t('skip')}
    </a>
  );
}
