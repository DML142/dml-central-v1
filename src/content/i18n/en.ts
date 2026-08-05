// The source dictionary. Ukrainian and Russian are translations of it, never rewrites
// (tech.md 19.4). Every other locale is typed against this object, so a missing key is a
// compile error rather than an empty string at runtime.
export const en = {
  skip: 'Skip to content',
  'meta.identity': 'DML — Full-stack engineer, systems & interfaces',
  'meta.attribution': 'Portfolio — v1 · Est. 2026',
  'meta.domain': 'dml-central.dev',
  'meta.location': 'Remote · 2026',
  'lang.label': 'Language',
  'nav.elsewhere': 'Elsewhere',
  'rail.meta1': 'Full stack',
  'rail.meta2': 'Web & realtime',
  'rail.meta3': 'Remote',
  'rail.github': 'GitHub',
  'rail.telegram': 'Telegram',
  'rail.email': 'Email',
  'hero.eyebrow': 'Full-stack engineer — available for work',
  'hero.est': 'Est. 2026',
  'hero.headline': 'Full-stack systems that stay up.',
  'hero.copy':
    'Next.js, NestJS and Docker fullstack developer. I make creative sites that actually work. Started almost two years ago and have not stopped since.',
  'hero.cta': 'Contact me now',
  'hero.stats': '2 projects · 6 stack areas · No agency in between',
  'step1.title': 'Build',
  'step1.text':
    'Typed end to end. Zod at every boundary, strict TypeScript on both sides of the wire.',
  'step2.title': 'Ship',
  'step2.text':
    'Docker Compose locally, GitHub Actions in CI, Vercel and preview URLs per pull request.',
  'step3.title': 'Maintain',
  'step3.text':
    'Tests that describe the contract, not the implementation. A dead project stays listed and says so.',
  'projects.title': 'Projects',
  'p1.status': 'Active',
  'p1.tagline': 'Monorepo · Auth · Billing · Realtime',
  'p1.summary':
    'A production-shaped SaaS skeleton in a pnpm/Turborepo monorepo. Next.js 16 and React 19 on the front, NestJS 11 with Prisma 7 and PostgreSQL 16 behind it. Auth runs on Redis-backed refresh-token families, background work on BullMQ, chat over Socket.IO, and payment on Stripe checkout with signed webhooks.',
  'p1.h1': 'Refresh-token families in Redis — reuse detection revokes the whole family',
  'p1.h2': 'BullMQ workers split from the API process, retries and dead-letter handling',
  'p1.h3': 'Stripe webhooks verified by signature before a single row is touched',
  'p1.h4': 'Swagger generated from the DTOs, not written by hand',
  'p1.h5': 'Whole stack up with one Docker Compose file',
  'p2.badge': 'Deprecated',
  'p2.tagline': 'Landing · 3D · Shaders · Creative',
  'p2.summary':
    'My first creative site taken all the way to a finished, deployed state. It leans hard on 3D and custom shaders, and that is exactly why it ended up unoptimised. It is not a commercial project — it is the proof that I can build this kind of thing.',
  'p2.note': 'No longer maintained. Kept for reference; links and gallery still work.',
  'action.gallery': 'Open gallery',
  'action.repository': 'Repository',
  'action.live': 'Live',
  'stack.title': 'Stack',
  'stack.frontend': 'Frontend',
  'stack.backend': 'Backend',
  'stack.3d': '3D & Animation',
  'stack.platforms': 'Platforms',
  'stack.devops': 'DevOps & Infrastructure',
  'stack.testing': 'Testing & Quality',
  'about.title': 'About',
  'about.copy':
    'I am Maxim. I am 18, based in Ukraine and working remotely. Node.js has been my main track for a year and a half — long enough to take an optimised site with WebSocket realtime and full authentication from an empty folder to done in one month. Before the web I built game mods at a development company. I settle into a new team fast.',
  'about.age.label': 'Age',
  'about.age.value': '18',
  'about.based.label': 'Based',
  'about.based.value': 'Ukraine · remote',
  'about.languages.label': 'Languages',
  'about.languages.value': 'Ukrainian, Russian, English',
  'about.node.label': 'Node.js',
  'about.node.value': '1.5 years',
  'about.before.label': 'Before the web',
  'about.before.value': 'Game-mod development',
  'band.figure': 'Got something that has to work?',
  'band.copy':
    'Tell me what it does, who it is for, and what happens when it breaks. I read every message and answer in a day. No form-to-CRM funnel, no discovery call before there is anything to discover.',
  'band.cta': 'Contact',
  'gallery.title': '{project} — gallery',
  'gallery.close': 'Close gallery',
  'alt.saas.1':
    'COS Code landing page on mobile: the headline “Build fearlessly” over a starfield, with the one-line install command and the primary calls to action.',
  'alt.saas.2':
    'A constellation diagram titled “One command, fully wired”, linking cos init to .md context, agent, MCP, OpenSpec, CodeRabbit and skills.',
  'alt.saas.3':
    'The features section listing fast init, the CLI tool, the in-browser COS Cloud workspace and project import/export.',
  'alt.saas.4':
    'A customer quote about the setup tax, above the row of integrations the product wires up.',
  'alt.saas.5':
    'The questions section answering why the tooling exists, what it costs and how it behaves on an existing project.',
  'alt.saas.6':
    'Three pricing tiers — Lite, Pro and Ultra — each listing its storage allowance and included agent access.',
  'alt.saas.7':
    'The chat dashboard: a workspace list on the left and a simulated assistant reply in the thread.',
  'alt.saas.8':
    'Account settings on the free plan, showing cloud storage and monthly message usage, billing and the session controls.',
  'alt.saas.9':
    'The same settings screen on the Ultra plan, with unlimited messages and a manage-billing action.',
  'alt.saas.10': 'The rename-workspace dialog open over the chat thread.',
  'alt.saas.11': 'The avatar menu with upload and delete actions.',
  'alt.saas.12':
    'The admin overview: user and subscription totals, a breakdown by role and tier, and a signups chart for the last 30 days.',
  'alt.saas.13': "A chat exported to JSON, opened in an editor beside the app's import control.",
  'alt.dmls.1':
    'The DMLs Solutions landing page: the DML_142 wordmark under a “ready for hire” line, framed by ornamental corners.',
  'alt.dmls.2':
    'The about screen rendered as a green CRT terminal, with the biography set as the contents of about_me.txt.',
  'alt.dmls.3': 'The Next.js skill card floating over a large rotating N built in 3D.',
  'alt.dmls.4':
    'The card covering GSAP, Three.js and React Three Fiber, over a 3D wireframe triangle.',
  'alt.dmls.5':
    'The contact screen: links over a rendered black hole with a glowing accretion disc.',
  'gallery.prev': 'Previous image',
  'gallery.next': 'Next image',
  'gallery.thumbs': 'Gallery thumbnails',
  'gallery.thumb': 'Go to image {n}',
  'gallery.announce': 'Image {n}',
  'form.title': 'Start a conversation',
  'form.close': 'Close form',
  'form.name': 'Name *',
  'form.namePlaceholder': 'How should I address you',
  'form.email': 'Email *',
  'form.emailPlaceholder': 'you@company.com',
  'form.telegram': 'Telegram',
  'form.telegramPlaceholder': '@handle',
  'form.optional': 'Optional',
  'form.message': 'Message *',
  'form.messagePlaceholder': 'What it does, who it is for, and what happens when it breaks.',
  'form.company': 'Company',
  'form.submit': 'Send message',
  'form.sending': 'Sending…',
  'form.successEyebrow': 'Delivered',
  'form.successTitle': 'Message sent.',
  'form.successCopy':
    'It lands in my Telegram directly. I answer within a day — if you do not hear back, the email above always works.',
  'form.sendAnother': 'Send another',
  'err.nameRequired': 'Name is required.',
  'err.nameShort': 'Name must be at least 2 characters.',
  'err.nameLong': 'Name must be 64 characters or fewer.',
  'err.emailRequired': 'Email is required.',
  'err.emailInvalid': 'Enter a valid email address.',
  'err.emailLong': 'Email must be 254 characters or fewer.',
  'err.telegramInvalid': 'Use 4–32 letters, digits or underscores.',
  'err.messageRequired': 'Message is required.',
  'err.messageShort': 'Message must be at least 10 characters.',
  'err.messageLong': 'Message must be {n} characters or fewer.',
  'err.banner': 'Could not send the message. Wait a moment and try again.',
  'err.announce': 'The form has errors. Check the highlighted fields.',
  'err.rateLimited': 'Too many messages. Try again in {n} min.',
  'err.delivery': 'The message did not go through. Try again in a moment.',
  'err.network': 'Could not reach the server. Check your connection and try again.',
} as const;

export type TranslationKey = keyof typeof en;
export type Dictionary = Record<TranslationKey, string>;
