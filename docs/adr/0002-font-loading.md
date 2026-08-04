# 0002 — Font loading

Status: accepted, 2026-08-04

## Context

The page ships in English, Ukrainian and Russian, so every family has to cover Latin and Cyrillic.
Anton, the display face in the static prototype, has no Cyrillic glyphs at all. Geist and JetBrains
Mono do, but the prototype only self-hosted their Latin cuts.

`tech.md` §4.2 said fonts load through `next/font/local`. That API takes a `src` array whose entries
vary by weight and style. It has no way to express `unicode-range`, so it can only load one file per
weight — a file that either lacks Cyrillic or carries it for every visitor including the English
ones. Neither is acceptable: the first breaks two of the three locales, the second spends the §13
performance budget on bytes most visitors never render.

## Decision

**Oswald replaces Anton as the display face in all three locales.** It is condensed, uppercase-first
and heavy enough to carry the §3 layout grammar, and it covers Latin and Cyrillic. One face for
every locale means no font swap when the language changes and one visual identity rather than two.

**Faces are declared as plain `@font-face` rules in `globals.css`, not through `next/font/local`.**
Each family ships four subsets — `latin`, `latin-ext`, `cyrillic`, `cyrillic-ext` — with the
`unicode-range` values Google Fonts publishes, taken verbatim from the `@fontsource` packages. The
files live in `public/fonts/` and are still self-hosted; no remote font URL exists anywhere.

Twenty files, 167 KiB on disk. A given visitor downloads only the subsets their text needs: about
60 KiB for English, a similar figure for Ukrainian or Russian.

## Consequences

What we give up by not using `next/font/local`:

- **Automatic preload.** Replaced by one explicit `<link rel="preload">` in the root layout for the
  Latin display cut, which carries the headline in the default locale. The other nineteen files are
  fetched on demand by `unicode-range`, which is the point.
- **Automatic `size-adjust` fallback metrics.** Every face is `font-display: swap`, so a slow
  network shows the fallback first. If CLS measures above the §13 budget of 0.05, the fix is a
  hand-written `@font-face` fallback with `size-adjust` and `ascent-override`, not a return to
  `next/font`.

What we get: correct per-glyph subsetting, no Cyrillic bytes on an English page load, and font
declarations that are readable in one file instead of generated at build time.

`tech.md` §4.2 has been updated to match.
