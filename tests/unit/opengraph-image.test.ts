import { describe, expect, it } from 'vitest';

import { alt, contentType, size } from '@/app/opengraph-image';

describe('opengraph-image', () => {
  it('declares the standard OG card dimensions and the site title as alt text', () => {
    expect(size).toEqual({ width: 1200, height: 630 });
    expect(contentType).toBe('image/png');
    expect(alt).toBe('DML — Full-stack engineer');
  });
});
