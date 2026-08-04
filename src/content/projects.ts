import type { Project } from '@/types/project';

// Slide order is the trailing number in each file name, which also says what the shot is, so the
// mapping stays readable in a diff (tech.md 6.2.1). Aspect ratios run from 0.38 to 2.39 — nothing
// downstream may assume 16:9.
export const PROJECTS: Project[] = [
  {
    id: 'saas-ai-fullstack-portfolio',
    index: '01',
    title: 'COS Code',
    taglineKey: 'p1.tagline',
    summaryKey: 'p1.summary',
    highlightKeys: ['p1.h1', 'p1.h2', 'p1.h3', 'p1.h4', 'p1.h5'],
    statusKey: 'p1.status',
    tech: [
      'Next.js',
      'React',
      'TypeScript',
      'Tailwind',
      'NestJS',
      'Prisma',
      'PostgreSQL',
      'Redis',
      'BullMQ',
      'Socket.IO',
      'Stripe',
      'Docker',
    ],
    status: 'active',
    emphasis: 'primary',
    links: [
      {
        labelKey: 'action.repository',
        href: 'https://github.com/DML142/saas-ai-fullstack-portfolio',
        kind: 'repository',
      },
    ],
    gallery: [
      {
        src: '/projects/saas-ai-fullstack-portfolio/hero1.png',
        altKey: 'alt.saas.1',
        width: 413,
        height: 812,
      },
      {
        src: '/projects/saas-ai-fullstack-portfolio/about2.png',
        altKey: 'alt.saas.2',
        width: 413,
        height: 812,
      },
      {
        src: '/projects/saas-ai-fullstack-portfolio/features3.png',
        altKey: 'alt.saas.3',
        width: 413,
        height: 812,
      },
      {
        src: '/projects/saas-ai-fullstack-portfolio/reviews4.png',
        altKey: 'alt.saas.4',
        width: 413,
        height: 812,
      },
      {
        src: '/projects/saas-ai-fullstack-portfolio/qna5.png',
        altKey: 'alt.saas.5',
        width: 413,
        height: 810,
      },
      {
        src: '/projects/saas-ai-fullstack-portfolio/pricing6.png',
        altKey: 'alt.saas.6',
        width: 310,
        height: 817,
      },
      {
        src: '/projects/saas-ai-fullstack-portfolio/dashboard7.jpg',
        altKey: 'alt.saas.7',
        width: 950,
        height: 974,
      },
      {
        src: '/projects/saas-ai-fullstack-portfolio/settings8.jpg',
        altKey: 'alt.saas.8',
        width: 781,
        height: 491,
      },
      {
        src: '/projects/saas-ai-fullstack-portfolio/settings2_9.jpg',
        altKey: 'alt.saas.9',
        width: 765,
        height: 479,
      },
      {
        src: '/projects/saas-ai-fullstack-portfolio/rename10.jpg',
        altKey: 'alt.saas.10',
        width: 749,
        height: 576,
      },
      {
        src: '/projects/saas-ai-fullstack-portfolio/avatar11.jpg',
        altKey: 'alt.saas.11',
        width: 275,
        height: 222,
      },
      {
        src: '/projects/saas-ai-fullstack-portfolio/admin12.jpg',
        altKey: 'alt.saas.12',
        width: 1001,
        height: 902,
      },
      {
        src: '/projects/saas-ai-fullstack-portfolio/import_export13.jpg',
        altKey: 'alt.saas.13',
        width: 1280,
        height: 535,
      },
    ],
  },
  {
    id: 'dmls-solutions',
    index: '02',
    title: 'DMLs Solutions',
    taglineKey: 'p2.tagline',
    summaryKey: 'p2.summary',
    highlightKeys: [],
    noteKey: 'p2.note',
    statusKey: 'p2.badge',
    tech: [
      'Next.js',
      'React',
      'TypeScript',
      'Tailwind',
      'Three.js',
      'React Three Fiber',
      'GSAP',
      'Vercel',
    ],
    status: 'deprecated',
    emphasis: 'secondary',
    links: [
      {
        labelKey: 'action.repository',
        href: 'https://github.com/DML142/dmls-solutions',
        kind: 'repository',
      },
      { labelKey: 'action.live', href: 'https://dml-142.vercel.app/', kind: 'live' },
    ],
    gallery: [
      { src: '/projects/dmls-solutions/hero1.png', altKey: 'alt.dmls.1', width: 1865, height: 960 },
      {
        src: '/projects/dmls-solutions/about2.png',
        altKey: 'alt.dmls.2',
        width: 1261,
        height: 955,
      },
      { src: '/projects/dmls-solutions/next3.png', altKey: 'alt.dmls.3', width: 1261, height: 955 },
      {
        src: '/projects/dmls-solutions/threejs4.png',
        altKey: 'alt.dmls.4',
        width: 1261,
        height: 955,
      },
      {
        src: '/projects/dmls-solutions/black5.png',
        altKey: 'alt.dmls.5',
        width: 1859,
        height: 965,
      },
    ],
  },
];

export function findProject(id: string): Project | undefined {
  return PROJECTS.find((project) => project.id === id);
}
