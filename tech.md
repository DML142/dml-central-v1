# tech.md — Technical Specification

> Read this file in full at the start of every session, after `CLAUDE.md`. It is the single source of
> truth for what gets built. If something is not here, it is not decided — ask, do not invent
> (`CLAUDE.md` §3.1).

---

## 1. Overview

A single-page personal portfolio landing for a full-stack developer. One route, four sections, two
modals. No CMS, no database, no authentication, no user accounts. The only server-side work is one
endpoint that forwards a contact message to my Telegram bot.

**The job of the page:** convince a technical reader, in under a minute, that I build real systems —
then give them one action, "contact".

**Sections, in order**

1. Hero — interactive 3D particle network, headline, primary CTA.
2. Projects — two projects, each opening a fullscreen image carousel.
3. Stack — collapsible category panels.
4. About — short personal block: who I am, how I work, what I have shipped.
5. Contact — CTA band; the form itself lives in a modal, reachable from hero and footer.

The page ships in three languages (§18). English is the source and the default; Ukrainian and
Russian are switchable from a control in the top frame bar.

**Non-goals for v1:** blog, dark/light toggle (the site is dark by design), analytics beyond
Vercel's built-in, admin panel or stored submissions, locale-prefixed routes (§18.2).

---

## 2. Stack

### 2.1 Core

| Technology | Version | Role |
|---|---|---|
| Next.js | 16 (App Router) | Framework, route handler, image pipeline |
| React | 19 | UI |
| TypeScript | 5.x, strict | Types |
| Tailwind CSS | v4 (`@theme` tokens) | Styling |
| shadcn/ui | latest | Dialog, Accordion, Form, Button, Input, Textarea, Label, Sonner |
| Three.js | r17x | WebGL |
| @react-three/fiber | 9 | React renderer for Three.js |
| @react-three/drei | latest | Only `useTexture`/helpers actually needed — no blanket import |
| GSAP | 3.13 | Smooth scroll, ScrollTrigger, reveal timelines |
| Zustand | 5 | Client state (modals, active project, active slide) |
| Lucide React | latest | UI icons |

### 2.2 Added to the stack (justification required by `CLAUDE.md` §3.1 — this is the justification)

| Technology | Why it is needed |
|---|---|
| `zod` | One schema validates the contact form on client and server, and validates `process.env` |
| `react-hook-form` + `@hookform/resolvers` | Uncontrolled form performance, native shadcn Form integration |
| `embla-carousel-react` + `embla-carousel-autoheight` | shadcn's carousel is Embla-based; gives swipe, keyboard, thumbnail sync for free |
| `clsx` + `tailwind-merge` (`cn`) | Class composition without specificity fights |
| `class-variance-authority` | Component variants as data, not conditional string soup |
| `next-themes` | Not used — the site is single-theme. Explicitly excluded |
| `sonner` | Toasts for contact success/failure |
| `vitest` + `@testing-library/react` + `@testing-library/user-event` + `jsdom` | Unit and component tests |
| `@playwright/test` | Cross-browser e2e |
| `msw` | Network mocking in tests |
| `husky` + `lint-staged` | Pre-commit gate |
| `sharp` | Image optimisation in production builds |

### 2.3 Explicitly not used

- **NestJS** — the contact flow is one stateless POST with no persistence, no auth, no jobs. A Nest
  app would add a deployment target, a container and a cold-start for a single `fetch`. Revisit only
  if submissions ever need to be stored or queued.
- **Any database, Redis, ORM** — nothing is persisted.
- **State libraries beyond Zustand**, **CSS-in-JS**, **UI kits other than shadcn**.

---

## 3. Layout grammar (reference: `docs/screenshots/site-look.jpg`)

The reference screenshot defines **structure**, not colour. Reproduce the structure; the palette is
§4.1 and is dark violet.

Grammar to reproduce:

- A hairline-bordered **frame** inset from the viewport edge, with meta text on the outer edges
  (top-left: identity line; top-right: attribution; bottom-left: domain; bottom-right: location/year).
- A narrow **left rail** inside the frame: brand mark, small meta block, stacked link buttons pinned
  low.
- Content divided into **panels by 1px rules**, radius 0, no shadows, no gradients on surfaces.
- **Micro-labels** in uppercase mono at ~11px with wide tracking, used as eyebrows and metadata.
- One oversized **condensed display headline**, uppercase, tight leading, left-aligned, occupying the
  left half.
- An **asymmetric media block** on the right of the hero, offset from the grid.
- A row of **numbered items** (`01 / 02 / 03`) separated by vertical rules — used only where the
  content is genuinely sequential.
- A full-width **accent band** near the fold with a large figure and dense mono copy.

Adaptations for this site:

- The numbered row becomes the three-step framing of what I do; if the copy is not a real sequence,
  drop the numbers and keep the rules (per design discipline — numbering must encode order).
- The hero media block is replaced by the WebGL particle network, which bleeds behind the whole hero
  rather than sitting in a box.

### 3.1 Wireframe — desktop ≥ 1280

