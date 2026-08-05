'use client';

import { useEffect, useRef } from 'react';

import { CtaButton } from '@/components/common/CtaButton';
import { Eyebrow } from '@/components/common/Eyebrow';
import { Reveal } from '@/components/common/Reveal';
import { Steps } from '@/features/hero/Steps';
import { useLocale, useTranslate } from '@/hooks/use-translate';
import { useUiStore } from '@/stores/ui-store';

interface Props {
  /** The seeded SVG field, rendered on the server so it costs the client no JavaScript. */
  field: React.ReactNode;
}

export function Hero({ field }: Props) {
  const t = useTranslate();
  const locale = useLocale();
  const openContact = useUiStore((state) => state.openContact);
  const isContactOpen = useUiStore((state) => state.isContactOpen);
  const contactSource = useUiStore((state) => state.contactSource);

  // Focus goes back the moment the store closes, not when the fade ends — the keyboard never
  // waits on an animation (tech.md 9.3).
  const ctaButton = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);

  useEffect(() => {
    const isOpen = isContactOpen && contactSource === 'hero';
    if (wasOpen.current && !isOpen) ctaButton.current?.focus();
    wasOpen.current = isOpen;
  }, [isContactOpen, contactSource]);

  // A split reveal rewrites its element into pieces. Keying on the locale makes React throw that
  // markup away and mount the new copy clean, instead of patching text into a DOM it no longer
  // owns — which would leave the reveal to put the previous language back.
  return (
    <section aria-labelledby="hero-title" className="border-line relative isolate border-b">
      {field}

      <Reveal
        key={`eyebrow-${locale}`}
        variant="type"
        immediate
        className="border-line section-gutter flex items-baseline justify-between gap-4 border-b py-4"
      >
        <Eyebrow tone="muted">{t('hero.eyebrow')}</Eyebrow>
        <Eyebrow>{t('hero.est')}</Eyebrow>
      </Reveal>

      <div className="section-gutter lg:hero-columns grid grid-cols-1 gap-12 pt-12 pb-16 lg:gap-16 lg:py-24">
        <Reveal key={`headline-${locale}`} variant="lines" immediate>
          <h1 id="hero-title" className="display text-display-xl max-w-headline">
            {t('hero.headline')}
          </h1>
          <p className="text-text-muted max-w-copy mt-6">{t('hero.copy')}</p>
        </Reveal>

        <div className="flex flex-col items-start justify-end gap-3 lg:items-end lg:text-right">
          {/* The button is not a line of copy: splitting it would put its label and its arrow
              inside one line element and lose the gap between them. It arrives behind the same
              mask instead, which needs no rewriting of the DOM. */}
          <Reveal variant="wipe" immediate>
            <CtaButton
              ref={ctaButton}
              onClick={() => {
                openContact('hero');
              }}
            >
              {t('hero.cta')}
            </CtaButton>
          </Reveal>

          <Reveal key={`stats-${locale}`} variant="type" immediate>
            <Eyebrow>{t('hero.stats')}</Eyebrow>
          </Reveal>
        </div>
      </div>

      <Steps />
    </section>
  );
}
