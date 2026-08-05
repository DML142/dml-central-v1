/** Mirrors the `--dur-*` and `--ease-*` tokens in `globals.css` (tech.md 4.3). */
export const DURATION = {
  fast: 0.16,
  base: 0.32,
  slow: 0.64,
  reveal: 0.9,
} as const;

export const EASE = {
  out: 'cubic-bezier(0.16, 1, 0.3, 1)',
  inOut: 'cubic-bezier(0.65, 0, 0.35, 1)',
} as const;

/**
 * The same two curves as SVG cubic paths, which is the form GSAP's `CustomEase` reads. A CSS
 * `cubic-bezier()` string means nothing to GSAP, and the nearest built-in ease is a different
 * curve — the page would then move at two speeds depending on who drove the animation.
 */
export const EASE_PATH = {
  out: 'M0,0 C0.16,1 0.3,1 1,1',
  inOut: 'M0,0 C0.65,0 0.35,1 1,1',
} as const;

export const REVEAL = {
  offsetY: 24,
  stagger: 0.06,
  start: 'top 85%',
} as const;

/** Per-character reveal. Fast enough to read as typing rather than as a list arriving. */
export const TYPE = {
  stagger: 0.028,
} as const;

/**
 * Gap between consecutive blocks of the load sequence, which runs on no trigger at all. Kept short
 * on purpose: the headline is the largest paint on the page, and every block queued ahead of it
 * is time added to LCP.
 */
export const SEQUENCE = {
  step: 0.08,
  /**
   * How long CSS holds a load-sequence block back waiting for the runtime. Mirrors the
   * `reveal-standby` animation in `globals.css` and must not drift from it.
   *
   * It is a ceiling on how long the hero can be untouchable, because a clipped block takes no
   * clicks — so it is short, and the runtime checks it: arriving after the block has already shown
   * itself, it leaves it alone rather than pulling back something the reader is looking at.
   */
  standby: 0.7,
} as const;