```
┌ meta ───────────────────────── [EN|UA|RU] ───── meta ┐
│ ┌───┬───────────────────────────────────────────────┐ │
│ │ ▣ │ eyebrow · role · availability                 │ │
│ │   │                                               │ │
│ │ m │   YOUR DISPLAY                 [ particle    ]│ │
│ │ e │   HEADLINE HERE                [  network    ]│ │
│ │ t │   ACROSS LINES                 [  bleeds     ]│ │
│ │ a │                                [  behind     ]│ │
│ │   │   short paragraph.             [   all       ]│ │
│ │   │                                   ( CONTACT →)│ │
│ │ ▸ │───────────────────────────────────────────────│ │
│ │ ▸ │  01 build      │ 02 ship      │ 03 maintain   │ │
│ └───┴───────────────────────────────────────────────┘ │
└ meta ─────────────────────────────────────────── meta ┘
        ▼ scroll
┌───────────────────────────────────────────────────────┐
│ PROJECTS                                       (02)   │
│ ┌───────────────────────────┬───────────────────────┐ │
│ │ PRIMARY project           │ SECONDARY  [deprecated]│ │
│ │ summary · chips · links   │ summary · chips · links│ │
│ │ [ open gallery ]          │ [ open gallery ]       │ │
│ └───────────────────────────┴───────────────────────┘ │
├───────────────────────────────────────────────────────┤
│ STACK                                          (03)   │
│ ▸ 01 Frontend                                    (9)  │
│ ▾ 02 Backend                                     (10) │
│    [chip][chip][chip][chip][chip]                     │
│ ▸ 03 3D & Animation                              (5)  │
│ ▸ ...                                                 │
├───────────────────────────────────────────────────────┤
│ ABOUT                                          (04)   │
│ short paragraph              │ age · based · languages│
├───────────────────────────────────────────────────────┤
│ CONTACT band — large statement + ( CONTACT → )        │
└───────────────────────────────────────────────────────┘
```

The About block stays deliberately small: one paragraph plus a mono definition list. It is the only
place on the page that speaks in the first person about the person rather than the work.

### 3.2 Breakpoints

| Token | Width | Behaviour |
|---|---|---|
| `xs` | 320–389 | Single column, rail collapses into top bar, frame inset 8px |
| `sm` | 390–743 | Single column, larger type step |
| `md` | 744–1023 | Two-column projects, rail still collapsed |
| `lg` | 1024–1279 | Rail appears, hero splits |
| `xl` | 1280–1919 | Reference layout |
| `2xl` | ≥ 1920 | Max content width 1680px, frame centred |

---

## 4. Design system

### 4.1 Colour tokens

Dark base, violet accent. Defined once in `globals.css` under `@theme`.

| Token | Hex | Use |
|---|---|---|
| `--color-void` | `#07060B` | Page background |
| `--color-surface` | `#0D0A16` | Panels, modal chrome |
| `--color-surface-raised` | `#151024` | Chips, hover surfaces |
| `--color-line` | `#241C3A` | Hairline borders, rules |
| `--color-line-strong` | `#3B2E5E` | Active/focused borders |
| `--color-text` | `#EDEAF7` | Primary text |
| `--color-text-muted` | `#8E86A8` | Meta, secondary copy |
| `--color-text-faint` | `#5B5474` | Micro-labels, disabled |
| `--color-violet` | `#7C4DFF` | Primary accent, CTA, active states |
| `--color-violet-bright` | `#B388FF` | Hover accent, particle highlight |
| `--color-violet-deep` | `#2A1160` | Accent band background, glows |
| `--color-danger` | `#FF5470` | Form errors, `deprecated` badge |

Rules: no gradient on text; glow only via low-opacity violet radial behind the hero canvas; the
accent band is `--color-violet` with `--color-void` text, used **once** per page.

### 4.2 Typography

| Role | Family | Usage |
|---|---|---|
| Display | Anton (self-hosted) | H1/H2, uppercase, `tracking: -0.02em`, `leading: 0.86` |
| Body | Geist Sans (self-hosted) | Paragraphs, form fields, buttons |
| Mono | JetBrains Mono (self-hosted) | Eyebrows, meta, chips, numbers — uppercase, `tracking: 0.14em`, 11–12px |

Fonts are **always self-hosted** via `next/font/local` from `public/fonts/`. Remote font URLs are
banned — a dead remote font URL has broken this project's WebGL text before.

Type scale (clamp-based, fluid between 390px and 1440px):

| Token | Min → Max |
|---|---|
| `--text-display-xl` | 3.25rem → 7.5rem |
| `--text-display-lg` | 2.5rem → 4.5rem |
| `--text-title` | 1.25rem → 1.75rem |
| `--text-body` | 0.9375rem → 1.0625rem |
| `--text-meta` | 0.6875rem → 0.75rem |

### 4.3 Space, borders, motion

- Spacing scale: 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96 / 128.
- Border: `1px solid var(--color-line)`. Radius `0` everywhere except the pill CTA (`9999px`) and
  chips (`2px`).
