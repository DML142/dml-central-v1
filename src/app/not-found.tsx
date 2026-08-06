import { CtaButton } from '@/components/common/CtaButton';
import { Eyebrow } from '@/components/common/Eyebrow';

// Rendered before the locale is known, same reasoning as metadata (tech.md 19.4) — English only.
export default function NotFound() {
  return (
    <section className="section-gutter flex flex-col items-start gap-6 py-24">
      <span className="display text-display-xl text-text-faint leading-none">404</span>
      <Eyebrow tone="accent">Page not found</Eyebrow>
      <p className="text-text-muted max-w-copy">
        There is nothing at this address. The rest of the page still works.
      </p>
      <CtaButton href="/">Back home</CtaButton>
    </section>
  );
}
