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

export const REVEAL = {
  offsetY: 24,
  stagger: 0.06,
  start: 'top 85%',
} as const;