- Easing: `--ease-out: cubic-bezier(0.16, 1, 0.3, 1)`, `--ease-in-out: cubic-bezier(0.65, 0, 0.35, 1)`.
- Duration: `--dur-fast: 160ms`, `--dur-base: 320ms`, `--dur-slow: 640ms`, `--dur-reveal: 900ms`.
- Focus ring: `2px solid var(--color-violet-bright)`, `offset: 2px`, always visible, never removed.

### 4.4 Signature element

The particle network is the one memorable thing. Everything else stays quiet: flat surfaces,
hairlines, disciplined type. No secondary "wow" effects competing with it.

---

## 5. Hero — particle network

### 5.1 Visual target

Points scattered in 3D space, connected by thin lines when close enough, forming an irregular
constellation. Depth reads as focus: near points are small, sharp and bright; distant points are
larger, softer and dimmer — a blur that increases with distance. The whole field drifts slowly.
Pointer or touch pushes nearby points away, and they spring back.

### 5.2 Parameters (`src/config/particles.ts`)

| Parameter | Desktop | Tablet | Mobile |
|---|---|---|---|
| Point count | 260 | 180 | 110 |
| Max connection distance | 2.6 units | 2.6 | 2.4 |
| Max rendered segments | 1400 | 900 | 500 |
| Repulsion radius | 3.2 units | 3.2 | 2.6 |
| Repulsion strength | 0.85 | 0.85 | 0.7 |
| Return spring `k` | 0.015 | 0.015 | 0.02 |
| Velocity damping | 0.92 | 0.92 | 0.90 |
| Drift amplitude | 0.12 | 0.12 | 0.08 |
| DPR clamp | `[1, 1.75]` | `[1, 1.5]` | `[1, 1.5]` |

Field volume: `24 × 14 × 12` world units, camera at `z = 14`, `fov 45`. Distribution is uniform
random from a **seeded** PRNG so the field is deterministic and testable.

### 5.3 Implementation

- `src/lib/three/particle-field.ts` — `ParticleField` class. Owns `Float32Array`s for origin,
  position, velocity and phase. Public API: `update(dt, pointer)`, `positions`, `dispose()`.
  Zero allocation inside `update`.
- `src/lib/three/spatial-grid.ts` — `SpatialGrid` class. Uniform grid with cell size =
  max connection distance; rebuilt per frame into pre-allocated arrays; neighbour queries visit
  27 cells. This keeps connection search linear instead of O(n²).
- `src/lib/three/shaders/points.vert|frag` — points shader.
  - Vertex: `gl_PointSize = uSize * uScale / -mvPosition.z`; pass normalised view depth to fragment.
  - Fragment: circular mask via `length(gl_PointCoord - 0.5)`; `smoothstep` edge width grows with
    depth (far = blurred), alpha falls with depth; colour mixes `--color-violet-bright` →
    `--color-violet-deep` by depth.
- Connections: one `LineSegments` with a pre-allocated position + alpha buffer sized to the segment
  cap. Per frame, fill up to the cap and set `geometry.setDrawRange(0, count)`. Alpha =
  `(1 - d / maxDist) * depthFade`. Additive blending off; normal blending with low base alpha.
- Pointer: `pointermove` on the canvas container (covers mouse, pen and touch). Convert to NDC, then
  unproject onto the plane `z = 0` to get the world-space influence point. `pointerleave` clears it.
- Repulsion: for each point inside the radius, `f = (1 - d/r)^2 * strength` along the outward normal;
  add to velocity. Every point also springs to its origin and damps.
- Drift: per-point phase offsets driving low-frequency sine displacement on all three axes.

### 5.4 Performance and lifecycle

- `useFrame` with `delta` clamped to `1/30` so a stalled tab does not explode the simulation.
- Pause rendering when the hero leaves the viewport (IntersectionObserver) or the tab is hidden
  (`visibilitychange`), and when a modal is open.
- `frameloop="demand"` is **not** used — the field is continuously animated; instead the canvas
  unmounts its loop via the pause flags above.
- Canvas: `antialias: false`, `alpha: true`, `powerPreference: 'high-performance'`.
- Full `dispose()` of geometries, materials and shaders on unmount.
- The whole Three.js tree is behind `next/dynamic(..., { ssr: false })`.

### 5.5 Fallbacks

| Condition | Behaviour |
|---|---|
| `prefers-reduced-motion: reduce` | Field renders once, static. No drift, no repulsion |
| No WebGL context | Static SVG constellation with the same palette; no canvas mounted |
| `navigator.hardwareConcurrency <= 4` or mobile | Mobile parameter set |
| WebGL context lost | Listen for `webglcontextlost`, swap to the static fallback, do not crash |

Hero content (headline, copy, CTA) is plain DOM above the canvas and is fully readable with the
canvas absent.

---

## 6. Projects

### 6.1 Data model

```ts
type ProjectStatus = 'active' | 'deprecated';

interface ProjectLink {
  label: string;
  href: string;
  kind: 'repository' | 'live';
}

interface ProjectImage {
  src: string;
  alt: string;
  width: number;
  height: number;
}

interface Project {
  id: string;
  index: string;           // '01'
  title: string;
  tagline: string;
  summary: string;         // 2–4 sentences
  highlights: string[];    // 3–5 bullet facts
  tech: string[];          // chip labels, must exist in stack content
  status: ProjectStatus;
  emphasis: 'primary' | 'secondary';
  links: ProjectLink[];
  gallery: ProjectImage[];
}
```

