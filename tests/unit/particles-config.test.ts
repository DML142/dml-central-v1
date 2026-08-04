import { describe, expect, it } from 'vitest';

import { PARTICLE_PROFILES, resolveProfileName } from '@/config/particles';

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
