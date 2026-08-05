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
   * It has to outlast the chunk the runtime lives in, or the sequence is skipped and the hero
   * never plays — cut to 0.7s it lost that race on a dev server every time. It is also a ceiling
   * on how long the hero can be untouchable, since a clipped block takes no clicks, so it does not
   * grow past this. The runtime checks itself against it: arriving after the block has already
   * shown itself, it leaves it alone rather than pulling back what the reader is looking at.
   */
} as const;

/**
 * How long the inline hold in the root layout waits before showing the load sequence itself. It is
 * a failsafe, not a schedule: the runtime normally clears the hold the moment it takes over, and
 * this only runs out when scripting is on but the runtime chunk never arrived.
 */
export const MOTION_HOLD_MS = 4000;
