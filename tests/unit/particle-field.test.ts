import { beforeEach, describe, expect, it } from 'vitest';

import { ParticleField, type ParticleFieldOptions } from '@/lib/three/particle-field';

const BOUNDS = { width: 24, height: 14, depth: 12 };

const OPTIONS: ParticleFieldOptions = {
  count: 120,
  seed: 20260804,
  bounds: BOUNDS,
  cameraZ: 14,
  boundsSlack: 0.08,
  driftAmplitude: 0.5,
  driftFrequency: 0.35,
  driftRateJitter: 0.5,
  repulsionRadius: 3.2,
  repulsionStrength: 0.85,
  springK: 0.015,
  damping: 0.92,
};

function run(
  field: ParticleField,
  frames: number,
  dt: number,
  pointer: { x: number; y: number } | null,
): void {
  for (let i = 0; i < frames; i += 1) field.update(dt, pointer);
}

/** The index whose point sits deepest in the volume — the hardest case for a pointer on `z = 0`. */
function deepestIndex(field: ParticleField): number {
  let best = 0;

  for (let i = 1; i < field.count; i += 1) {
    if (field.positions[i * 3 + 2]! < field.positions[best * 3 + 2]!) best = i;
  }

  return best;
}

/** Where a point at depth `z` appears when the pointer is unprojected onto `z = 0`. */
function pointerOver(
  field: ParticleField,
  index: number,
  offsetX: number,
): { x: number; y: number } {
  const offset = index * 3;
  const scale = OPTIONS.cameraZ / (OPTIONS.cameraZ - field.positions[offset + 2]!);

  return {
    x: (field.positions[offset]! + offsetX) * scale,
    y: field.positions[offset + 1]! * scale,
  };
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

    // The drift is a spring towards a target that never leaves the amplitude around the origin.
    const reach = OPTIONS.driftAmplitude * 2;

    for (let i = 0; i < OPTIONS.count; i += 1) {
      const offset = i * 3;
      expect(Math.abs(field.positions[offset]! - before[offset]!)).toBeLessThan(reach);
      expect(Math.abs(field.positions[offset + 1]! - before[offset + 1]!)).toBeLessThan(reach);
      expect(Math.abs(field.positions[offset + 2]! - before[offset + 2]!)).toBeLessThan(reach);
    }
  });

  it('pushes points away from the pointer and springs them back', () => {
    // A drifting field moves on its own, so the control isolates what the pointer actually did.
    const control = new ParticleField(OPTIONS);
    const pointer = pointerOver(field, 0, -0.4);

    // Measured a quarter of a second in: the spring's period is under a second, so a longer
    // window catches the point on its way back and reads as no push at all.
    run(field, 15, 1 / 60, pointer);
    run(control, 15, 1 / 60, null);
    const pushed = field.positions[0]! - control.positions[0]!;

    expect(pushed).toBeGreaterThan(0.3);

    run(field, 900, 1 / 60, null);
    run(control, 900, 1 / 60, null);

    expect(Math.abs(field.positions[0]! - control.positions[0]!)).toBeLessThan(pushed);
  });

  it('reacts to a pointer straight over a point however deep it sits', () => {
    const index = deepestIndex(field);
    const control = new ParticleField(OPTIONS);
    const pointer = pointerOver(field, index, -0.4);

    expect(Math.abs(field.positions[index * 3 + 2]!)).toBeGreaterThan(OPTIONS.repulsionRadius);

    run(field, 15, 1 / 60, pointer);
    run(control, 15, 1 / 60, null);

    expect(field.positions[index * 3]! - control.positions[index * 3]!).toBeGreaterThan(0.3);
  });

  it('never lets a point leave the volume by more than its slack', () => {
    const pointer = { x: 0, y: 0 };

    run(field, 1200, 1 / 60, pointer);

    const limitX = (BOUNDS.width / 2) * (1 + OPTIONS.boundsSlack);
    const limitY = (BOUNDS.height / 2) * (1 + OPTIONS.boundsSlack);
    const limitZ = (BOUNDS.depth / 2) * (1 + OPTIONS.boundsSlack);

    for (let i = 0; i < OPTIONS.count; i += 1) {
      expect(Math.abs(field.positions[i * 3]!)).toBeLessThanOrEqual(limitX);
      expect(Math.abs(field.positions[i * 3 + 1]!)).toBeLessThanOrEqual(limitY);
      expect(Math.abs(field.positions[i * 3 + 2]!)).toBeLessThanOrEqual(limitZ);
    }
  });

  it('drifts each point at its own rate rather than in lockstep', () => {
    const before = Float32Array.from(field.positions);

    run(field, 120, 1 / 60, null);

    const travelled = Array.from({ length: OPTIONS.count }, (_, i) =>
      Math.abs(field.positions[i * 3]! - before[i * 3]!),
    );
    const spread = Math.max(...travelled) - Math.min(...travelled);

    // A single shared frequency would move every point by nearly the same amount.
    expect(spread).toBeGreaterThan(0.2);
  });

  it('lays out a different field for a different seed', () => {
    const other = new ParticleField({ ...OPTIONS, seed: OPTIONS.seed + 1 });

    expect(Array.from(other.positions)).not.toEqual(Array.from(field.positions));
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
      expect(fast.positions[i]!).toBeCloseTo(slow.positions[i]!, 2);
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
