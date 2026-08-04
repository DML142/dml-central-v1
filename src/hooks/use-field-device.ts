'use client';

import { useSyncExternalStore } from 'react';

import { randomFieldSeed, resolveProfileName, type ProfileName } from '@/config/particles';
import { readColorToken } from '@/lib/theme-token';

export interface FieldDevice {
  profileName: ProfileName;
  color: string;
  seed: number;
}

let device: FieldDevice | undefined;

/** Read once and cached: the budget does not follow a resize, and one layout lasts one page load. */
function read(): FieldDevice {
  device ??= {
    profileName: resolveProfileName({
      width: window.innerWidth,
      cores: navigator.hardwareConcurrency,
    }),
    color: readColorToken('--color-violet-bright'),
    seed: randomFieldSeed(),
  };

  return device;
}

const subscribe = () => () => {};

/** `null` on the server and through hydration; the real answer lands on the first client render. */
export function useFieldDevice(): FieldDevice | null {
  return useSyncExternalStore(subscribe, read, () => null);
}
