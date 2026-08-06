'use client';

import { useEffect } from 'react';

import { CtaButton } from '@/components/common/CtaButton';
import { Eyebrow } from '@/components/common/Eyebrow';

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

// Rendered before the locale is known, same reasoning as metadata (tech.md 19.4) — English only.
// The message stays generic: the real error is logged, never shown (tech.md 6.8).
export default function Error({ error, reset }: Props) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="section-gutter flex flex-col items-start gap-6 py-24">
      <Eyebrow tone="accent">Something broke</Eyebrow>
      <p className="text-text-muted max-w-copy">
        That was not supposed to happen. Try again, or come back later.
      </p>
      <CtaButton
        onClick={() => {
          reset();
        }}
      >
        Try again
      </CtaButton>
    </section>
  );
}
