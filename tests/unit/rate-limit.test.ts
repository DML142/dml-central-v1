import { describe, expect, it } from 'vitest';

import { RateLimiter } from '@/lib/rate-limit';

describe('RateLimiter', () => {
  it('allows requests up to the configured maximum', () => {
    const limiter = new RateLimiter({ windowMs: 10_000, max: 3 });
    const now = 1_000_000;

    expect(limiter.check('ip-1', now).allowed).toBe(true);
    expect(limiter.check('ip-1', now).allowed).toBe(true);
    expect(limiter.check('ip-1', now).allowed).toBe(true);
  });

  it('rejects the request past the maximum within the window', () => {
    const limiter = new RateLimiter({ windowMs: 10_000, max: 3 });
    const now = 1_000_000;

    limiter.check('ip-1', now);
    limiter.check('ip-1', now);
    limiter.check('ip-1', now);
    const fourth = limiter.check('ip-1', now);

    expect(fourth.allowed).toBe(false);
    expect(fourth.retryAfterMs).toBeGreaterThan(0);
  });

  it('reports how long until the oldest hit leaves the window', () => {
    const limiter = new RateLimiter({ windowMs: 10_000, max: 1 });
    const now = 1_000_000;

    limiter.check('ip-1', now);
    const second = limiter.check('ip-1', now + 4_000);

    expect(second.retryAfterMs).toBe(6_000);
  });

  it('allows again once the window has slid past the earlier hits', () => {
    const limiter = new RateLimiter({ windowMs: 10_000, max: 1 });
    const now = 1_000_000;

    limiter.check('ip-1', now);
    const afterWindow = limiter.check('ip-1', now + 10_001);

    expect(afterWindow.allowed).toBe(true);
  });

  it('tracks each key independently', () => {
    const limiter = new RateLimiter({ windowMs: 10_000, max: 1 });
    const now = 1_000_000;

    limiter.check('ip-1', now);
    const other = limiter.check('ip-2', now);

    expect(other.allowed).toBe(true);
  });
});
