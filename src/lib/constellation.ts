import { createRandom } from '@/lib/random';

const WIDTH = 1200;
const HEIGHT = 800;
const COUNT = 150;
const MAX_DISTANCE = 132;
const SEED = 20260804;

export interface ConstellationPoint {
  x: number;
  y: number;
  depth: number;
}

export interface ConstellationLine {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  alpha: number;
}

export interface Constellation {
  width: number;
  height: number;
  points: ConstellationPoint[];
  lines: ConstellationLine[];
}

/**
 * The static stand-in for the WebGL field, which also serves as the no-WebGL fallback
 * (tech.md 5.5). Depth drives radius and opacity, so distance reads as focus.
 */
export function buildConstellation(): Constellation {
  const random = createRandom(SEED);

  const points: ConstellationPoint[] = Array.from({ length: COUNT }, () => {
    const depth = random();
    return { x: random() * WIDTH, y: random() * HEIGHT, depth };
  });

  const lines: ConstellationLine[] = [];

  for (let i = 0; i < points.length; i += 1) {
    for (let j = i + 1; j < points.length; j += 1) {
      const a = points[i];
      const b = points[j];
      if (!a || !b) continue;

      // Not `Math.hypot`: its precision is implementation-defined, and this number reaches the
      // server-rendered markup as a `stroke-opacity`. `Math.sqrt` is exactly rounded, so the
      // server and every client engine agree on the attribute to the last digit.
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance > MAX_DISTANCE) continue;

      lines.push({
        x1: a.x,
        y1: a.y,
        x2: b.x,
        y2: b.y,
        alpha: (1 - distance / MAX_DISTANCE) * 0.28 * (1 - (a.depth + b.depth) / 2.6),
      });
    }
  }

  return { width: WIDTH, height: HEIGHT, points, lines };
}

export function pointRadius(depth: number): number {
  return 0.9 + depth * 2.4;
}

export function pointOpacity(depth: number): number {
  return 0.85 - depth * 0.6;
}
