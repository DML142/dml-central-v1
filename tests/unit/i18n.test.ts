import { describe, expect, it } from 'vitest';

import { DEFAULT_LOCALE, getDictionary, isLocale, LOCALES, translate } from '@/content/i18n';
import { en } from '@/content/i18n/en';
import { ru } from '@/content/i18n/ru';
import { uk } from '@/content/i18n/uk';

const KEYS = Object.keys(en) as (keyof typeof en)[];

describe('dictionaries', () => {
  it('ships three locales with English as the default', () => {
    expect(LOCALES).toEqual(['en', 'uk', 'ru']);
    expect(DEFAULT_LOCALE).toBe('en');
  });

  it.each([
    ['uk', uk],
    ['ru', ru],
  ])('%s covers every English key', (_locale, dictionary) => {
    expect(Object.keys(dictionary).sort()).toEqual(KEYS.slice().sort());
  });

  it.each(LOCALES)('%s has no empty value', (locale) => {
    const empty = Object.entries(getDictionary(locale)).filter(([, value]) => value.trim() === '');
    expect(empty).toEqual([]);
  });

  it.each([
    ['uk', uk],
    ['ru', ru],
  ])('%s carries the same placeholders as English', (_locale, dictionary) => {
    const placeholders = (value: string) => (value.match(/\{\w+\}/g) ?? []).sort();

    for (const key of KEYS) {
      expect(placeholders(dictionary[key]), key).toEqual(placeholders(en[key]));
    }
  });

  it('writes проєкт, not проект, in Ukrainian', () => {
    const offenders = Object.entries(uk).filter(([, value]) => /проект/i.test(value));
    expect(offenders).toEqual([]);
  });
});

describe('isLocale', () => {
  it.each(LOCALES)('accepts %s', (locale) => {
    expect(isLocale(locale)).toBe(true);
  });

  it.each([['de'], [''], ['EN'], [null], [undefined], [42]])('rejects %o', (value) => {
    expect(isLocale(value)).toBe(false);
  });
});

describe('translate', () => {
  it('returns the value for the requested locale', () => {
    expect(translate('en', 'projects.title')).toBe('Projects');
    expect(translate('uk', 'projects.title')).toBe('Проєкти');
    expect(translate('ru', 'projects.title')).toBe('Проекты');
  });

  it('fills placeholders', () => {
    expect(translate('en', 'gallery.title', { project: 'COS Code' })).toBe('COS Code — gallery');
    expect(translate('en', 'gallery.announce', { n: 3 })).toBe('Image 3');
  });

  it('leaves an unmatched placeholder in place rather than blanking it', () => {
    expect(translate('en', 'gallery.title', { other: 'x' })).toBe('{project} — gallery');
  });

  it('does not touch the string when no variables are passed', () => {
    expect(translate('en', 'gallery.title')).toBe('{project} — gallery');
  });
});
