import { beforeEach, describe, expect, it } from 'vitest';

import { ParticleField, type ParticleFieldOptions } from '@/lib/three/particle-field';

const BOUNDS = { width: 24, height: 14, depth: 12 };

const OPTIONS: ParticleFieldOptions = {
  count: 120,
  seed: 20260804,
  bounds: BOUNDS,
  driftAmplitude: 0.12,
  driftFrequency: 0.16,
  repulsionRadius: 3.2,
  repulsionStrength: 0.85,
  springK: 0.015,
  damping: 0.92,
};

function distance(positions: Float32Array, index: number, x: number, y: number): number {
  const offset = index * 3;
  return Math.hypot(positions[offset]! - x, positions[offset + 1]! - y);
}

function run(
  field: ParticleField,
  frames: number,
  dt: number,
  pointer: { x: number; y: number } | null,
): void {
  for (let i = 0; i < frames; i += 1) field.update(dt, pointer);
}

/** The pointer sits on `z = 0`, so only a point near that plane is inside the repulsion radius. */
function indexNearestToPlane(field: ParticleField): number {
  let best = 0;

  for (let i = 1; i < field.count; i += 1) {
    if (Math.abs(field.positions[i * 3 + 2]!) < Math.abs(field.positions[best * 3 + 2]!)) best = i;
  }

  return best;
}

describe('ParticleField', () => {
  let field: ParticleField;

  beforeEach(() => {
    field = new ParticleField(OPTIONS);
  });

  it('seeds every point inside the field volume', () => {
    expect(field.positions).toHaveLength(OPTIONS.count * 3);

    for (let i = 0; i < OPTIONS.count; i += 1) {
      const offset = i * 3;
      expect(Math.abs(field.positions[offset]!)).toBeLessThanOrEqual(BOUNDS.width / 2);
      expect(Math.abs(field.positions[offset + 1]!)).toBeLessThanOrEqual(BOUNDS.height / 2);
      expect(Math.abs(field.positions[offset + 2]!)).toBeLessThanOrEqual(BOUNDS.depth / 2);
    }
  });

  it('lays out the same field for the same seed', () => {
    const twin = new ParticleField(OPTIONS);

    expect(Array.from(twin.positions)).toEqual(Array.from(field.positions));
  });

  it('drifts without wandering away from the origin', () => {
    const before = Float32Array.from(field.positions);

    run(field, 600, 1 / 60, null);

    for (let i = 0; i < OPTIONS.count; i += 1) {
      const offset = i * 3;
      expect(Math.abs(field.positions[offset]! - before[offset]!)).toBeLessThan(0.5);
      expect(Math.abs(field.positions[offset + 1]! - before[offset + 1]!)).toBeLessThan(0.5);
      expect(Math.abs(field.positions[offset + 2]! - before[offset + 2]!)).toBeLessThan(0.5);
    }
  });

  it('pushes points away from the pointer and springs them back', () => {
    const index = indexNearestToPlane(field);
    const startX = field.positions[index * 3]!;
    const startY = field.positions[index * 3 + 1]!;
    const pointer = { x: startX - 0.4, y: startY };

    run(field, 60, 1 / 60, pointer);
    const pushed = distance(field.positions, index, startX, startY);

    expect(pushed).toBeGreaterThan(0.1);
    expect(field.positions[index * 3]!).toBeGreaterThan(startX);

    run(field, 900, 1 / 60, null);
    const settled = distance(field.positions, index, startX, startY);

    expect(settled).toBeLessThan(pushed);
    expect(settled).toBeLessThan(0.5);
  });

  it('leaves points outside the repulsion radius alone', () => {
    const far = { x: 1000, y: 1000 };
    const before = Float32Array.from(field.positions);

    run(field, 30, 1 / 60, far);
    const withPointer = Float32Array.from(field.positions);

    const drifted = new ParticleField(OPTIONS);
    run(drifted, 30, 1 / 60, null);

    expect(Array.from(withPointer)).toEqual(Array.from(drifted.positions));
    expect(Array.from(withPointer)).not.toEqual(Array.from(before));
  });

  it('clamps a stalled frame to a thirtieth of a second', () => {
    const stalled = new ParticleField(OPTIONS);
    const clamped = new ParticleField(OPTIONS);

    stalled.update(4, null);
    clamped.update(1 / 30, null);

    expect(Array.from(stalled.positions)).toEqual(Array.from(clamped.positions));
  });

  it('advances at the same rate regardless of frame rate', () => {
    const fast = new ParticleField(OPTIONS);
    const slow = new ParticleField(OPTIONS);

    run(fast, 120, 1 / 120, null);
    run(slow, 60, 1 / 60, null);

    for (let i = 0; i < OPTIONS.count * 3; i += 1) {
      expect(fast.positions[i]!).toBeCloseTo(slow.positions[i]!, 3);
    }
  });

  it('ignores a frame with no elapsed time', () => {
    const before = Float32Array.from(field.positions);

    field.update(0, null);

    expect(Array.from(field.positions)).toEqual(Array.from(before));
  });

  it('writes in place so the render buffer never has to be re-bound', () => {
    const buffer = field.positions;

    run(field, 10, 1 / 60, null);

    expect(field.positions).toBe(buffer);
  });

  it('stops simulating once disposed', () => {
    run(field, 10, 1 / 60, null);
    field.dispose();
    const after = Float32Array.from(field.positions);

    run(field, 10, 1 / 60, { x: 0, y: 0 });

    expect(Array.from(field.positions)).toEqual(Array.from(after));
  });
});
