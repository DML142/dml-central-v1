# dml-central

My personal portfolio landing. One route, five sections, two modals. Dark violet, hairline frame,
condensed display type. The only server-side work is a single endpoint that forwards a contact
message to my Telegram bot.

The page ships in English, Ukrainian and Russian. English is the source; the other two are
translations of it.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript strict · Tailwind CSS v4 · shadcn/ui · GSAP ·
Zustand · Zod · React Hook Form. Three.js and React Three Fiber arrive with the hero particle field.

## Requirements

- Node.js 20 or newer
- pnpm 11

## Setup

```bash
pnpm install
cp .env.example .env
pnpm dev
```

The dev server runs on <http://localhost:3000>.

## Environment

| Variable               | Where it is read  | Purpose                            |
| ---------------------- | ----------------- | ---------------------------------- |
| `TELEGRAM_BOT_TOKEN`   | server only       | Bot that delivers contact messages |
| `TELEGRAM_CHAT_ID`     | server only       | Chat the messages land in          |
| `NEXT_PUBLIC_SITE_URL` | client and server | Canonical URL for metadata         |

`TELEGRAM_*` values are server-side only. They never reach the client bundle, an error message or a
test fixture.

## Scripts

| Script            | What it does                                |
| ----------------- | ------------------------------------------- |
| `pnpm dev`        | Dev server                                  |
| `pnpm build`      | Production build                            |
| `pnpm start`      | Serve the production build                  |
| `pnpm typecheck`  | `tsc --noEmit`                              |
| `pnpm lint`       | ESLint over the repository                  |
| `pnpm lint:fix`   | ESLint with `--fix`                         |
| `pnpm format`     | Prettier over the repository                |
| `pnpm test`       | Vitest unit and component tests             |
| `pnpm test:watch` | Vitest in watch mode                        |
| `pnpm test:e2e`   | Playwright, builds and serves the app first |

Playwright needs its browsers once: `pnpm exec playwright install`.

## Layout

```
docs/adr/          Architecture decision records
prototype/         Throwaway static HTML that locked the layout; deleted after phase 3
public/            Self-hosted fonts, project screenshots, OG assets
src/app/           Routes, root layout, global tokens
src/components/    ui (shadcn), layout (frame chrome), common (primitives)
src/features/      hero, projects, stack, contact — each owns its components and tests
src/hooks/         Shared behaviour
src/lib/           Pure logic: telegram, validation, env, utils
src/stores/        Zustand stores
src/content/       Typed content and the three locale dictionaries
src/config/        Motion, breakpoints, particle parameters
tests/unit/        Vitest
tests/e2e/         Playwright
```

## Conventions

Husky runs `lint-staged` and `tsc --noEmit` before every commit, and the unit tests before every
push. A commit that fails the hooks is not a commit.

Branch per slice, Conventional Commits, PR into `main`. Nothing lands on `main` directly.
