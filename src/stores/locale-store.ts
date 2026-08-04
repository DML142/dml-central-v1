import { create } from 'zustand';

import { DEFAULT_LOCALE, type Locale } from '@/content/i18n';
import { readStoredLocale, writeStoredLocale } from '@/lib/locale-storage';

interface LocaleState {
  locale: Locale;
  /** An explicit switch by the reader. Persists the choice. */
  setLocale: (locale: Locale) => void;
  /** Reapplies a previously stored choice after mount. Does not write back. */
  restoreLocale: () => void;
}

export const useLocaleStore = create<LocaleState>((set) => ({
  locale: DEFAULT_LOCALE,
  setLocale: (locale) => {
    set({ locale });
    writeStoredLocale(locale);
  },
  restoreLocale: () => {
    const stored = readStoredLocale();
    if (stored) set({ locale: stored });
  },
}));
