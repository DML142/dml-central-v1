'use client';

import { useSyncExternalStore } from 'react';

import { resolveProfileName, type ProfileName } from '@/config/particles';
import { readColorToken } from '@/lib/theme-token';

export interface FieldDevice {
  profileName: ProfileName;
  color: string;
}

let device: FieldDevice | undefined;

/** Read once and cached: the budget does not follow a resize, and the palette never changes. */
function read(): FieldDevice {
  device ??= {
    profileName: resolveProfileName({
      width: window.innerWidth,
      cores: navigator.hardwareConcurrency,
    }),
    color: readColorToken('--color-violet-bright'),
  };

  return device;
}

const subscribe = () => () => {};

/** `null` on the server and through hydration; the real answer lands on the first client render. */
export function useFieldDevice(): FieldDevice | null {
  return useSyncExternalStore(subscribe, read, () => null);
}
