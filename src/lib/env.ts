import { z } from 'zod';

const envSchema = z.object({
  TELEGRAM_BOT_TOKEN: z.string().min(1),
  TELEGRAM_CHAT_ID: z.string().min(1),
  // Pinning the protocol is what rejects `localhost:3000`, which otherwise parses as a URL with
  // the scheme `localhost:`. The hostname stays unconstrained so local development works.
  NEXT_PUBLIC_SITE_URL: z.url({ protocol: /^https?$/ }),
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
