import { z } from 'zod';

// Pinning the protocol is what rejects `localhost:3000`, which otherwise parses as a URL with
// the scheme `localhost:`. The hostname stays unconstrained so local development works.
export const siteUrlSchema = z.url({ protocol: /^https?$/ });

const DEV_SITE_URL = 'http://localhost:3000';

/**
 * Reads the one public variable the document metadata needs. It falls back to the development
 * origin when unset, so a checkout builds without an `.env`, but a malformed value still throws.
 * Kept apart from `env.ts` because that module also demands the Telegram credentials, which
 * nothing outside the phase 7 route handler should be able to block a build on.
 */
export function parseSiteUrl(source: Record<string, string | undefined>): string {
  const result = siteUrlSchema.default(DEV_SITE_URL).safeParse(source.NEXT_PUBLIC_SITE_URL);

  if (!result.success) {
    throw new Error('Invalid environment: NEXT_PUBLIC_SITE_URL must be an absolute http(s) URL');
  }

  return result.data;
}

export const SITE_URL = parseSiteUrl(process.env);
