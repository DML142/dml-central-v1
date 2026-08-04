import { createRandom } from '@/lib/random';

export interface FieldBounds {
  width: number;
  height: number;
  depth: number;
}

/** World-space influence point, unprojected onto `z = 0` by the caller. */
export interface Pointer {
  x: number;
  y: number;
}

export interface ParticleFieldOptions {
  count: number;
  seed: number;
  bounds: FieldBounds;
  driftAmplitude: number;
  driftFrequency: number;
  repulsionRadius: number;
  repulsionStrength: number;
  springK: number;
  damping: number;
}

/** A stalled tab must not hand the simulation a second of delta in one go (tech.md 5.4). */
const MAX_STEP_SECONDS = 1 / 30;

const REFERENCE_FPS = 60;

/**
 * The particle simulation, with no dependency on Three: it owns four `Float32Array`s and writes
 * `positions` in place, so the render layer can point a buffer attribute at it once and never
 * touch it again. `update` allocates nothing.
 *
 * tech.md 5.2 authors the coefficients per frame at 60fps. The simulation converts them against
 * the real delta, so the field behaves the same on a 144Hz monitor as on a 30fps phone.
 */
export class ParticleField {
  readonly count: number;
  readonly positions: Float32Array;

  private readonly origins: Float32Array;
  private readonly velocities: Float32Array;
  private readonly phases: Float32Array;

  private readonly driftAmplitude: number;
  private readonly driftFrequency: number;
  private readonly repulsionRadius: number;
  private readonly repulsionStrength: number;
  private readonly springK: number;
  private readonly damping: number;

  private elapsed = 0;
  private isDisposed = false;

  constructor(options: ParticleFieldOptions) {
    const { count, bounds } = options;

    this.count = count;
    this.driftAmplitude = options.driftAmplitude;
    this.driftFrequency = options.driftFrequency;
    this.repulsionRadius = options.repulsionRadius;
    this.repulsionStrength = options.repulsionStrength;
    this.springK = options.springK;
    this.damping = options.damping;

    this.origins = new Float32Array(count * 3);
    this.positions = new Float32Array(count * 3);
    this.velocities = new Float32Array(count * 3);
    this.phases = new Float32Array(count * 3);

    const random = createRandom(options.seed);

    for (let i = 0; i < count; i += 1) {
      const offset = i * 3;

      this.origins[offset] = (random() - 0.5) * bounds.width;
      this.origins[offset + 1] = (random() - 0.5) * bounds.height;
      this.origins[offset + 2] = (random() - 0.5) * bounds.depth;

      this.phases[offset] = random() * Math.PI * 2;
      this.phases[offset + 1] = random() * Math.PI * 2;
      this.phases[offset + 2] = random() * Math.PI * 2;
    }

    this.positions.set(this.origins);
  }

  update(dt: number, pointer: Pointer | null): void {
    if (this.isDisposed || dt <= 0) return;

    const seconds = Math.min(dt, MAX_STEP_SECONDS);
    const step = seconds * REFERENCE_FPS;

    this.elapsed += seconds;

    const time = this.elapsed * this.driftFrequency;
    const damping = this.damping ** step;
    const spring = this.springK * step;
    const radius = this.repulsionRadius;
    const radiusSq = radius * radius;
    const drift = this.driftAmplitude;

    for (let i = 0; i < this.count; i += 1) {
      const offset = i * 3;

      const px = this.positions[offset]!;
      const py = this.positions[offset + 1]!;
      const pz = this.positions[offset + 2]!;

      const targetX = this.origins[offset]! + Math.sin(time + this.phases[offset]!) * drift;
      const targetY = this.origins[offset + 1]! + Math.sin(time + this.phases[offset + 1]!) * drift;
      const targetZ = this.origins[offset + 2]! + Math.sin(time + this.phases[offset + 2]!) * drift;

      let vx = this.velocities[offset]! + (targetX - px) * spring;
      let vy = this.velocities[offset + 1]! + (targetY - py) * spring;
      let vz = this.velocities[offset + 2]! + (targetZ - pz) * spring;

      if (pointer !== null) {
        const dx = px - pointer.x;
        const dy = py - pointer.y;
        const distanceSq = dx * dx + dy * dy + pz * pz;

        if (distanceSq < radiusSq && distanceSq > 1e-6) {
          const distance = Math.sqrt(distanceSq);
          const falloff = 1 - distance / radius;
          // Strength is the velocity a point gains from a full second under the pointer, so the
          // push is the same on a 144Hz monitor. Dividing by the distance normalises the outward
          // direction, and the squared falloff keeps the edge of the radius quiet.
          const force = (falloff * falloff * this.repulsionStrength * seconds) / distance;

          vx += dx * force;
          vy += dy * force;
          vz += pz * force;
        }
      }

      vx *= damping;
      vy *= damping;
      vz *= damping;

      this.velocities[offset] = vx;
      this.velocities[offset + 1] = vy;
      this.velocities[offset + 2] = vz;

      this.positions[offset] = px + vx * step;
      this.positions[offset + 1] = py + vy * step;
      this.positions[offset + 2] = pz + vz * step;
    }
  }

  dispose(): void {
    this.isDisposed = true;
  }
}
