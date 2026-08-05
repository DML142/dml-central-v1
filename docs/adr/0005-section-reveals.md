# 0005 — The reveal system and the pre-paint hold

Status: accepted, 2026-08-05

## Context

`tech.md` §9.2 asks for "one reusable `Reveal` component wrapping GSAP `ScrollTrigger`". §11 sets a
rule that outranks it:

> Content is never revealed _by_ animation alone — it is visible if animation never runs.

And §13 caps the initial payload at 180KB gzip, which PR #9 had already been bitten by: a statically
imported component drags GSAP into the shared chunk however carefully the import inside it is
guarded.

A literal reading of §9.2 — a client component that imports GSAP and hides itself on mount —
violates the second constraint and puts the third at risk. Three problems had to be solved at once:
where the machinery lives, who decides the hidden state, and when it is applied.

## Decision

**`Reveal` is a server component that writes attributes, and one client runtime reads them.**

`Reveal` renders a wrapper carrying `data-reveal`, optionally `data-reveal-stagger` and
`data-reveal-immediate`. It imports no GSAP and ships no JavaScript. `SectionReveals` — behind
`next/dynamic`, with the GSAP import past the reduced-motion guard — queries `[data-reveal]`, plans
each block and builds the animations.

Three consequences follow, and they are the reason for the shape:

- The machinery stays off the critical path. Measured: **+1.2KB gzip** for a reduced-motion visitor,
  who fetches no GSAP at all.
- §11 is satisfied structurally rather than by care. Nothing is hidden in CSS on behalf of the
  runtime, so a visitor who never loads it reads a finished page.
- Adding a reveal is a prop, not an import. A feature never reaches for GSAP itself.

**The load sequence is held before the first paint by `data-motion`, not by a timer.**

Scroll-triggered blocks are below the fold and can be hidden by the runtime whenever it arrives. The
hero cannot: it is on screen, so the runtime hiding it after the fact means the reader watches the
headline land and then get pulled back to be animated. Measured at a full second of readable
headline before it vanished.

An inline script in the root layout sets `data-motion="pending"` before the first paint when motion
is wanted; CSS clips `[data-reveal-immediate]` while it is set; the runtime clears it once every
initial state is in place. The script drops the attribute itself after `MOTION_HOLD_MS` so nothing is
gated on the runtime chunk arriving.

### What was tried first

| Approach                                           | Why it was dropped                                                                                                                                                                |
| -------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Let the runtime hide the hero when it loads        | The flash above is exactly what it produces                                                                                                                                       |
| A CSS animation holding the block for a fixed 1.5s | A race against the network, and it lost: the GSAP chunks land at 2.4s on a dev server, so the runtime always arrived "late" and skipped itself — **the hero never played at all** |
| Skip the sequence when the runtime is late         | The other half of the same failure. Correct as a guard, useless as a policy, because "late" is the normal case on a slow connection                                               |
| Hide in CSS with no JavaScript involved            | Breaks §11: scripting off would leave the hero permanently blank                                                                                                                  |

The attribute removes time from the question entirely. There is no window to win.

## Text reveals

`lines` and `type` cut the text with GSAP `SplitText` and **hand the DOM back when they finish**, so
nothing downstream inherits markup no component wrote. Three rules were paid for:

- **Point the split at text, never at a layout container.** Given a grid, SplitText gathers the lines
  of the whole subtree and lifts their wrappers out of the cells they belonged to. Measured on the
  step row: 174px became 512px and the document grew 407px, shoving every section below the hero
  down the page mid-animation. `collectTextBlocks` resolves targets to elements that hold text and
  nothing else.
- **No `autoSplit`.** It observes every cut element — eighteen here — and re-cuts on any size change,
  including a dialog taking the scrollbar away. Re-cutting a finished reveal starts it over, so the
  hero would replay its entrance because a modal opened. The text is cut once, after
  `document.fonts.ready`.
- **Key the section on the locale.** A split rewrites markup React owns. Without a remount, a locale
  switch has React patching text into a DOM it no longer owns, and the revert then puts the previous
  language back.

Line masks need `overflow-clip-margin`, not padding with a negative margin: the display face is set
at a leading tighter than its own glyphs, and the padding version is not layout-neutral because the
margins collapse.

## Consequences

- Four variants, one contract. `fade`, `wipe`, `lines`, `type` — a feature picks one and knows
  nothing else.
- Reveals publish `data-reveal-done` when they settle. A reveal moves controls, and until it settles
  the page is quietly lying about where they are; this makes that observable rather than a matter of
  guessing at durations, the same bargain as `data-hydrated`.
- The inline script is a cost. It is small, it is the standard shape for anything that must be
  decided before the first paint, and the alternative was a hero entrance that did not run.
- `MOTION_HOLD_MS` and the CSS hold have to stay in step. Both carry a comment pointing at the other.
- Easing crosses into GSAP through `CustomEase` and the §4.3 control points as SVG paths. A CSS
  `cubic-bezier()` string means nothing to GSAP, and substituting the nearest built-in would have the
  page moving on two different curves depending on who drove the animation.
