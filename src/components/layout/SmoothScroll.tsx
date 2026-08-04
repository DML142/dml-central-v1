'use client';

import { useEffect, useState } from 'react';

import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';
import { useProjectsStore } from '@/stores/projects-store';
import { useUiStore } from '@/stores/ui-store';

type Scroller = { stop: () => void; start: () => void };

/**
 * Lenis driven off the GSAP ticker, so there is one animation clock on the page and ScrollTrigger
 * stays in step with the smoothed position. ScrollSmoother was tried first, as tech.md 9.1 asks;
 * see docs/adr/0001-smooth-scroll-library.md for why it could not stay.
 *
 * Renders nothing: Lenis scrolls the real window and needs no wrapper element.
 */
export function SmoothScroll() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const isContactOpen = useUiStore((state) => state.isContactOpen);
  const openProjectId = useProjectsStore((state) => state.openProjectId);
  const [scroller, setScroller] = useState<Scroller | null>(null);

  useEffect(() => {
    if (prefersReducedMotion) return;

    let cancelled = false;
    let dispose: (() => void) | undefined;

    const start = async () => {
      const [{ default: gsap }, { ScrollTrigger }, { default: Lenis }] = await Promise.all([
        import('gsap'),
        import('gsap/ScrollTrigger'),
        import('lenis'),
      ]);

      if (cancelled) return;

      gsap.registerPlugin(ScrollTrigger);

      const lenis = new Lenis({ duration: 1.05, smoothWheel: true, syncTouch: false });
      const tick = (time: number) => {
        lenis.raf(time * 1000);
      };

      lenis.on('scroll', () => {
        ScrollTrigger.update();
      });
      gsap.ticker.add(tick);
      // A stalled tab must not make GSAP skip the catch-up frame Lenis needs.
      gsap.ticker.lagSmoothing(0);

      setScroller(lenis);

      dispose = () => {
        gsap.ticker.remove(tick);
        gsap.ticker.lagSmoothing(500, 33);
        lenis.destroy();
      };
    };

    void start();

    return () => {
      cancelled = true;
      dispose?.();
      setScroller(null);
    };
  }, [prefersReducedMotion]);

  // A modal owns the scroll while it is open, so the smoother must not fight Radix's scroll lock.
  useEffect(() => {
    if (!scroller) return;
    if (isContactOpen || openProjectId !== null) scroller.stop();
    else scroller.start();
  }, [scroller, isContactOpen, openProjectId]);

  return null;
}
