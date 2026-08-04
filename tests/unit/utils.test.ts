import { describe, expect, it } from 'vitest';

import { cn } from '@/lib/utils';

describe('cn', () => {
  it('joins class names', () => {
    expect(cn('border', 'p-4')).toBe('border p-4');
  });

  it('drops falsy values', () => {
    expect(cn('border', false, undefined, null, '')).toBe('border');
  });

  it('lets the last conflicting utility win', () => {
    expect(cn('p-4', 'p-8')).toBe('p-8');
    expect(cn('text-text-muted', 'text-violet')).toBe('text-violet');
  });

  it('keeps utilities that only look conflicting', () => {
    expect(cn('border-line', 'border-2')).toBe('border-line border-2');
  });

  it('accepts arrays and objects', () => {
    expect(cn(['border', { 'p-4': true, 'p-8': false }])).toBe('border p-4');
  });
});
