'use client';

import { IndexLabel } from '@/components/common/IndexLabel';
import { Reveal } from '@/components/common/Reveal';
import { STEPS } from '@/content/site';
import { useLocale, useTranslate } from '@/hooks/use-translate';

export function Steps() {
  const t = useTranslate();
  const locale = useLocale();

  return (
    <Reveal
      key={locale}
      variant="lines"
      immediate
      className="border-line grid grid-cols-1 border-t md:grid-cols-3"
    >
      {STEPS.map((step) => (
        <div
          key={step.index}
          className="border-line section-gutter border-t py-6 first:border-t-0 md:border-t-0 md:border-l md:first:border-l-0"
        >
          <IndexLabel>{step.index}</IndexLabel>
          <h2 className="text-body mt-3 font-medium">{t(step.titleKey)}</h2>
          <p className="mono-copy text-text-muted mt-2">{t(step.textKey)}</p>
        </div>
      ))}
    </Reveal>
  );
}
