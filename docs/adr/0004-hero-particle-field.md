# 0004 — How the hero particle field is built

Status: accepted, 2026-08-04

## Context

`tech.md` §5 specified the field before any of it existed: point counts, connection distances, a
shader formula, a camera, a fixed `24 × 14 × 12` volume. Building it turned four of those into
questions the spec could not answer, and one of them was a contradiction inside the spec itself.

## Decisions

### Depth reads as focus, not as perspective

§5.1 and the static SVG field both describe far points as **larger, softer and dimmer** — a
defocus, not a distance. §5.3 then gave `gl_PointSize = uSize * uScale / -mvPosition.z`, which is
perspective division and does the exact opposite.

§5.1 wins: size, alpha and edge softness interpolate explicitly between a near and a far value on a
normalised depth. The near/far constants are the SVG field's own numbers, so the WebGL field and its
fallback are one drawing rather than two that resemble each other.

The same section mixed point colour towards `--color-violet-deep` (`#2a1160`). On a `#07060B`
background that sinks the far half of the field into the page. One `--color-violet-bright`
throughout, dimmed by alpha, which is what the SVG always did.

### The volume follows the viewport

A fixed `24 × 14 × 12` volume assumes one aspect ratio. On a portrait phone the camera frames a
narrow slice of a wide field, and the field reads as a handful of stray dots.

`resolveFieldBounds(aspect)` fixes the height to the frustum plus a 20% bleed and takes the width
from the aspect. At 16:9 it returns the `24 × 14` §5.2 fixed by hand — the spec's numbers are the
widescreen case of the derivation, not a second source of truth. It is the framing the SVG gets from
`preserveAspectRatio: slice`, expressed in world units.

### Coefficients are per-frame, the simulation runs in seconds

§5.2 authors damping, spring and drift per frame at 60fps and says nothing about integration.
`ParticleField.update` converts each against the real delta: damping is raised to the elapsed frame
count, the spring scales linearly, the repulsion impulse scales with seconds. Repulsion strength is
therefore the velocity a point gains from a full second under the pointer.

Tested: 120 frames at 1/120s and 60 frames at 1/60s reach the same state.

### Repulsion is measured where a point is seen

The pointer is unprojected onto `z = 0`. Comparing that to a point's world position in three
dimensions means everything deeper in the volume than the repulsion radius — nearly half the field —
ignores a cursor sitting straight on top of it. That shipped, and it was the first thing a real
device found.

The pointer is carried to the point's own depth (`(cameraZ - z) / cameraZ`) and compared in the two
screen axes. Depth is left to the drift.

### The density is measured, not specified

At the §5.2 connection distance of 2.6 units the field averages ~4.6 neighbours per point where the
SVG draws 8.5 in 2D, because a 3D neighbourhood is a sphere in a volume rather than a disc on a
plane. Side by side, the WebGL field read visibly thinner than the fallback it replaces.

Raising the radius to 3.2 / 3.0 / 2.6 rather than the point count keeps the segment build inside its
cap and costs nothing per frame. §5.2 now carries the measured values.

### There is no loading screen

The brief asked for one so nobody watches Three load. The cheaper answer is that there is nothing to
watch: the seeded SVG constellation is server-rendered and on screen before the Three chunk is
requested. The canvas mounts behind it and fades in over `--dur-slow` once it has painted its first
frame; the SVG fades out under it.

A real loading overlay would cover content that is already painted and interactive, and would cost
LCP for the privilege.

### A missed frame budget ends the field

§12 required this and building it proved why. Headless WebKit has no GPU: six parallel test workers
each ran the simulation on a software rasteriser and starved the timing-sensitive scroll and modal
tests, losing a different test on every run.

Ninety consecutive frames slower than 40ms, after a thirty-frame warm-up, unmount the canvas and
hand the hero back to the static field. This is what a low-end Android gets, and it is the same exit
as a lost context or a missing WebGL context: no canvas, static field, nothing broken.

### Three.js is pinned to r179

r185 deprecates `THREE.Clock`, React Three Fiber 9 still uses it, and the resulting console warning
breaks the §10 "no new console warnings" rule. r179 is also the version §2.1 asked for.

## Consequences

- The simulation is plain TypeScript with no import of `three`: `ParticleField`, `SpatialGrid` and
  `ConnectionField` run and are tested in jsdom, checked against a brute-force pair search.
- The field is rebuilt when the rounded viewport aspect changes. A rotation re-seeds the layout; a
  one-pixel resize does not.
- The layout seed is random per page load. The SVG stays seeded because it is server-rendered and
  has to match its own markup.
- The Three chunk is 224 KB gzip and is fetched only when the canvas actually mounts. The rest of
  the page grew by 1.6 KB.
- Every fallback path ends at the same static SVG, so there is one thing to keep looking right
  rather than four.
