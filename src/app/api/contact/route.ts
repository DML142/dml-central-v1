import { NextResponse } from 'next/server';

import { translate } from '@/content/i18n';
import { env } from '@/lib/env';
import { SITE_URL } from '@/lib/public-env';
import { RateLimiter } from '@/lib/rate-limit';
import { TelegramClient } from '@/lib/telegram/client';
import { buildContactMessage } from '@/lib/telegram/message-template';
import { createContactSchema, type ContactResponse } from '@/lib/validation/contact';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 3;

const rateLimiter = new RateLimiter({ windowMs: RATE_LIMIT_WINDOW_MS, max: RATE_LIMIT_MAX });
const telegramClient = new TelegramClient({
  token: env.TELEGRAM_BOT_TOKEN,
  chatId: env.TELEGRAM_CHAT_ID,
});
const schema = createContactSchema((key, vars) => translate('en', key, vars));

function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  return forwardedFor?.split(',')[0]?.trim() || 'unknown';
}

function fieldErrors(issues: { path: PropertyKey[]; message: string }[]): Record<string, string> {
  const fields: Record<string, string> = {};

  for (const issue of issues) {
    const field = issue.path[0];
    if (typeof field === 'string' && !(field in fields)) {
      fields[field] = issue.message;
    }
  }

  return fields;
}

export async function POST(request: Request): Promise<NextResponse<ContactResponse>> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'validation', fields: {} }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: 'validation', fields: fieldErrors(parsed.error.issues) },
      { status: 400 },
    );
  }

  const ip = getClientIp(request);
  const { allowed, retryAfterMs } = rateLimiter.check(ip);
  if (!allowed) {
    const retryAfter = Math.ceil(retryAfterMs / 1000);
    return NextResponse.json(
      { ok: false, error: 'rate_limited', retryAfter },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } },
    );
  }

  const message = buildContactMessage(
    {
      name: parsed.data.name,
      email: parsed.data.email,
      telegram: parsed.data.telegram,
      message: parsed.data.message,
    },
    { timestamp: new Date(), sourceUrl: SITE_URL },
  );

  try {
    await telegramClient.send(message);
  } catch (error) {
    console.error('contact: telegram delivery failed', error);
    return NextResponse.json({ ok: false, error: 'delivery' }, { status: 502 });
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
