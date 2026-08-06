import { PERSON, RAIL_LINKS, SITE } from '@/content/site';

const SOCIAL_LINK_IDS = ['github', 'telegram'];

export function buildPersonJsonLd(siteUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: PERSON.name,
    jobTitle: PERSON.jobTitle,
    url: siteUrl,
    nationality: PERSON.nationality,
    knowsLanguage: PERSON.languages,
    sameAs: RAIL_LINKS.filter((link) => SOCIAL_LINK_IDS.includes(link.id)).map((link) => link.href),
  };
}

export function buildWebsiteJsonLd(siteUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE.brand,
    url: siteUrl,
    description: SITE.description,
  };
}
