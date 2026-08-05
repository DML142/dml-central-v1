import type { TranslationKey } from '@/content/i18n';

export interface StackItem {
  id: string;
  /** Technology name. Never translated (tech.md 19.1). */
  label: string;
  version?: string;
  /** Basename of a mark in `public/icons/stack/`. Absent when the brand has none worth 14px. */
  iconId?: string;
}

export interface StackCategory {
  id: string;
  index: string;
  nameKey: TranslationKey;
  items: StackItem[];
}
