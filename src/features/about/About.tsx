'use client';

import { Eyebrow } from '@/components/common/Eyebrow';
import { SectionShell } from '@/components/layout/SectionShell';
import { ABOUT_FACTS } from '@/content/site';
import { useTranslate } from '@/hooks/use-translate';

export function About() {
  const t = useTranslate();

  return (
    <SectionShell id="about" title={t('about.title')} count="05">
      <div className="section-gutter lg:about-columns grid grid-cols-1 gap-8 py-8 lg:gap-16">
        <p className="text-text-muted max-w-prose">{t('about.copy')}</p>

        <dl className="border-line flex flex-col border-t lg:border-t-0">
          {ABOUT_FACTS.map((fact) => (
            <div
              key={fact.id}
              className="border-line flex items-baseline justify-between gap-4 border-b py-3"
            >
              <dt>
                <Eyebrow>{t(fact.labelKey)}</Eyebrow>
              </dt>
              <dd className="micro text-text text-right">{t(fact.valueKey)}</dd>
            </div>
          ))}
        </dl>
      </div>
    </SectionShell>
  );
}
