import { en, type Dictionary, type TranslationKey } from './en';
import { ru } from './ru';
import { uk } from './uk';

export type { Dictionary, TranslationKey };

export const LOCALES = ['en', 'uk', 'ru'] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'en';

export const LOCALE_LABELS: Record<Locale, string> = {
  en: 'EN',
  uk: 'UA',
  ru: 'RU',
};

const DICTIONARIES: Record<Locale, Dictionary> = { en, uk, ru };

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}

export function getDictionary(locale: Locale): Dictionary {
  return DICTIONARIES[locale];
}

/**
 * Resolves one key for one locale. `vars` fills `{name}` placeholders; a placeholder with no
 * matching variable is left in the string rather than blanked, so a missing value is visible
 * instead of silently dropping a sentence.
 */
export function translate(
  locale: Locale,
  key: TranslationKey,
  vars?: Record<string, string | number>,
): string {
  const value = DICTIONARIES[locale][key];

  if (!vars) return value;

  return value.replace(/\{(\w+)\}/g, (placeholder, name: string) => {
    const replacement = vars[name];
    return replacement === undefined ? placeholder : String(replacement);
  });
}
