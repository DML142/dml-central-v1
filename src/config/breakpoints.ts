/** Mirrors the `--breakpoint-*` tokens in `globals.css` (tech.md 3.2). */
export const BREAKPOINTS = {
  sm: 390,
  md: 744,
  lg: 1024,
  xl: 1280,
  '2xl': 1920,
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;
