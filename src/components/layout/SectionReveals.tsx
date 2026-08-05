'use client';

import { useEffect } from 'react';

import { DURATION, EASE_PATH, REVEAL } from '@/config/motion';
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';
import { planReveals, type RevealVariant } from '@/lib/motion/reveal-plan';

type RevealState = Record<string, number | string>;

const REVEAL_EASE = 'reveal-out';

const FROM: Record<RevealVariant, RevealState> = {
  fade: { opacity: 0, y: REVEAL.offsetY },
  wipe: { clipPath: 'inset(0 100% 0 0)' },
};

const TO: Record<RevealVariant, RevealState> = {
  fade: { opacity: 1, y: 0 },
  wipe: { clipPath: 'inset(0 0% 0 0)' },
};

/**
 * Builds one ScrollTrigger per `[data-reveal]` block. Nothing is hidden in CSS: the initial state
 * is set here, so a visitor whose motion is off or whose JavaScript failed reads a finished page.
 *
 * Rendered through `next/dynamic`, and GSAP is imported past the reduced-motion guard, so a
 * visitor who gets no reveals also downloads none of the machinery (see SmoothScroll).
 */
export function SectionReveals() {
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) return;

    let cancelled = false;
    let dispose: (() => void) | undefined;

    const start = async () => {
      const [{ default: gsap }, { ScrollTrigger }, { CustomEase }] = await Promise.all([
        import('gsap'),
        import('gsap/ScrollTrigger'),
        import('gsap/CustomEase'),
      ]);

      if (cancelled) return;

      gsap.registerPlugin(ScrollTrigger, CustomEase);
      CustomEase.create(REVEAL_EASE, EASE_PATH.out);

      const context = gsap.context(() => {
        for (const plan of planReveals(document)) {
          gsap.set(plan.targets, FROM[plan.variant]);
          gsap.to(plan.targets, {
            ...TO[plan.variant],
            duration: DURATION.reveal,
            ease: REVEAL_EASE,
            stagger: REVEAL.stagger,
            scrollTrigger: { trigger: plan.trigger, start: REVEAL.start, once: true },
          });
        }
      });

      // A trigger measures the page once. Late fonts, a locale switch and an opening accordion
      // panel all move the sections under it, and a stale start line reveals a block nobody has
      // scrolled to yet.
      let frame = 0;
      let measured = document.body.offsetHeight;

      const refresh = () => {
        if (cancelled) return;
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => {
          measured = document.body.offsetHeight;
          ScrollTrigger.refresh();
        });
      };

      void document.fonts?.ready.then(refresh);

      // Height only. A modal's scroll lock takes the scrollbar away, which changes the body's
      // width — refreshing on that would remeasure the whole page in the one frame a dialog is
      // opening, against a layout that goes back the moment it closes.
      const observer = new ResizeObserver(() => {
        if (document.body.offsetHeight !== measured) refresh();
      });
      observer.observe(document.body);

      dispose = () => {
        cancelAnimationFrame(frame);
        observer.disconnect();
        context.revert();
      };
    };

    void start();

    return () => {
      cancelled = true;
      dispose?.();
    };
  }, [prefersReducedMotion]);

  return null;
}
