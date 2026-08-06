'use client';

import { useEffect } from 'react';

import { DURATION, EASE_PATH, REVEAL, SEQUENCE, TYPE } from '@/config/motion';
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';
import { useLocale } from '@/hooks/use-translate';
import { planReveals, type RevealPlan } from '@/lib/motion/reveal-plan';

// Both are ambient globals from GSAP's own declarations, so naming them costs no import.
type Gsap = GSAP;
type SplitTextClass = typeof SplitText;

const REVEAL_EASE = 'reveal-out';

/**
 * The mask is a black card sliding off to the right, so it may only ever move horizontally. The
 * vertical insets are negative on purpose: the display face is set at a leading tighter than its
 * own glyphs, so a `clip-path` flush with the border box shears the tops and tails off the
 * headline. Cleared entirely once the block has arrived — an idle clip has no business surviving
 * the animation that needed it.
 */
const WIPE_FROM = 'inset(-100% 100% -100% 0)';
const WIPE_TO = 'inset(-100% 0% -100% 0)';

/**
 * Marks a block as arrived. A reveal moves things that can be clicked — a project card carries the
 * button that opens its gallery — and until it settles the page is quietly lying about where those
 * controls are. Publishing the finish makes that observable rather than a matter of guessing at
 * durations, which is the same bargain as `data-hydrated` and `data-motion`.
 */
const markDone = (element: HTMLElement) => {
  element.dataset.revealDone = '';
};

const buildBlockReveal = (gsap: Gsap, plan: RevealPlan, delay: number, trigger: object) => {
  const isWipe = plan.variant === 'wipe';

  gsap.set(plan.targets, isWipe ? { clipPath: WIPE_FROM } : { opacity: 0, y: REVEAL.offsetY });

  gsap.to(plan.targets, {
    ...(isWipe ? { clipPath: WIPE_TO } : { opacity: 1, y: 0 }),
    duration: DURATION.reveal,
    ease: REVEAL_EASE,
    stagger: REVEAL.stagger,
    ...(plan.immediate ? { delay } : trigger),
    onComplete: () => {
      if (isWipe) gsap.set(plan.targets, { clearProps: 'clipPath' });
      markDone(plan.trigger);
    },
  });
};

/**
 * Text reveals rewrite the element into per-line or per-character pieces, so they hand the DOM back
 * the moment they finish — nothing downstream should have to know the animation happened.
 *
 * Deliberately without `autoSplit`. It would put a ResizeObserver on every cut element, eighteen of
 * them on this page, and re-cut the text on anything that changes a size — an accordion panel, a
 * dialog taking the scrollbar away, a `ScrollTrigger.refresh()`. Re-cutting a block whose reveal
 * has already finished starts it over, so the hero would replay its entrance because a modal
 * opened. The text is cut once, after the fonts have landed, which is the only re-cut that was
 * ever worth having.
 */
const buildTextReveal = (
  gsap: Gsap,
  SplitText: SplitTextClass,
  plan: RevealPlan,
  delay: number,
  trigger: object,
) => {
  const isLines = plan.variant === 'lines';
  let pending = plan.targets.length;

  for (const [index, target] of plan.targets.entries()) {
    // Each element is cut on its own, so the cascade across them has to be built here: without it
    // every line of a three-column step row would start in the same frame.
    const offset = delay + index * REVEAL.stagger;

    // `aria: 'auto'` puts the pre-split text in an `aria-label` on `target` itself. A heading
    // already has a nameable role; a bare `span`/`p` (role `generic`/`paragraph`) does not, and
    // `aria-label` there is invalid ARIA that a screen reader is free to ignore.
    if (!/^H[1-6]$/.test(target.tagName)) target.setAttribute('role', 'text');

    const split = SplitText.create(target, {
      // Words are cut alongside characters even though only the characters animate: without a
      // wrapper per word every character is its own inline box, and the browser will happily
      // break a line in the middle of one.
      type: isLines ? 'lines' : 'words,chars',
      // The mask is a clone of the line, so it inherits the line's class with a `-mask` suffix —
      // which is the only handle there is for giving the clip box room for the display face.
      ...(isLines ? { mask: 'lines', linesClass: 'reveal-line' } : {}),
      aria: 'auto',
    });

    const pieces = isLines ? split.lines : split.chars;
    if (pieces.length === 0) {
      split.revert();
      pending -= 1;
      if (pending === 0) markDone(plan.trigger);
      continue;
    }

    gsap.from(pieces, {
      ...(isLines
        ? { yPercent: 120, duration: DURATION.reveal, ease: REVEAL_EASE }
        : { visibility: 'hidden', duration: 0.01 }),
      stagger: isLines ? REVEAL.stagger : TYPE.stagger,
      ...(plan.immediate ? { delay: offset } : trigger),
      onComplete: () => {
        split.revert();
        pending -= 1;
        // Each element is cut and animated on its own, so the block has arrived only once the
        // last of them has put its text back.
        if (pending === 0) markDone(plan.trigger);
      },
    });
  }
};

