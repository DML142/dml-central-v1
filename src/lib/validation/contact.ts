import { z } from 'zod';

import type { TranslationKey } from '@/content/i18n';

export const MESSAGE_MAX = 2000;
export const MESSAGE_COUNTER_AT = 0.8;
/** A human cannot read the form and fill it in under two seconds; a bot can. */
export const MIN_FILL_MS = 2000;

type Translate = (key: TranslationKey, vars?: Record<string, string | number>) => string;

/**
 * One schema for the client and, from phase 7, the route handler. Messages are injected rather than
 * baked in so the same rules can speak any of the three locales.
 */
export function createContactSchema(t: Translate) {
  return z.object({
    name: z
      .string()
      .trim()
      .min(1, t('err.nameRequired'))
      .min(2, t('err.nameShort'))
      .max(64, t('err.nameLong')),
    email: z
      .string()
      .trim()
      .min(1, t('err.emailRequired'))
      .max(254, t('err.emailLong'))
      .pipe(z.email(t('err.emailInvalid'))),
    telegram: z
      .string()
      .trim()
      .regex(/^@?[a-zA-Z0-9_]{4,32}$/, t('err.telegramInvalid'))
      .or(z.literal('')),
    message: z
      .string()
      .trim()
      .min(1, t('err.messageRequired'))
      .min(10, t('err.messageShort'))
      .max(MESSAGE_MAX, t('err.messageLong', { n: MESSAGE_MAX })),
    // Hidden from humans. A filled value is a bot, and the message is never shown.
    company: z.literal('', { error: 'rejected' }),
    startedAt: z.number().refine((value) => Date.now() - value >= MIN_FILL_MS, 'rejected'),
  });
}

export type ContactSchema = ReturnType<typeof createContactSchema>;
export type ContactInput = z.input<ContactSchema>;
export type ContactValues = z.output<ContactSchema>;
