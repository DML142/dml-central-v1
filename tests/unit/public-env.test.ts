import { describe, expect, it } from 'vitest';

import { parseSiteUrl } from '@/lib/public-env';

describe('parseSiteUrl', () => {
  it('returns the configured origin', () => {
    expect(parseSiteUrl({ NEXT_PUBLIC_SITE_URL: 'https://example.com' })).toBe(
      'https://example.com',
    );
  });

  it('falls back to the development origin when unset', () => {
    expect(parseSiteUrl({})).toBe('http://localhost:3000');
  });

  it('rejects a value that is not an absolute http url', () => {
    expect(() => parseSiteUrl({ NEXT_PUBLIC_SITE_URL: 'localhost:3000' })).toThrow(
      /NEXT_PUBLIC_SITE_URL/,
    );
  });

  it('rejects an empty value rather than falling back', () => {
    expect(() => parseSiteUrl({ NEXT_PUBLIC_SITE_URL: '' })).toThrow(/NEXT_PUBLIC_SITE_URL/);
  });
});
