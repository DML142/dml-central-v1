import { describe, expect, it } from 'vitest';

import robots from '@/app/robots';

describe('robots', () => {
  it('allows every crawler and points at the sitemap', () => {
    expect(robots()).toEqual({
      rules: { userAgent: '*', allow: '/' },
      sitemap: 'http://localhost:3000/sitemap.xml',
    });
  });
});
