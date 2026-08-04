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

/** mulberry32. Seeded so the field is identical on every render and reviewable in a diff. */
function createRandom(seed: number): () => number {
  let state = seed >>> 0;

  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
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

      const distance = Math.hypot(a.x - b.x, a.y - b.y);
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
