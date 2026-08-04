import type { StackCategory } from '@/types/stack';

export const STACK: StackCategory[] = [
  {
    id: 'frontend',
    index: '01',
    nameKey: 'stack.frontend',
    items: [
      { id: 'nextjs', label: 'Next.js', version: '16', iconId: 'nextjs' },
      { id: 'react', label: 'React', version: '19', iconId: 'react' },
      { id: 'typescript', label: 'TypeScript', iconId: 'typescript' },
      { id: 'tailwind', label: 'Tailwind CSS', version: 'v4', iconId: 'tailwind' },
      { id: 'shadcn', label: 'shadcn/ui' },
      { id: 'zustand', label: 'Zustand' },
      { id: 'react-hook-form', label: 'React Hook Form' },
      { id: 'zod', label: 'Zod' },
      { id: 'sveltekit', label: 'SvelteKit', iconId: 'sveltekit' },
    ],
  },
  {
    id: 'backend',
    index: '02',
    nameKey: 'stack.backend',
    items: [
      { id: 'nestjs', label: 'NestJS', version: '11', iconId: 'nestjs' },
      { id: 'prisma', label: 'Prisma', version: '7', iconId: 'prisma' },
      { id: 'postgresql', label: 'PostgreSQL', version: '16', iconId: 'postgresql' },
      { id: 'redis', label: 'Redis', version: '7', iconId: 'redis' },
      { id: 'bullmq', label: 'BullMQ' },
      { id: 'passport-jwt', label: 'Passport + JWT', iconId: 'passport-jwt' },
      { id: 'socketio', label: 'Socket.IO', iconId: 'socketio' },
      { id: 'stripe', label: 'Stripe' },
      { id: 'swagger', label: 'Swagger', iconId: 'swagger' },
      { id: 'class-validator', label: 'class-validator' },
    ],
  },
  {
    id: '3d-animation',
    index: '03',
    nameKey: 'stack.3d',
    items: [
      { id: 'threejs', label: 'Three.js', iconId: 'threejs' },
      { id: 'r3f', label: 'React Three Fiber' },
      { id: 'drei', label: 'drei' },
      { id: 'gsap', label: 'GSAP' },
      { id: 'scrolltrigger', label: 'ScrollTrigger' },
    ],
  },
  {
    id: 'platforms',
    index: '04',
    nameKey: 'stack.platforms',
    items: [
      { id: 'telegram-mini-apps', label: 'Telegram Mini Apps' },
      { id: 'telegram-bot-api', label: 'Telegram Bot API' },
    ],
  },
  {
    id: 'devops',
    index: '05',
    nameKey: 'stack.devops',
    items: [
      { id: 'docker-compose', label: 'Docker Compose', iconId: 'docker-compose' },
      { id: 'github-actions', label: 'GitHub Actions', iconId: 'github-actions' },
      { id: 'turborepo', label: 'Turborepo' },
      { id: 'pnpm-workspaces', label: 'pnpm workspaces', iconId: 'pnpm-workspaces' },
      { id: 'vercel', label: 'Vercel', iconId: 'vercel' },
      { id: 'mailpit', label: 'Mailpit' },
    ],
  },
  {
    id: 'testing',
    index: '06',
    nameKey: 'stack.testing',
    items: [
      { id: 'jest', label: 'Jest', iconId: 'jest' },
      { id: 'ts-jest', label: 'ts-jest' },
      { id: 'vitest', label: 'Vitest', iconId: 'vitest' },
      { id: 'playwright', label: 'Playwright', iconId: 'playwright' },
      { id: 'eslint', label: 'ESLint', iconId: 'eslint' },
      { id: 'prettier', label: 'Prettier' },
    ],
  },
];
