import { isLocale, type Locale } from '@/content/i18n';

const STORAGE_KEY = 'dml-central.locale';

/** Returns `null` when nothing is stored, the value is not a known locale, or storage is blocked. */
export function readStoredLocale(): Locale | null {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return isLocale(stored) ? stored : null;
  } catch {
    // Safari in private mode throws on any localStorage access.
    return null;
  }
}

/** Returns `false` when storage is unavailable, so the caller can tell persistence from success. */
export function writeStoredLocale(locale: Locale): boolean {
  try {
    window.localStorage.setItem(STORAGE_KEY, locale);
    return true;
  } catch {
    return false;
  }
}