### 6.2 Content

**01 — saas-ai-fullstack-portfolio** — `emphasis: primary`, `status: active`
- Repository: `https://github.com/DML142/saas-ai-fullstack-portfolio`
- Copy describes: pnpm/Turborepo monorepo, Next.js 16 + React 19 frontend, NestJS 11 + Prisma 7 +
  PostgreSQL 16 backend, Redis-backed refresh-token families, BullMQ jobs, Socket.IO realtime chat,
  Stripe checkout with signed webhooks, Swagger docs, Docker Compose for the whole stack.
- Tech chips: Next.js, React, TypeScript, Tailwind, NestJS, Prisma, PostgreSQL, Redis, BullMQ,
  Socket.IO, Stripe, Docker.

**02 — dmls-solutions** — `emphasis: secondary`, `status: deprecated`
- Repository: `https://github.com/DML142/dmls-solutions`
- Live: `https://dml-142.vercel.app/`
- Copy describes: the first creative site taken all the way to a finished, deployed state. Heavy use
  of 3D and custom shaders is what left it unoptimised. Non-commercial — it exists as evidence of
  creative front-end capability, not as a reference implementation.
- Tech chips: Next.js, React, TypeScript, Tailwind, Three.js, React Three Fiber, GSAP, Vercel.
- Renders a `DEPRECATED` badge in `--color-danger` at 60% opacity, plus one line stating it is no
  longer maintained and kept for reference. The card is visually recessive: muted text, no accent
  border, but fully interactive — both links and the gallery still work.

The deprecation note is about maintenance, never about quality: the copy states that the project is
unoptimised and why, without apologising for it.

### 6.2.1 Gallery assets

Supplied and in the repository. In the prototype they live in `prototype/gallery/<folder>/`; the
React build moves them to `public/projects/<project-id>/` unchanged.

| Project | Folder | Count |
|---|---|---|
| saas-ai-fullstack-portfolio | `saas/` | 13 |
| dmls-solutions | `dmls-solutions/` | 5 |

- **Order is the trailing number in the file name** (`hero1`, `about2`, … `import_export13`). The
  name also says what the shot is, so the mapping stays readable in a diff. Do not renumber.
- **Aspect ratios are not uniform** — they run from `0.38` (a narrow mobile capture) to `2.39` (a
  side-by-side editor shot). Nothing may assume 16:9. The stage letterboxes with `object-fit:
  contain`, and so do the thumbnails: cropping a portrait capture to a 16:9 thumb leaves an
  unreadable strip.
- Every image has a written `alt` describing what is on screen, translated into all three locales
  under the `alt.<project>.<n>` keys (§19.1).
- Only the active slide and its two neighbours are fetched; thumbnails are `loading="lazy"`.
- Before production the set needs converting to `webp`/`avif` with explicit dimensions (§13). The
  prototype ships the original `png`/`jpg` at ~2.5 MB total, which is over budget and is a Phase 5
  task, not a prototype one.
- Two content issues to fix at source, not in code: `saas/avatar11.jpg` is only 275×222 and will look
  soft on a full-screen stage, and `saas/dashboard7.jpg` shows a `localhost:3001` address bar.

### 6.3 Project card

Bordered panel: index label, title in display face, tagline in mono, summary, highlight list, tech
chips, link row, and a primary action that opens the gallery. Hover raises the border to
`--color-line-strong` and shifts the index label to violet. The whole card is not a link — only the
explicit controls are, so link semantics stay clean.

### 6.4 Gallery modal

Built on shadcn `Dialog` (Radix), so focus trap, `aria-modal`, escape and scroll lock come from the
primitive rather than hand-rolled.

- Fullscreen overlay, backdrop `--color-void` at 88% with an 8px backdrop blur.
- Click on empty space (the backdrop, not the image or controls) closes it.
- Escape closes it. A visible close button sits top-right.
- Left/right arrow controls, vertically centred, 44×44px minimum hit area, disabled state at the
  ends if looping is off — **looping is on**, so they never disable.
- `←` / `→` keys navigate. `Home` / `End` jump to first/last.
- Touch: horizontal swipe via Embla. Vertical swipe does nothing (no accidental close).
- Bottom thumbnail strip: horizontally scrollable, active thumbnail marked with a violet border and
  scrolled into view, click jumps to that slide.
- Slide counter in mono: `03 / 08`, top-left.
- Current slide image uses `next/image` with `priority` on the active and adjacent slides, a blur
  placeholder, and `sizes="100vw"`.
- **No first-paint size jump.** Every slide is absolutely positioned to fill the stage with
  `object-fit: contain`, so its box is decided by the container and never by the image's intrinsic
  dimensions. A slide must never render at natural size for a frame and then shrink into place.
  Slides are stacked and cross-faded on opacity — switching a slide reflows nothing.
- While open: page scroll locked, smooth scroller paused, WebGL loop paused.
- On close: focus returns to the button that opened it; the store resets the active slide.

