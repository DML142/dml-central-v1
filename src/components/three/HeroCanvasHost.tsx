'use client';

import dynamic from 'next/dynamic';

// Splitting at the component is what keeps Three out of the initial payload: an `await import()`
// inside an effect leaves the bundler folding it into the shared chunk (tech.md 5.4).
export const HeroCanvasHost = dynamic(
  () => import('@/components/three/HeroCanvas').then((module) => module.HeroCanvas),
  { ssr: false },
);
