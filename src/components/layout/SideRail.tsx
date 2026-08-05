'use client';

import { Eyebrow } from '@/components/common/Eyebrow';
import { RAIL_LINKS, RAIL_META_KEYS, SITE } from '@/content/site';
import { useTranslate } from '@/hooks/use-translate';

export function SideRail() {
  const t = useTranslate();

  return (
    <div className="border-line section-gutter flex flex-wrap items-center justify-between gap-4 border-b py-4 lg:sticky lg:top-(--frame-inset) lg:h-(--rail-height) lg:flex-col lg:items-stretch lg:justify-start lg:self-start lg:border-r lg:border-b-0 lg:py-6">
      <a
        href="#main"
        className="font-display text-brand text-violet inline-flex min-h-11 items-center leading-none uppercase no-underline"
      >
        {SITE.brand}
      </a>

      <p className="micro text-text-faint hidden lg:mt-4 lg:block">
        {RAIL_META_KEYS.map((metaKey) => (
          <span key={metaKey} className="block">
            {t(metaKey)}
          </span>
        ))}
      </p>

      <nav
        aria-label={t('nav.elsewhere')}
        className="flex flex-wrap gap-2 lg:mt-auto lg:flex-col lg:gap-0"
      >
        {RAIL_LINKS.map((link) => (
          <a
            key={link.id}
            href={link.href}
            rel="noreferrer noopener"
            className="border-line text-text-muted hover:border-line-strong hover:text-text flex min-h-11 items-center justify-between gap-3 border px-3 py-2 no-underline transition-colors duration-(--dur-fast) lg:border-t-0 lg:first:border-t"
          >
            <Eyebrow tone="muted">{t(link.labelKey)}</Eyebrow>
            <span aria-hidden="true" className="text-text-faint">
              ↗
            </span>
          </a>
        ))}
      </nav>
    </div>
  );
}