State: `projectsStore` holds `openProjectId: string | null` and `activeSlide: number`.

---

## 7. Contact

### 7.1 Form

Opened as a modal from two places (hero CTA, footer band); one component, one store flag.

| Field | Type | Validation |
|---|---|---|
| `name` | text | 2–64 chars, required |
| `email` | email | valid email, ≤ 254 chars, required |
| `telegram` | text | optional, `^@?[a-zA-Z0-9_]{4,32}$` |
| `message` | textarea | 10–2000 chars, required |
| `company` | hidden honeypot | must be empty |
| `startedAt` | hidden timestamp | submission faster than 2s is rejected |

React Hook Form + `zodResolver`, validation mode `onBlur`, re-validation `onChange`. Errors render
inline under the field, tied by `aria-describedby`, and the first invalid field receives focus on
submit. Submit button shows a pending state and is disabled while in flight. Character counter on
the message field appears past 80% of the limit.

States: idle → submitting → success (modal switches to a confirmation panel with a "Send another"
action) or error (inline banner with the reason and a retry).

### 7.2 Endpoint

`POST /api/contact` — `runtime = 'nodejs'`, `dynamic = 'force-dynamic'`.

Pipeline: parse JSON → validate with the shared Zod schema → honeypot and timing check → rate limit →
build message → `TelegramClient.send()` → respond.

Rate limit: 3 requests per 10 minutes per IP (`x-forwarded-for`, first entry), in-memory sliding
window in `src/lib/rate-limit.ts`. This is best-effort on serverless — it holds per warm instance.
Upgrading to a shared store is listed in §17 as an open question.

### 7.3 Response contract

```ts
type ContactResponse =
  | { ok: true }
  | { ok: false; error: 'validation'; fields: Record<string, string> }
  | { ok: false; error: 'rate_limited'; retryAfter: number }
  | { ok: false; error: 'delivery' };
```

Status codes: `200`, `400`, `429` (with `Retry-After`), `502`. Never return the upstream Telegram
error text to the client; log it server-side.

### 7.4 Telegram delivery

`src/lib/telegram/client.ts` — `TelegramClient` class, constructed from validated env.

- `POST https://api.telegram.org/bot<token>/sendMessage`
- Body: `chat_id`, `text`, `parse_mode: 'HTML'`, `disable_web_page_preview: true`.
- Every user value is HTML-escaped (`& < > "`) before templating. The template lives in
  `src/lib/telegram/message-template.ts`.
- Message layout: bold header line, then labelled lines for name, email, telegram handle, and the
  message body in a `<pre>` block, then a footer line with the UTC timestamp and source page.
- Timeout: 8s via `AbortController`. One retry on `429` (honouring `parameters.retry_after`, capped
  at 5s) or `5xx`. `4xx` other than `429` is fatal — log and return `delivery`.
- Token and chat id are read server-side only. They must never appear in a client component, a
  `NEXT_PUBLIC_` variable, an error message, or a test fixture.

### 7.5 Environment

`.env.example`:

```
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

`src/lib/env.ts` parses `process.env` with Zod at module load and throws on a missing or malformed
value, so a misconfigured deployment fails at boot rather than at the first form submission.

---

## 8. Client state (Zustand)

Three small stores, each with a typed selector-friendly shape. No single god store.

```ts
// ui-store.ts
{ isContactOpen: boolean; openContact(source: 'hero' | 'footer'): void; closeContact(): void;
  isScrollLocked: boolean; lockScroll(): void; unlockScroll(): void }

// projects-store.ts
{ openProjectId: string | null; activeSlide: number;
  openProject(id: string): void; closeProject(): void; setSlide(i: number): void }

