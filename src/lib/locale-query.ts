import { isLocale, type Locale } from '@/content/i18n';

const ALIASES: Record<string, Locale> = { ua: 'uk' };

/** Reads `?lang=` from a location search string. `ua` aliases to `uk` — the switcher's own label. */
export function readQueryLocale(search: string): Locale | null {
  const value = new URLSearchParams(search).get('lang')?.toLowerCase();
  if (!value) return null;
  return isLocale(value) ? value : (ALIASES[value] ?? null);
}
