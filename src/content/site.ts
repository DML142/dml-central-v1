import type { TranslationKey } from '@/content/i18n';

export const SITE = {
  brand: 'DML',
  domain: 'dml-central.dev',
  // Metadata is served before the locale is known, so it stays in the English source (tech.md 19.4).
  title: 'DML — Full-stack engineer',
  description: 'Next.js, NestJS and Docker fullstack developer. Creative sites that actually work.',
} as const;

export interface RailLink {
  id: string;
  labelKey: TranslationKey;
  href: string;
}

export const RAIL_LINKS: RailLink[] = [
  { id: 'github', labelKey: 'rail.github', href: 'https://github.com/DML142' },
  { id: 'telegram', labelKey: 'rail.telegram', href: 'https://t.me/volnowan' },
  { id: 'email', labelKey: 'rail.email', href: 'mailto:demolovfennec@gmail.com' },
];

export const RAIL_META_KEYS: TranslationKey[] = ['rail.meta1', 'rail.meta2', 'rail.meta3'];

export interface Step {
  index: string;
  titleKey: TranslationKey;
  textKey: TranslationKey;
}

export const STEPS: Step[] = [
  { index: '01', titleKey: 'step1.title', textKey: 'step1.text' },
  { index: '02', titleKey: 'step2.title', textKey: 'step2.text' },
  { index: '03', titleKey: 'step3.title', textKey: 'step3.text' },
];

export interface AboutFact {
  id: string;
  labelKey: TranslationKey;
  valueKey: TranslationKey;
}

export const ABOUT_FACTS: AboutFact[] = [
  { id: 'age', labelKey: 'about.age.label', valueKey: 'about.age.value' },
  { id: 'based', labelKey: 'about.based.label', valueKey: 'about.based.value' },
  { id: 'languages', labelKey: 'about.languages.label', valueKey: 'about.languages.value' },
  { id: 'node', labelKey: 'about.node.label', valueKey: 'about.node.value' },
  { id: 'before', labelKey: 'about.before.label', valueKey: 'about.before.value' },
];