// stack-store.ts
{ openPanels: string[]; togglePanel(id: string): void; setOpenPanels(ids: string[]): void }
```

Rules: components subscribe to the narrowest slice possible; actions live in the store, never in the
component; no derived state stored — derive at read time.

---

## 9. Motion

### 9.1 Smooth scroll

GSAP `ScrollSmoother` is the default choice (all GSAP plugins are free since 2025). It requires the
documented `#smooth-wrapper` / `#smooth-content` DOM structure, which conflicts with `position:
fixed` chrome and needs care with Radix portals.

If integration with the fixed frame chrome or the modals proves fragile, fall back to `lenis` with
GSAP `ScrollTrigger` — this is the pre-approved alternative and does not require a new question.
Whichever is chosen gets an ADR in `docs/adr/0001-smooth-scroll-library.md`.

Both are fully disabled under `prefers-reduced-motion: reduce` and while any modal is open.

### 9.2 Reveals

- One reusable `Reveal` component wrapping GSAP `ScrollTrigger`: fade from `opacity: 0`,
  `translateY: 24px`, `--dur-reveal`, `--ease-out`, `once: true`, start `top 85%`.
- Children stagger at 60ms via a `stagger` prop; the container decides, the child does not.
- The hero entrance is a single orchestrated timeline: frame lines draw in → eyebrow → headline
  lines (mask-reveal per line) → copy → CTA → canvas fades from 0 to full opacity.
- Micro-interactions only where they signal affordance: CTA fill sweep on hover, chip border
  brighten, card border brighten, thumbnail scale on active. Nothing decorative that moves on its
  own besides the particle field.
- All GSAP work is scoped in `gsap.context()` inside `useGsapContext` and reverted on unmount.
  `ScrollTrigger.refresh()` runs after fonts load and after any accordion height change.

### 9.3 Modal enter and exit

Both modals fade rather than snap. Neither may ever appear or vanish on a single frame.

| Phase | Backdrop | Panel | Duration / easing |
|---|---|---|---|
| Enter | `opacity 0 → 1` | `opacity 0 → 1`, `translateY 8px → 0` | `--dur-base`, `--ease-out` |
| Exit | `opacity 1 → 0` | `opacity 1 → 0`, `translateY 0 → 8px` | `--dur-base`, `--ease-out` |

Rules:

- The element stays mounted for the whole exit transition and is only then removed from the
  accessibility tree. Closing is: mark closed → transition runs → hide.
- Focus is restored to the opening trigger **immediately** on close, not after the transition — the
  keyboard must never wait on an animation.
- Do not implement this with `@starting-style` / `transition-behavior: allow-discrete`. Neither is
  available on Safari 15.6 (§12), and the enter transition would silently not run there. Toggle a
  visibility attribute, force a reflow, then toggle the open attribute.
- Under `prefers-reduced-motion: reduce` both transitions collapse to zero duration; the open and
  close logic is otherwise unchanged.
- Radix `Dialog` in the React build keeps the node mounted through its own exit state — drive these
  transitions off its `data-state="open" | "closed"` attribute rather than re-implementing the
  lifecycle.

---

## 10. Stack section content

Panels, in this order. Each is collapsible; `01` is open by default on desktop, all closed on mobile.

| # | Category | Items |
|---|---|---|
| 01 | Frontend | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, shadcn/ui, Zustand, React Hook Form, Zod, SvelteKit |
| 02 | Backend | NestJS 11, Prisma 7, PostgreSQL 16, Redis 7, BullMQ, Passport + JWT, Socket.IO, Stripe, Swagger, class-validator / class-transformer |
| 03 | 3D & Animation | Three.js, React Three Fiber, drei, GSAP, ScrollTrigger / ScrollSmoother |
| 04 | Platforms | Telegram Mini Apps, Telegram Bot API |
| 05 | DevOps & Infrastructure | Docker Compose, GitHub Actions, Turborepo, pnpm workspaces, Vercel, Mailpit |
| 06 | Testing & Quality | Jest, ts-jest, Vitest, Playwright, ESLint, Prettier |

`StackItem` shape: `{ id, label, version?, iconId }`. Icons are local SVGs in
`src/components/common/icons/` (brand marks used nominally, monochrome, tinted by `currentColor`) —
no runtime icon CDN. Lucide covers non-brand glyphs only.

Panel behaviour: Radix `Accordion type="multiple"`; header shows index, category name, item count,
and a chevron rotating 180°; content animates height with the Radix CSS variables, disabled under
reduced motion. A hash like `#stack-backend` on load opens that panel and scrolls to it.

---

## 11. Accessibility

- Landmarks: `header`, `main`, `footer`, `nav` for the rail links. One `h1` (hero), sections use `h2`,
  panels `h3`. No heading level skipped.
- Every interactive element is reachable by keyboard, in visual order, with a visible focus ring.
- The canvas is `aria-hidden="true"` and not focusable; it carries no information required to
  understand the page.
- Dialogs: `aria-modal`, labelled by their title, focus trapped, focus restored on close.
- Accordion: `aria-expanded`, `aria-controls`, `region` role on the panel body.
- Form: every input has a `<label>`; errors linked via `aria-describedby` and `aria-invalid`; the
  submit result is announced through an `aria-live="polite"` region.
- Contrast: body text ≥ 4.5:1, large display ≥ 3:1, focus ring ≥ 3:1 against both adjacent surfaces.
  Muted text on `--color-void` is verified, not assumed.
- Motion: `prefers-reduced-motion` disables smooth scroll, reveals, drift and repulsion. Content is
  never revealed *by* animation alone — it is visible if animation never runs.
- Touch targets ≥ 44×44px.
- A "Skip to content" link is the first focusable element.

---

## 12. Browser and device support

| Target | Minimum |
|---|---|
| Chrome / Edge | last 2 versions |
| Firefox | last 2 versions + current ESR |
| Safari macOS | 15.6+ |
| iOS Safari | 15.6+ |
| Chrome Android | last 2 versions |
| Samsung Internet | 21+ |

Rules:

- `browserslist` in `package.json` matches this table; Tailwind and the build target follow it.
- No unprefixed use of features unsupported in Safari 15.6 (`:has()` is fine from 15.4; container
  queries need a fallback below 16; `text-wrap: balance` is progressive enhancement only).
- Test on real viewports 320 / 360 / 390 / 744 / 1024 / 1280 / 1440 / 1920, plus 390×844 landscape.
- iOS specifics: `100dvh` for full-height sections, `-webkit-overflow-scrolling` on the thumbnail
  strip, no `position: fixed` inside a transformed ancestor, scroll lock that does not jump the page.
