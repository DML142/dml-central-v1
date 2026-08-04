import { describe, expect, it } from 'vitest';

import { FIELD_LOOK } from '@/config/particles';
import { createRandom } from '@/lib/random';
import { ConnectionField } from '@/lib/three/connection-field';
import { SpatialGrid } from '@/lib/three/spatial-grid';

const BOUNDS = { width: 24, height: 14, depth: 12 };
const MAX_DISTANCE = 2.6;

const LOOK = {
  maxDistance: MAX_DISTANCE,
  baseAlpha: FIELD_LOOK.connectionAlpha,
  depthDivisor: FIELD_LOOK.connectionDepthDivisor,
  halfDepth: BOUNDS.depth / 2,
};

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

function countPairs(positions: Float32Array, count: number): number {
  let pairs = 0;

  for (let i = 0; i < count; i += 1) {
    for (let j = i + 1; j < count; j += 1) {
      const dx = positions[i * 3]! - positions[j * 3]!;
      const dy = positions[i * 3 + 1]! - positions[j * 3 + 1]!;
      const dz = positions[i * 3 + 2]! - positions[j * 3 + 2]!;

      if (Math.hypot(dx, dy, dz) <= MAX_DISTANCE) pairs += 1;
    }
  }

  return pairs;
}

function build(positions: Float32Array, count: number, maxSegments: number): ConnectionField {
  const grid = new SpatialGrid({ bounds: BOUNDS, cellSize: MAX_DISTANCE, capacity: count });
  const connections = new ConnectionField({ ...LOOK, maxSegments });

  grid.rebuild(positions, count);
  connections.build(positions, count, grid);

  return connections;
}

describe('ConnectionField', () => {
  it('draws every pair within the connection distance', () => {
    const count = 260;
    const positions = seedPositions(count, 20260804);

    const connections = build(positions, count, 1400);

    expect(connections.segmentCount).toBe(countPairs(positions, count));
    expect(connections.vertexCount).toBe(connections.segmentCount * 2);
  });

  it('stops at the segment cap instead of growing the buffer', () => {
    const count = 260;
    const positions = seedPositions(count, 20260804);

    const connections = build(positions, count, 40);

    expect(connections.segmentCount).toBe(40);
    expect(connections.positions).toHaveLength(40 * 6);
    expect(connections.alphas).toHaveLength(40 * 2);
  });

  it('writes both ends of every segment it counts', () => {
    const positions = new Float32Array([0, 0, 0, 1, 0, 0]);

    const connections = build(positions, 2, 8);

    expect(connections.segmentCount).toBe(1);
    expect(Array.from(connections.positions.slice(0, 6))).toEqual([0, 0, 0, 1, 0, 0]);
    expect(connections.alphas[0]).toBe(connections.alphas[1]);
  });

  it('fades a line with distance and with depth', () => {
    const near = build(new Float32Array([0, 0, 0, 0.2, 0, 0]), 2, 8).alphas[0]!;
    const far = build(new Float32Array([0, 0, 0, 2.5, 0, 0]), 2, 8).alphas[0]!;
    const deep = build(new Float32Array([0, 0, -6, 0.2, 0, -6]), 2, 8).alphas[0]!;

    expect(near).toBeGreaterThan(far);
    expect(near).toBeGreaterThan(deep);
    expect(far).toBeGreaterThan(0);
    expect(near).toBeLessThanOrEqual(FIELD_LOOK.connectionAlpha);
  });

  it('drops the segments of the previous frame rather than appending', () => {
    const count = 120;
    const positions = seedPositions(count, 11);
    const grid = new SpatialGrid({ bounds: BOUNDS, cellSize: MAX_DISTANCE, capacity: count });
    const connections = new ConnectionField({ ...LOOK, maxSegments: 900 });

    grid.rebuild(positions, count);
    connections.build(positions, count, grid);
    const first = connections.segmentCount;

    connections.build(positions, count, grid);

    expect(connections.segmentCount).toBe(first);
  });
});
