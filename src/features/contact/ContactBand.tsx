'use client';

import { CtaButton } from '@/components/common/CtaButton';
import { Reveal } from '@/components/common/Reveal';
import { useTranslate } from '@/hooks/use-translate';
import { useUiStore } from '@/stores/ui-store';

/** The single accent band on the page (tech.md 4.1). Violet ground, void text, used once. */
export function ContactBand() {
  const t = useTranslate();
  const openContact = useUiStore((state) => state.openContact);

  // The band arrives as one object: the violet ground, the figure, the copy and the button are all
  // behind the same mask, and the mask slides off to the right. Wiping the children instead shows
  // an empty violet plank first and fills it in afterwards.
  return (
    <section aria-labelledby="contact-title">
      <Reveal
        variant="wipe"
        className="border-line bg-violet text-void section-gutter lg:band-columns grid grid-cols-1 gap-6 border-t py-12 lg:items-center lg:gap-16"
      >
        <h2 id="contact-title" className="display text-display-lg">
          {t('band.figure')}
        </h2>

        <p className="mono-copy leading-band max-w-band-copy">{t('band.copy')}</p>

        <div className="flex items-end">
          <CtaButton
            variant="inverted"
            onClick={() => {
              openContact('footer');
            }}
          >
            {t('band.cta')}
          </CtaButton>
        </div>
      </Reveal>
    </section>
  );
}
