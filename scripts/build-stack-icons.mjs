import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

// Devicon ships several cuts per brand. `plain` is already a single monochrome path; `original` is
// multi-path and brand-coloured, but the icons are rendered as CSS masks, which flattens either one
// to a silhouette tinted by `currentColor`. So take whichever exists, preferring the simpler cut.
const VARIANTS = ['plain', 'original', 'line'];

// Only brands with a mark worth recognising at 14px. Everything else ships without one rather than
// with a generic glyph pretending to be a logo.
const ICONS = {
  nextjs: 'nextjs',
  react: 'react',
  typescript: 'typescript',
  tailwind: 'tailwindcss',
  sveltekit: 'svelte',
  nestjs: 'nestjs',
  prisma: 'prisma',
  postgresql: 'postgresql',
  redis: 'redis',
  'passport-jwt': 'passport',
  socketio: 'socketio',
  swagger: 'swagger',
  threejs: 'threejs',
  'docker-compose': 'docker',
  'github-actions': 'githubactions',
  'pnpm-workspaces': 'pnpm',
  vercel: 'vercel',
  jest: 'jest',
  vitest: 'vitest',
  playwright: 'playwright',
  eslint: 'eslint',
};

const SOURCE = 'node_modules/devicon/icons';
const TARGET = 'public/icons/stack';

async function pickVariant(brand) {
  const files = await readdir(join(SOURCE, brand));
  for (const variant of VARIANTS) {
    const name = `${brand}-${variant}.svg`;
    if (files.includes(name)) return name;
  }
  throw new Error(`no usable cut for ${brand}`);
}

await rm(TARGET, { recursive: true, force: true });
await mkdir(TARGET, { recursive: true });

let total = 0;

for (const [id, brand] of Object.entries(ICONS)) {
  const file = await pickVariant(brand);
  const svg = await readFile(join(SOURCE, brand, file), 'utf8');
  await writeFile(join(TARGET, `${id}.svg`), svg);
  total += Buffer.byteLength(svg);
  console.log(`${id.padEnd(18)} ${file}`);
}

console.log(
  `\n${String(Object.keys(ICONS).length)} icons, ${String(Math.round(total / 1024))} KiB`,
);
