'use client';

import { CtaButton } from '@/components/common/CtaButton';
import { Eyebrow } from '@/components/common/Eyebrow';
import { Steps } from '@/features/hero/Steps';
import { useTranslate } from '@/hooks/use-translate';
import { useUiStore } from '@/stores/ui-store';

interface Props {
  /** The seeded SVG field, rendered on the server so it costs the client no JavaScript. */
  field: React.ReactNode;
}

export function Hero({ field }: Props) {
  const t = useTranslate();
  const openContact = useUiStore((state) => state.openContact);

  return (
    <section aria-labelledby="hero-title" className="border-line relative isolate border-b">
      {field}

      <div className="border-line section-gutter flex items-baseline justify-between gap-4 border-b py-4">
        <Eyebrow tone="muted">{t('hero.eyebrow')}</Eyebrow>
        <Eyebrow>{t('hero.est')}</Eyebrow>
      </div>

      <div className="section-gutter lg:hero-columns grid grid-cols-1 gap-12 pt-12 pb-16 lg:gap-16 lg:py-24">
        <div>
          <h1 id="hero-title" className="display text-display-xl max-w-headline">
            {t('hero.headline')}
          </h1>
          <p className="text-text-muted max-w-copy mt-6">{t('hero.copy')}</p>
        </div>

        <div className="flex flex-col items-start justify-end gap-3 lg:items-end lg:text-right">
          <CtaButton
            onClick={() => {
              openContact('hero');
            }}
          >
            {t('hero.cta')}
          </CtaButton>
          <Eyebrow>{t('hero.stats')}</Eyebrow>
        </div>
      </div>

      <Steps />
    </section>
  );
}
