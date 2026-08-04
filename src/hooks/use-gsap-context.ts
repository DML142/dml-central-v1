'use client';

import gsap from 'gsap';
import { useEffect, type DependencyList, type RefObject } from 'react';

/**
 * Runs `setup` inside a `gsap.context` and reverts it on unmount or when the dependencies change.
 * Every tween, ScrollTrigger and inline style the callback creates is undone by the revert, which
 * is the only way a GSAP animation is allowed to exist in this codebase.
 */
export function useGsapContext(
  setup: (context: gsap.Context) => void,
  scope?: RefObject<HTMLElement | null>,
  deps: DependencyList = [],
): void {
  useEffect(() => {
    const context = gsap.context(setup, scope?.current ?? undefined);
    return () => {
      context.revert();
    };
    // The caller owns the dependency list; `setup` is expected to be stable or listed in it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
