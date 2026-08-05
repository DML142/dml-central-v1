# 0003 — Gallery carousel without Embla

Status: accepted, 2026-08-04

## Context

`tech.md` §2.2 lists `embla-carousel-react` because shadcn's carousel is Embla-based and gives swipe,
keyboard and thumbnail sync for free. §6.4 then states a hard rule, written after a real defect in
the prototype:

> Every slide is absolutely positioned to fill the stage with `object-fit: contain`, so its box is
> decided by the container and never by the image's intrinsic dimensions. A slide must never render
> at natural size for a frame and then shrink into place. Slides are stacked and cross-faded on
> opacity — switching a slide reflows nothing.

The two cannot both be satisfied. Embla lays slides out in a horizontal track and transforms it;
its slides are siblings in flow, sized by their content unless every one is pinned, and the whole
point of the library is the translate. A cross-faded stack is not a carousel Embla can drive.

The set makes this concrete: the shots run from `0.38` to `2.39` aspect ratio. A slide that sizes
itself paints at its own dimensions for one frame and then snaps — which is exactly the defect §6.4
was written to prevent.

## Decision

**No Embla.** The stage is a stack of absolutely positioned `next/image` elements with `fill` and
`object-contain`, cross-faded on opacity. The container decides the box; the image never does.

What Embla would have supplied is supplied instead by:

| Concern                                       | Source                                                                                                               |
| --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Focus trap, `aria-modal`, escape, scroll lock | Radix `Dialog` via shadcn, as §6.4 already required                                                                  |
| Arrow keys, `Home`, `End`                     | One `keydown` listener on the modal                                                                                  |
| Touch swipe                                   | `useSwipe`, a horizontal-only pointer hook; vertical movement is ignored so a scroll gesture never changes the slide |
| Thumbnail sync                                | `activeSlide` in the store, which both the stage and the strip read                                                  |
| Looping                                       | `stepSlide` in the store wraps in both directions, so the arrows never disable                                       |

## Consequences

- One dependency fewer, and the §6.4 rule is structural rather than something a library has to be
  argued out of.
- The swipe hook is ours to maintain: 30 lines, a 40px threshold, and no momentum or drag preview.
  Embla's rubber-band feel is lost. On a fullscreen viewer that steps one image at a time, that is
  not a feature worth a dependency.
- If a future surface needs a real dragging carousel, Embla comes back for that surface. It does not
  come back for this one.

`tech.md` §2.2 has been updated to record why the row is struck through.

## Amendment, 2026-08-04

The swipe hook reads **touch events** for touch input, not pointer events. Inside a Radix dialog the
scroll lock calls `preventDefault` on `touchmove`, and iOS answers that by cancelling the pointer
sequence — `pointercancel` arrives instead of `pointerup` — so the pointer-only version saw every
swipe on a phone as an abandoned gesture while taps kept working. Pointer events still serve mouse
and pen, and a `pointerType === 'touch'` event is ignored there so one finger is never counted
twice.
