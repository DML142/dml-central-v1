import { existsSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import { en } from '@/content/i18n/en';
import { PROJECTS, findProject } from '@/content/projects';
import { ABOUT_FACTS, RAIL_LINKS, RAIL_META_KEYS, STEPS } from '@/content/site';
import { STACK } from '@/content/stack';

const KEYS = new Set(Object.keys(en));

describe('projects', () => {
  it('lists the two projects in order, one primary and one deprecated', () => {
    expect(PROJECTS.map((p) => [p.id, p.index, p.emphasis, p.status])).toEqual([
      ['saas-ai-fullstack-portfolio', '01', 'primary', 'active'],
      ['dmls-solutions', '02', 'secondary', 'deprecated'],
    ]);
  });

  it('carries the supplied gallery counts', () => {
    expect(findProject('saas-ai-fullstack-portfolio')?.gallery).toHaveLength(13);
    expect(findProject('dmls-solutions')?.gallery).toHaveLength(5);
  });

  it('returns undefined for an unknown id', () => {
    expect(findProject('nope')).toBeUndefined();
  });

  it('resolves every translation key it references', () => {
    for (const project of PROJECTS) {
      const keys = [
        project.taglineKey,
        project.summaryKey,
        project.statusKey,
        ...project.highlightKeys,
        ...project.links.map((link) => link.labelKey),
        ...project.gallery.map((image) => image.altKey),
        ...(project.noteKey ? [project.noteKey] : []),
      ];

      for (const key of keys) expect(KEYS.has(key), `${project.id} → ${key}`).toBe(true);
    }
  });

  it('orders slides by the trailing number in the file name', () => {
    for (const project of PROJECTS) {
      const order = project.gallery.map((image) => {
        const digits = /(\d+)\.\w+$/.exec(image.src);
        return Number(digits?.[1]);
      });

      expect(order, project.id).toEqual(order.map((_, index) => index + 1));
    }
  });

  it('ships every gallery file with real dimensions', () => {
    for (const project of PROJECTS) {
      for (const image of project.gallery) {
        expect(existsSync(`public${image.src}`), image.src).toBe(true);
        expect(image.width, image.src).toBeGreaterThan(0);
        expect(image.height, image.src).toBeGreaterThan(0);
      }
    }
  });

  it('only marks the deprecated project with a note', () => {
    expect(findProject('saas-ai-fullstack-portfolio')?.noteKey).toBeUndefined();
    expect(findProject('dmls-solutions')?.noteKey).toBe('p2.note');
  });
});

describe('stack', () => {
  it('lists the six categories in order', () => {
    expect(STACK.map((category) => [category.index, category.id])).toEqual([
      ['01', 'frontend'],
      ['02', 'backend'],
      ['03', '3d-animation'],
      ['04', 'platforms'],
      ['05', 'devops'],
      ['06', 'testing'],
    ]);
  });

  it('matches the item counts in tech.md 10', () => {
    expect(STACK.map((category) => category.items.length)).toEqual([9, 10, 5, 2, 6, 6]);
  });

  it('resolves every category name key', () => {
    for (const category of STACK) expect(KEYS.has(category.nameKey), category.id).toBe(true);
  });

  it('ships a mark on disk for every declared icon', () => {
    for (const category of STACK) {
      for (const item of category.items) {
        if (!item.iconId) continue;
        expect(existsSync(`public/icons/stack/${item.iconId}.svg`), item.id).toBe(true);
      }
    }
  });

  it('declares an icon only for brands that have one', () => {
    const withIcon = STACK.flatMap((category) =>
      category.items.filter((item) => item.iconId).map((item) => item.id),
    );

    expect(withIcon).toHaveLength(21);
    // The mark is keyed by the item id, so a rename cannot silently orphan a file.
    for (const category of STACK) {
      for (const item of category.items) {
        if (item.iconId) expect(item.iconId).toBe(item.id);
      }
    }
  });

  it('keeps item ids unique inside a category', () => {
    for (const category of STACK) {
      const ids = category.items.map((item) => item.id);
      expect(new Set(ids).size, category.id).toBe(ids.length);
    }
  });
});

describe('site content', () => {
  it('resolves every key it references', () => {
    const keys = [
      ...RAIL_META_KEYS,
      ...RAIL_LINKS.map((link) => link.labelKey),
      ...STEPS.flatMap((step) => [step.titleKey, step.textKey]),
      ...ABOUT_FACTS.flatMap((fact) => [fact.labelKey, fact.valueKey]),
    ];

    for (const key of keys) expect(KEYS.has(key), key).toBe(true);
  });

  it('points the rail at the decided destinations', () => {
    expect(RAIL_LINKS.map((link) => link.href)).toEqual([
      'https://github.com/DML142',
      'https://t.me/volnowan',
      'mailto:demolovfennec@gmail.com',
    ]);
  });
});
