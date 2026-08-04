'use client';

import { useState } from 'react';

import { CtaButton } from '@/components/common/CtaButton';
import { Eyebrow } from '@/components/common/Eyebrow';
import { Dialog, DialogClose, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { ContactForm } from '@/features/contact/ContactForm';
import { useTranslate } from '@/hooks/use-translate';
import { useUiStore } from '@/stores/ui-store';

export function ContactModal() {
  const t = useTranslate();
  const isOpen = useUiStore((state) => state.isContactOpen);
  const closeContact = useUiStore((state) => state.closeContact);
  const [isSent, setIsSent] = useState(false);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(next) => {
        if (!next) closeContact();
      }}
    >
      {/* A full-height sheet on a phone and a centred card from `md` up. Centring it on a small
          screen puts its foot under the browser toolbar, where the submit button cannot be
          reached — the containing block of a fixed element is the large viewport, not the visible
          one. */}
      <DialogContent
        aria-describedby={undefined}
        className="md:max-w-form md:inset-auto md:top-1/2 md:left-1/2 md:h-auto md:w-full md:-translate-1/2"
      >
        <div className="border-line section-gutter flex items-center justify-between gap-4 border-b py-4">
          <DialogTitle>{t('form.title')}</DialogTitle>
          <DialogClose
            aria-label={t('form.close')}
            className="border-line text-text-muted hover:border-line-strong hover:text-text flex size-11 cursor-pointer items-center justify-center border transition-colors duration-(--dur-fast)"
          >
            <span aria-hidden="true">✕</span>
          </DialogClose>
        </div>

        {/* Only the body scrolls, so the title and the close button never scroll out of reach. */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          {isSent ? (
            <div className="section-gutter flex flex-col items-start gap-4 py-16">
              <Eyebrow tone="accent">{t('form.successEyebrow')}</Eyebrow>
              <p className="display text-display-lg">{t('form.successTitle')}</p>
              <p className="text-text-muted max-w-copy">{t('form.successCopy')}</p>
              <CtaButton
                variant="ghost"
                onClick={() => {
                  setIsSent(false);
                }}
              >
                {t('form.sendAnother')}
              </CtaButton>
            </div>
          ) : (
            <ContactForm
              onSent={() => {
                setIsSent(true);
              }}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
