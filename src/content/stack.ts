import type { StackCategory } from '@/types/stack';

export const STACK: StackCategory[] = [
  {
    id: 'frontend',
    index: '01',
    nameKey: 'stack.frontend',
    items: [
      { id: 'nextjs', label: 'Next.js', version: '16' },
      { id: 'react', label: 'React', version: '19' },
      { id: 'typescript', label: 'TypeScript' },
      { id: 'tailwind', label: 'Tailwind CSS', version: 'v4' },
      { id: 'shadcn', label: 'shadcn/ui' },
      { id: 'zustand', label: 'Zustand' },
      { id: 'react-hook-form', label: 'React Hook Form' },
      { id: 'zod', label: 'Zod' },
      { id: 'sveltekit', label: 'SvelteKit' },
    ],
  },
  {
    id: 'backend',
    index: '02',
    nameKey: 'stack.backend',
    items: [
      { id: 'nestjs', label: 'NestJS', version: '11' },
      { id: 'prisma', label: 'Prisma', version: '7' },
      { id: 'postgresql', label: 'PostgreSQL', version: '16' },
      { id: 'redis', label: 'Redis', version: '7' },
      { id: 'bullmq', label: 'BullMQ' },
      { id: 'passport-jwt', label: 'Passport + JWT' },
      { id: 'socketio', label: 'Socket.IO' },
      { id: 'stripe', label: 'Stripe' },
      { id: 'swagger', label: 'Swagger' },
      { id: 'class-validator', label: 'class-validator' },
    ],
  },
  {
    id: '3d-animation',
    index: '03',
    nameKey: 'stack.3d',
    items: [
      { id: 'threejs', label: 'Three.js' },
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
      { id: 'docker-compose', label: 'Docker Compose' },
      { id: 'github-actions', label: 'GitHub Actions' },
      { id: 'turborepo', label: 'Turborepo' },
      { id: 'pnpm-workspaces', label: 'pnpm workspaces' },
      { id: 'vercel', label: 'Vercel' },
      { id: 'mailpit', label: 'Mailpit' },
    ],
  },
  {
    id: 'testing',
    index: '06',
    nameKey: 'stack.testing',
    items: [
      { id: 'jest', label: 'Jest' },
      { id: 'ts-jest', label: 'ts-jest' },
      { id: 'vitest', label: 'Vitest' },
      { id: 'playwright', label: 'Playwright' },
      { id: 'eslint', label: 'ESLint' },
      { id: 'prettier', label: 'Prettier' },
    ],
  },
];
