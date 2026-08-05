'use client';

import dynamic from 'next/dynamic';

// `await import()` inside the effect was not enough: the bundler folded GSAP and Lenis into the
// shared chunk because the components themselves were statically imported. Splitting at the
// component keeps both out of the initial payload, which is also what tech.md 6.2 asks for.
const SmoothScroll = dynamic(
  () => import('@/components/layout/SmoothScroll').then((module) => module.SmoothScroll),
  { ssr: false },
);

const SectionReveals = dynamic(
  () => import('@/components/layout/SectionReveals').then((module) => module.SectionReveals),
  { ssr: false },
);

/** The whole motion layer, and the only place it is mounted. Renders nothing. */
export function MotionHost() {
  return (
    <>
      <SmoothScroll />
      <SectionReveals />
    </>
  );
}
