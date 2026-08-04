import type { TranslationKey } from '@/content/i18n';

export type ProjectStatus = 'active' | 'deprecated';

export type ProjectEmphasis = 'primary' | 'secondary';

export interface ProjectLink {
  labelKey: TranslationKey;
  href: string;
  kind: 'repository' | 'live';
}

export interface ProjectImage {
  src: string;
  altKey: TranslationKey;
  width: number;
  height: number;
}

export interface Project {
  id: string;
  index: string;
  /** Product name. Never translated (tech.md 19.1). */
  title: string;
  taglineKey: TranslationKey;
  summaryKey: TranslationKey;
  highlightKeys: TranslationKey[];
  /** The line explaining why a deprecated project is still listed. */
  noteKey?: TranslationKey;
  statusKey: TranslationKey;
  /** Chip labels. Technology names are never translated (tech.md 19.1). */
  tech: string[];
  status: ProjectStatus;
  emphasis: ProjectEmphasis;
  links: ProjectLink[];
  gallery: ProjectImage[];
}
