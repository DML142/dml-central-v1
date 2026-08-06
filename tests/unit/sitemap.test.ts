import { describe, expect, it } from 'vitest';

import sitemap from '@/app/sitemap';

describe('sitemap', () => {
  it('lists the single route with a recent lastModified date', () => {
    const [entry] = sitemap();

    expect(entry).toMatchObject({
      url: 'http://localhost:3000',
      changeFrequency: 'monthly',
      priority: 1,
    });
    expect(entry?.lastModified).toBeInstanceOf(Date);
  });
});
