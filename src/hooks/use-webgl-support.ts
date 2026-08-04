'use client';

import { useSyncExternalStore } from 'react';

let support: boolean | undefined;

function detect(): boolean {
  if (support === undefined) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('webgl2') ?? canvas.getContext('webgl');

    // The probe holds a context against the browser's limit until it is explicitly released.
    context?.getExtension('WEBGL_lose_context')?.loseContext();
    support = context !== null;
  }

  return support;
}

const subscribe = () => () => {};

/** `false` on the server and through hydration, so nothing mounts a canvas ahead of the probe. */
export function useWebglSupport(): boolean {
  return useSyncExternalStore(subscribe, detect, () => false);
}
