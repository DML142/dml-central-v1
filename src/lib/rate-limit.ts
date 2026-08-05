export interface RateLimiterConfig {
  windowMs: number;
  max: number;
}

export interface RateLimitResult {
  allowed: boolean;
  retryAfterMs: number;
}

/**
 * Sliding window over an in-memory `Map`. Best-effort on serverless: it only holds per warm
 * instance, which is what `tech.md` §7.2 accepts for v1.
 */
export class RateLimiter {
  private readonly hits = new Map<string, number[]>();

  constructor(private readonly config: RateLimiterConfig) {}

  check(key: string, now: number = Date.now()): RateLimitResult {
    const windowStart = now - this.config.windowMs;
    const timestamps = (this.hits.get(key) ?? []).filter((hit) => hit > windowStart);

    if (timestamps.length >= this.config.max) {
      this.hits.set(key, timestamps);
      const oldest = timestamps[0] ?? now;
      return { allowed: false, retryAfterMs: oldest + this.config.windowMs - now };
    }

    timestamps.push(now);
    this.hits.set(key, timestamps);
    return { allowed: true, retryAfterMs: 0 };
  }
}
