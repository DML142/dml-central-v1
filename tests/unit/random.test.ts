import { describe, expect, it } from 'vitest';

import { createRandom } from '@/lib/random';

describe('createRandom', () => {
  it('repeats the same sequence for the same seed', () => {
    const first = createRandom(20260804);
    const second = createRandom(20260804);

    const a = Array.from({ length: 32 }, () => first());
    const b = Array.from({ length: 32 }, () => second());

    expect(a).toEqual(b);
  });

  it('diverges between seeds', () => {
    const a = createRandom(1);
    const b = createRandom(2);

    expect(a()).not.toBe(b());
  });

  it('stays inside the unit interval', () => {
    const random = createRandom(7);

    for (let i = 0; i < 5000; i += 1) {
      const value = random();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });
});
