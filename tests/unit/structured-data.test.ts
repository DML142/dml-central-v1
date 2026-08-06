import { describe, expect, it } from 'vitest';

import { buildPersonJsonLd, buildWebsiteJsonLd } from '@/lib/structured-data';

describe('buildPersonJsonLd', () => {
  it('carries the schema.org Person shape with the rail social links', () => {
    expect(buildPersonJsonLd('https://example.com')).toEqual({
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: 'Maxim',
      jobTitle: 'Full-stack engineer',
      url: 'https://example.com',
      nationality: 'Ukraine',
      knowsLanguage: ['uk', 'ru', 'en'],
      sameAs: ['https://github.com/DML142', 'https://t.me/volnowan'],
    });
  });
});

describe('buildWebsiteJsonLd', () => {
  it('carries the schema.org WebSite shape', () => {
    expect(buildWebsiteJsonLd('https://example.com')).toEqual({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'DML',
      url: 'https://example.com',
      description:
        'Next.js, NestJS and Docker fullstack developer. Creative sites that actually work.',
    });
  });
});
