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
      <DialogContent
        aria-describedby={undefined}
        className="max-w-form inset-auto top-1/2 left-1/2 h-auto max-h-full w-full -translate-1/2 overflow-y-auto"
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
      </DialogContent>
    </Dialog>
  );
}