- Verify WebGL on low-end Android; if the frame budget is missed, the mobile parameter set drops to
  the static fallback.

---

## 13. Performance budget

| Metric | Budget |
|---|---|
| LCP (mobile, 4G) | < 2.5s |
| CLS | < 0.05 |
| INP | < 200ms |
| Initial JS excluding the Three.js chunk | < 180KB gzip |
| Three.js chunk | lazy, non-blocking, loaded after first paint |
| Hero frame time | ≤ 16ms desktop, ≤ 22ms mid-range mobile |
| Lighthouse mobile | Performance ≥ 90, Accessibility 100, Best Practices ≥ 95, SEO ≥ 95 |

Enforcement: images are `webp`/`avif` with explicit dimensions; fonts are `display: swap` with
metric-adjusted fallbacks to avoid layout shift; no client component above what needs interactivity;
`@next/bundle-analyzer` checked before each release.

---

## 14. Testing

**Unit (Vitest)** — `ParticleField` integration math, `SpatialGrid` neighbour correctness against a
brute-force reference, seeded PRNG determinism, contact Zod schema, HTML escaping, Telegram retry
logic with a mocked `fetch`, rate limiter window edges, all three Zustand stores.

**Component (Vitest + RTL)** — `ProjectCard` (both statuses), `GalleryModal` (open/close/navigate/
focus restore), `StackPanel` (ARIA state), `ContactForm` (validation, pending, success, error).

**E2E (Playwright)** — matrix `chromium` / `firefox` / `webkit` / `Pixel 7` / `iPhone 14`:

1. Page loads, hero renders, canvas mounts or fallback appears.
2. Open each gallery, navigate with arrows, keys, thumbnails and swipe; close by backdrop, escape and
   button; scroll position preserved.
3. Expand and collapse every stack panel by mouse and keyboard.
4. Contact: empty submit shows errors; invalid email blocked; successful submit with a mocked route
   shows confirmation; 429 shows the rate-limit message; 502 shows the delivery error and allows
   retry; honeypot submission is rejected.
5. Full keyboard traversal of the page with no trap outside modals.
6. `prefers-reduced-motion` run: no smooth scroll, content visible.
7. Axe accessibility scan on the page and with each modal open — zero serious/critical violations.

Telegram is never called for real in any test. `TELEGRAM_*` values in CI are dummies.

---

## 15. CI/CD

`.github/workflows/ci.yml`, triggered on push and PR:

`pnpm install --frozen-lockfile` → `pnpm typecheck` → `pnpm lint` → `pnpm test:unit` →
`pnpm build` → `pnpm test:e2e` (Playwright browsers cached) → upload traces on failure.

Deployment: Vercel. Every PR gets a preview URL; `main` deploys to production. Env vars are set in
the Vercel dashboard only — never committed, never printed in logs. A merge is blocked while CI is
red.

---

## 16. SEO and metadata

- `metadata` in the root layout: title, description, canonical, `themeColor: #07060B`,
  OpenGraph and Twitter card.
- `app/opengraph-image.tsx` generates the OG image at build time from the design tokens — dark field,
  display headline, violet accent.
- `robots.ts` and `sitemap.ts` for the single route.
- JSON-LD `Person` + `WebSite` in the layout.
- Semantic HTML carries the content; nothing meaningful exists only inside the canvas.

---

## 17. Open questions

Do not implement anything below until I have answered. When answered, move the decision into
`CLAUDE.md` §12 and delete the item here.

1. **Copy** — do you write the headline, tagline, section copy and project summaries as a proposal
   for me to edit, or do I supply the final text? (Default assumption if unanswered: propose drafts,
   flag them clearly as drafts.)
2. **Rate limiting** — is per-instance in-memory limiting acceptable for v1, or do you want a shared
   store (Upstash Redis) from the start?
3. **Bot protection** — honeypot + timing only, or add Cloudflare Turnstile? Turnstile adds two env
   vars and a third-party script.
4. **Contact fields** — is the field set in §7.1 final, or should it include budget / project type /
   preferred contact channel?
5. **Frame meta text** — exact strings for the four frame corners (identity, attribution, domain,
   location/year).
6. **Domain** — custom domain for production, or the default Vercel URL?
7. **Numbered row in the hero** — is "01 / 02 / 03" a real sequence in your case, or should it be
   three unordered statements without numbers?
8. **Project display name** — the gallery for `saas-ai-fullstack-portfolio` shows a product called
   **COS Code**. The card currently carries the repository name. Should the card be retitled to the
   product name, keep the repository name, or show both?
9. **Node.js experience** — §18.1 records 1.5 years, but `dmls-solutions` states on its own about
   screen that Node.js work started in 2023, which reads as roughly three. One of the two is stale.
10. **Cyrillic display face** — Anton has no Cyrillic glyphs, so the Ukrainian and Russian headline
    cannot be set in it (§19.4). Options: (a) swap the display face for one with full Cyrillic
    coverage across all three locales, (b) keep Anton for English and pair it with a Cyrillic
    condensed face, (c) keep the headline in English in every locale. Blocks the visual sign-off of
    the non-English versions.
