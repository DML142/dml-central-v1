import Link from 'next/link';

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
      <Link
        href="/"
        className="micro border-violet bg-violet text-void hover:border-violet-bright hover:bg-violet-bright inline-flex min-h-11 items-center gap-6 border px-(--cta-pad-x) py-3 font-medium no-underline transition-colors duration-(--dur-fast)"
      >
        Back home
        <span aria-hidden="true">→</span>
      </Link>
    </section>
  );
}
