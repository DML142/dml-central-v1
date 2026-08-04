# 0001 — Smooth scroll library

Status: accepted, 2026-08-04

## Context

`tech.md` §9.1 names GSAP `ScrollSmoother` as the default choice and pre-approves `lenis` with GSAP
`ScrollTrigger` as the fallback "if integration with the fixed frame chrome or the modals proves
fragile". ScrollSmoother was implemented first and measured in a real browser.

## What ScrollSmoother did to this layout

ScrollSmoother requires a `#smooth-wrapper` / `#smooth-content` pair. It then sets:

```
#smooth-wrapper { position: fixed; inset: 0; width: 100%; height: 100%; overflow: hidden }
#smooth-content { transform: matrix3d(…, -scrollY, …) }
```

Both halves break this page:

- **The sticky rail dies.** `SideRail` is `position: sticky` from `lg` up and carries the brand mark,
  the meta block and the links pinned low (§3, roadmap 3.3). A transformed ancestor becomes the
  containing block, so the rail has no scrolling ancestor to stick to. Measured: after a 1200px
  scroll the brand mark sat at `y = -1117` instead of holding at the frame inset. This is the same
  hazard §12 records for `position: fixed` inside a transformed ancestor, applied to `sticky`.
- **The hairline frame loses its inset.** The frame is `body { padding: var(--frame-inset) }`. A
  `position: fixed; inset: 0` wrapper sits outside that padding, so the bordered box ran to the
  viewport edge and the §3 frame grammar disappeared.

The modals were fine — Radix portals to `document.body`, outside the wrapper — but two of the three
structural pieces of the layout were gone.

## Decision

**Lenis, driven off the GSAP ticker.**

Lenis intercepts wheel and touch and calls `window.scrollTo`, so the page keeps scrolling for real:
no wrapper, no transform, `position: sticky` and the body padding both untouched. It renders no DOM
of its own.

It is wired into GSAP rather than run beside it, so there is one animation clock on the page:

```ts
lenis.on('scroll', () => ScrollTrigger.update());
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);
```

`lagSmoothing(0)` is required: GSAP's default lag smoothing skips the catch-up frame after a stall,
which leaves Lenis's eased position stranded behind the real scroll offset.

Disabled entirely under `prefers-reduced-motion: reduce` — the module is never imported, so the
bytes are not fetched either. Paused while either modal is open, so it never fights Radix's scroll
lock.

## Consequences

- **The component is split at `next/dynamic`, not at the import inside it.** `await import()` in the
  effect was not enough: the bundler folded GSAP and Lenis into the shared chunk because
  `SmoothScroll` itself was statically imported, and a reduced-motion visitor downloaded both for
  nothing. Splitting at the component boundary — which §6.2 asks for anyway — took the page from
  **317.0 KB to 169.6 KB** of gzipped script, under the §13 budget of 180 KB, and a reduced-motion
  visitor now fetches **125.8 KB** across three fewer files.
- `ScrollSmoother`'s parallax `effects` are not available. Nothing in `tech.md` asks for parallax;
  §9.2 asks for reveals, which are plain `ScrollTrigger` and work identically on either scroller.
- One more dependency than the ScrollSmoother route, since GSAP is installed regardless.
- If the layout ever loses both the sticky rail and the padded frame, ScrollSmoother becomes viable
  again. Neither is likely: they are the §3 layout grammar.