---

## 18. About section

A short block between Stack and the contact band. Deliberately small — one paragraph and a mono
definition list. It is the only first-person block about the person rather than the work, so it
stays factual and stops before it becomes a biography.

### 18.1 Facts

| Field | Value |
|---|---|
| Name | Maxim |
| Age | 18 |
| Country | Ukraine |
| Working mode | Remote |
| Spoken languages | Ukrainian, Russian, English |
| Node.js experience | 1.5 years |
| Shipped | An optimised site with WebSocket realtime and full authentication, start to finish in one month |
| Previous work | Game-mod development at a development company |
| Working trait | Adapts to new teams quickly |

### 18.2 Rules

- No invented facts. Everything in this block comes from the table above; anything else needs an
  answer in §17 first.
- No claims that duplicate the Stack section — this block is about the person, not the tooling.
- `data-i18n` keys like every other block; all three languages carry the same facts (§19).
- Semantics: `section` with an `h2`, the fact rows as a `dl` with `dt`/`dd` pairs.

---

## 19. Internationalisation

The page ships in **English (source, default)**, **Ukrainian** and **Russian**. This replaces the
former "i18n is a non-goal" line in §1 and the English-only UI row in `CLAUDE.md` §1.

### 19.1 Scope

Every user-visible string is translated: frame meta, rail, hero, step row, both project cards, stack
category names, the About block, the contact band, both modals, all form labels, placeholders,
validation messages and the `aria-live` announcements. Nothing may be left hardcoded in a component.

Not translated: brand mark (`DML`), project names, technology names on chips, URLs, and the language
switcher's own labels (`EN` / `UA` / `RU`).

### 19.2 Mechanism

- No i18n library in v1. A typed dictionary per locale, one flat key namespace, resolved through a
  single lookup helper. Adding a library is a §17-class decision, not a silent one.
- `type Locale = 'en' | 'uk' | 'ru'` with `en` as the fallback for any missing key. A missing key is
  a build-time type error, never a silent empty string.
- Copy lives in `src/content/i18n/<locale>.ts` and is typed against the English dictionary, so every
  locale is structurally forced to be complete.
- **No locale-prefixed routes in v1.** The site stays a single route; the switcher swaps the
  dictionary client-side and persists the choice in `localStorage`. If SEO later needs `/uk` and
  `/ru` URLs, that is a new roadmap item with `hreflang` and per-locale metadata.
- `<html lang>` is updated whenever the locale changes — screen readers must not read Ukrainian text
  with an English voice.

### 19.3 Switcher

- Sits in the top frame bar, right of the identity line.
- Three controls, uppercase mono at the micro scale, matching the frame's meta type.
- The current locale is marked with `aria-pressed="true"` and the accent colour; the group carries an
  accessible label.
- 44×44px minimum hit area like every other control (§11).
- Switching never scrolls, never closes an open modal, and never resets an open accordion panel.

### 19.4 Copy discipline

- English is written first and is the source of truth. Ukrainian and Russian are translations of it,
  not independent rewrites.
- Ukrainian uses `проєкт`, not `проект`.
- The display headline is set in Anton, which has **no Cyrillic coverage**. The Ukrainian and Russian
  headline, project titles and band figure therefore need either a Cyrillic display face with the
  same condensed weight, or a documented fallback. Until one is chosen this is an open question
  (§17.10) — the prototype falls back to a system condensed face and it looks wrong.

---

## 20. Static HTML prototype

The prototype is the **first** deliverable of the project, before any tooling or framework work. Its
job is to lock the layout grammar and the token set against a real browser, cheaply, so that the
React build ports a settled design instead of designing in JSX.

### 20.1 Contents

```
prototype/
├─ index.html      # full page: frame chrome, hero, projects, stack, about, contact band, both modals
├─ styles.css      # every token from §4 as a CSS custom property, mobile-first, no framework
├─ main.js         # accordion, modals, carousel, form validation, locale switching
├─ i18n.js         # the three dictionaries
├─ assets/fonts/   # self-hosted woff2, no remote URLs (§4.2)
└─ gallery/        # the supplied project screenshots (§6.2.1)
```

### 20.2 Rules

- Zero dependencies and zero build step. It opens from the filesystem.
- No Three.js and no GSAP. The hero field is a static, seeded SVG constellation which doubles as the
  no-WebGL fallback specified in §5.5.
- Behaviour that the React build gets from a library is still implemented by hand here — focus trap,
  scroll lock, focus restore, roving tabindex — because the prototype is also the accessibility
  rehearsal.
- The contact form validates fully client-side and stubs delivery. No network call exists until §7.2.
- Verified in a real browser at 320 / 360 / 390 / 744 / 1024 / 1280 / 1920 before sign-off.

### 20.3 Status

The prototype is a throwaway reference, not a maintained artefact. Once Phase 3 reproduces a section
in React, the corresponding prototype markup stops being authoritative. It is deleted at the end of
Phase 3, and `docs/` keeps the screenshots.
