import { z } from 'zod';

import { siteUrlSchema } from '@/lib/public-env';

const envSchema = z.object({
  TELEGRAM_BOT_TOKEN: z.string().min(1),
  TELEGRAM_CHAT_ID: z.string().min(1),
  NEXT_PUBLIC_SITE_URL: siteUrlSchema,
});

export type Env = z.infer<typeof envSchema>;

export function parseEnv(source: Record<string, string | undefined>): Env {
  const result = envSchema.safeParse(source);

  if (!result.success) {
    // Names the variable rather than quoting the value, so nothing secret reaches a log.
    const details = result.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ');

    throw new Error(`Invalid environment: ${details}`);
  }

  return result.data;
}

// Evaluated on import so a misconfigured deployment fails at boot rather than at the first form
// submission. Server modules only — importing this from a client component would leak the token.
export const env = parseEnv(process.env);
