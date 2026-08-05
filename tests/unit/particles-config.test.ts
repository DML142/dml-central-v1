import { describe, expect, it } from 'vitest';

import { PARTICLE_PROFILES, resolveFieldBounds, resolveProfileName } from '@/config/particles';

describe('resolveProfileName', () => {
  it('takes the mobile budget below the md breakpoint', () => {
    expect(resolveProfileName({ width: 320, cores: 8 })).toBe('mobile');
    expect(resolveProfileName({ width: 743, cores: 16 })).toBe('mobile');
  });

  it('takes the tablet budget between md and xl', () => {
    expect(resolveProfileName({ width: 744, cores: 8 })).toBe('tablet');
    expect(resolveProfileName({ width: 1279, cores: 8 })).toBe('tablet');
  });

  it('takes the desktop budget from xl up', () => {
    expect(resolveProfileName({ width: 1280, cores: 8 })).toBe('desktop');
    expect(resolveProfileName({ width: 1920, cores: 8 })).toBe('desktop');
  });

  it('drops a wide but weak device to the mobile budget', () => {
    expect(resolveProfileName({ width: 1920, cores: 4 })).toBe('mobile');
  });

  it('does not read an unreported core count as weak', () => {
    expect(resolveProfileName({ width: 1920 })).toBe('desktop');
    expect(resolveProfileName({ width: 1920, cores: undefined })).toBe('desktop');
  });
});

describe('resolveFieldBounds', () => {
  it('lands on the 24 x 14 x 12 of tech.md 5.2 at a widescreen aspect', () => {
    const bounds = resolveFieldBounds(16 / 9);

    // Within 5%: the spec's numbers are the widescreen case of this derivation, not a second source.
    expect(Math.abs(bounds.width / 24 - 1)).toBeLessThan(0.05);
    expect(Math.abs(bounds.height / 14 - 1)).toBeLessThan(0.05);
    expect(bounds.depth).toBe(12);
  });

  it('narrows the volume with the viewport so a portrait phone sees all of it', () => {
    const portrait = resolveFieldBounds(0.5);
    const landscape = resolveFieldBounds(2);

    expect(portrait.width).toBeLessThan(landscape.width);
    expect(portrait.height).toBe(landscape.height);
    expect(portrait.width / portrait.height).toBeCloseTo(0.5, 5);
  });
});

describe('PARTICLE_PROFILES', () => {
  it('keeps every budget within its own segment cap', () => {
    for (const profile of Object.values(PARTICLE_PROFILES)) {
      const worstCase = (profile.count * (profile.count - 1)) / 2;

      expect(profile.maxSegments).toBeLessThan(worstCase);
      expect(profile.dpr[0]).toBeLessThanOrEqual(profile.dpr[1]);
      expect(profile.damping).toBeLessThan(1);
    }
  });
});