/**
 * Builds the reveals declared by `[data-reveal]`. Nothing is hidden in CSS: the initial state is
 * set here, so a visitor whose motion is off or whose JavaScript failed reads a finished page.
 *
 * Rendered through `next/dynamic`, and GSAP is imported past the reduced-motion guard, so a visitor
 * who gets no reveals also downloads none of the machinery (see SmoothScroll).
 */
export function SectionReveals() {
  const prefersReducedMotion = usePrefersReducedMotion();
  // A locale switch replaces the copy. React discards the split markup with it (the sections key
  // their text reveals on the locale), so the runtime has to cut the new text afresh.
  const locale = useLocale();

  useEffect(() => {
    if (prefersReducedMotion) return;

    let cancelled = false;
    let dispose: (() => void) | undefined;

    const start = async () => {
      const [{ default: gsap }, { ScrollTrigger }, { CustomEase }, { SplitText }] =
        await Promise.all([
          import('gsap'),
          import('gsap/ScrollTrigger'),
          import('gsap/CustomEase'),
          import('gsap/SplitText'),
        ]);

      if (cancelled) return;

      gsap.registerPlugin(ScrollTrigger, CustomEase, SplitText);
      CustomEase.create(REVEAL_EASE, EASE_PATH.out);

      // The text is cut once, so it has to be cut against the face it will be set in: measuring
      // lines in the fallback font and then swapping the display face re-wraps the copy inside
      // masks that were sized for different lines.
      await document.fonts?.ready;
      if (cancelled) return;

      const context = gsap.context(() => {
        let step = 0;

        for (const plan of planReveals(document)) {
          // A rebuild (a locale switch) re-runs every reveal, so a mark left from the last pass
          // would claim the block had arrived before it moved.
          delete plan.trigger.dataset.revealDone;

          // The load sequence is ordered by the document, so the page assembles top down.
          const delay = plan.immediate ? step++ * SEQUENCE.step : 0;

          const trigger = {
            scrollTrigger: { trigger: plan.trigger, start: REVEAL.start, once: true },
          };

          if (plan.variant === 'lines' || plan.variant === 'type') {
            buildTextReveal(gsap, SplitText, plan, delay, trigger);
          } else {
            buildBlockReveal(gsap, plan, delay, trigger);
          }
        }
      });

      // Every initial state is set by now, so releasing the hold uncovers blocks that are already
      // hidden by their own reveal. One frame, nothing in between.
      delete document.documentElement.dataset.motion;

      // A trigger measures the page once. Late fonts, a locale switch and an opening accordion
      // panel all move the sections under it, and a stale start line reveals a block nobody has
      // scrolled to yet.
      let frame = 0;
      let measured = document.body.offsetHeight;

      const refresh = () => {
        if (cancelled) return;
        // A dialog owns the page while it is open, and Radix's scroll lock moves the body under
        // it. Remeasuring then costs the frame a modal is opening and measures a layout that
        // reverts on close; the height check below catches the way back (tech.md 9.2).
        if (document.querySelector('[role="dialog"]')) return;
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => {
          measured = document.body.offsetHeight;
          ScrollTrigger.refresh();
        });
      };

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
  }, [prefersReducedMotion, locale]);

  return null;
}
