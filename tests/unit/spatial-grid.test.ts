import { describe, expect, it } from 'vitest';

import { createRandom } from '@/lib/random';
import { SpatialGrid } from '@/lib/three/spatial-grid';

const BOUNDS = { width: 24, height: 14, depth: 12 };
const CELL_SIZE = 2.6;

function seedPositions(count: number, seed: number): Float32Array {
  const random = createRandom(seed);
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i += 1) {
    positions[i * 3] = (random() - 0.5) * BOUNDS.width;
    positions[i * 3 + 1] = (random() - 0.5) * BOUNDS.height;
    positions[i * 3 + 2] = (random() - 0.5) * BOUNDS.depth;
  }

  return positions;
}

function pairKey(a: number, b: number): string {
  return `${a}-${b}`;
}

/** Every pair within `maxDistance`, found the slow way, as the reference the grid has to match. */
function bruteForcePairs(positions: Float32Array, count: number, maxDistance: number): Set<string> {
  const pairs = new Set<string>();

  for (let i = 0; i < count; i += 1) {
    for (let j = i + 1; j < count; j += 1) {
      const dx = positions[i * 3]! - positions[j * 3]!;
      const dy = positions[i * 3 + 1]! - positions[j * 3 + 1]!;
      const dz = positions[i * 3 + 2]! - positions[j * 3 + 2]!;

      if (Math.hypot(dx, dy, dz) <= maxDistance) pairs.add(pairKey(i, j));
    }
  }

  return pairs;
}

function gridPairs(
  grid: SpatialGrid,
  positions: Float32Array,
  count: number,
  maxDistance: number,
): Set<string> {
  const out = new Int32Array(512);
  const pairs = new Set<string>();

  grid.rebuild(positions, count);

  for (let i = 0; i < count; i += 1) {
    const found = grid.queryNeighbours(i, positions, out);

    for (let n = 0; n < found; n += 1) {
      const j = out[n]!;
      const dx = positions[i * 3]! - positions[j * 3]!;
      const dy = positions[i * 3 + 1]! - positions[j * 3 + 1]!;
      const dz = positions[i * 3 + 2]! - positions[j * 3 + 2]!;

      if (Math.hypot(dx, dy, dz) <= maxDistance) pairs.add(pairKey(Math.min(i, j), Math.max(i, j)));
    }
  }

  return pairs;
}

describe('SpatialGrid', () => {
  it('finds exactly the pairs a brute-force search finds', () => {
    for (const seed of [1, 20260804, 99]) {
      const count = 260;
      const positions = seedPositions(count, seed);
      const grid = new SpatialGrid({ bounds: BOUNDS, cellSize: CELL_SIZE, capacity: count });

      const expected = bruteForcePairs(positions, count, CELL_SIZE);
      const actual = gridPairs(grid, positions, count, CELL_SIZE);

      expect(actual.size).toBe(expected.size);
      expect([...actual].sort()).toEqual([...expected].sort());
    }
  });

  it('reports each pair once, from the lower index', () => {
    const count = 40;
    const positions = seedPositions(count, 5);
    const grid = new SpatialGrid({ bounds: BOUNDS, cellSize: CELL_SIZE, capacity: count });
    const out = new Int32Array(512);

    grid.rebuild(positions, count);

    for (let i = 0; i < count; i += 1) {
      const found = grid.queryNeighbours(i, positions, out);
      for (let n = 0; n < found; n += 1) expect(out[n]!).toBeGreaterThan(i);
    }
  });

  it('still indexes a point that drifted outside the volume', () => {
    const positions = new Float32Array([0, 0, 0, 400, 400, 400, 0.5, 0, 0]);
    const grid = new SpatialGrid({ bounds: BOUNDS, cellSize: CELL_SIZE, capacity: 3 });
    const out = new Int32Array(8);

    grid.rebuild(positions, 3);

    expect(grid.size).toBe(3);
    expect(Array.from(out.slice(0, grid.queryNeighbours(0, positions, out)))).toContain(2);
    expect(grid.queryNeighbours(1, positions, out)).toBe(0);
  });

  it('never writes past the buffer it was handed', () => {
    const count = 60;
    const positions = new Float32Array(count * 3);
    const grid = new SpatialGrid({ bounds: BOUNDS, cellSize: CELL_SIZE, capacity: count });
    const out = new Int32Array(4);

    grid.rebuild(positions, count);

    expect(grid.queryNeighbours(0, positions, out)).toBe(4);
  });

  it('rebuilds from scratch instead of accumulating', () => {
    const count = 60;
    const positions = seedPositions(count, 3);
    const grid = new SpatialGrid({ bounds: BOUNDS, cellSize: CELL_SIZE, capacity: count });
    const out = new Int32Array(512);

    grid.rebuild(positions, count);
    const first = grid.queryNeighbours(0, positions, out);

    grid.rebuild(positions, count);
    const second = grid.queryNeighbours(0, positions, out);

    expect(second).toBe(first);
  });
});
