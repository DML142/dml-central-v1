import type { SpatialGrid } from '@/lib/three/spatial-grid';

export interface ConnectionFieldOptions {
  maxSegments: number;
  maxDistance: number;
  baseAlpha: number;
  depthDivisor: number;
  /** Half the field depth, which maps a `z` to how far the point reads from the camera. */
  halfDepth: number;
}

/** No cell of the grid can plausibly hold more than this; a longer list is clipped, not grown. */
const NEIGHBOUR_LIMIT = 256;

/**
 * Builds the line segments between neighbouring points into buffers sized once at construction.
 * `segmentCount` drives `setDrawRange`, so a frame with fewer connections costs fewer vertices
 * without touching the geometry (tech.md 5.3).
 *
 * Alpha carries the same two falloffs as the static SVG field: distance between the ends, and how
 * deep in the volume they sit.
 */
export class ConnectionField {
  readonly positions: Float32Array;
  readonly alphas: Float32Array;

  private segments = 0;

  private readonly neighbours = new Int32Array(NEIGHBOUR_LIMIT);
  private readonly maxSegments: number;
  private readonly maxDistance: number;
  private readonly baseAlpha: number;
  private readonly depthDivisor: number;
  private readonly halfDepth: number;

  constructor(options: ConnectionFieldOptions) {
    this.maxSegments = options.maxSegments;
    this.maxDistance = options.maxDistance;
    this.baseAlpha = options.baseAlpha;
    this.depthDivisor = options.depthDivisor;
    this.halfDepth = options.halfDepth;

    this.positions = new Float32Array(options.maxSegments * 6);
    this.alphas = new Float32Array(options.maxSegments * 2);
  }

  get segmentCount(): number {
    return this.segments;
  }

  /** Vertices to draw. `LineSegments` consumes two per segment. */
  get vertexCount(): number {
    return this.segments * 2;
  }

  build(positions: Float32Array, count: number, grid: SpatialGrid): void {
    const maxDistanceSq = this.maxDistance * this.maxDistance;
    let segment = 0;

    for (let i = 0; i < count && segment < this.maxSegments; i += 1) {
      const a = i * 3;
      const ax = positions[a]!;
      const ay = positions[a + 1]!;
      const az = positions[a + 2]!;

      const found = grid.queryNeighbours(i, positions, this.neighbours);

      for (let n = 0; n < found && segment < this.maxSegments; n += 1) {
        const b = this.neighbours[n]! * 3;
        const bx = positions[b]!;
        const by = positions[b + 1]!;
        const bz = positions[b + 2]!;

        const dx = ax - bx;
        const dy = ay - by;
        const dz = az - bz;
        const distanceSq = dx * dx + dy * dy + dz * dz;

        if (distanceSq > maxDistanceSq) continue;

        const distance = Math.sqrt(distanceSq);
        const depth = (this.farness(az) + this.farness(bz)) / this.depthDivisor;
        const alpha = (1 - distance / this.maxDistance) * this.baseAlpha * (1 - depth);

        const vertex = segment * 6;
        this.positions[vertex] = ax;
        this.positions[vertex + 1] = ay;
        this.positions[vertex + 2] = az;
        this.positions[vertex + 3] = bx;
        this.positions[vertex + 4] = by;
        this.positions[vertex + 5] = bz;

        this.alphas[segment * 2] = alpha;
        this.alphas[segment * 2 + 1] = alpha;

        segment += 1;
      }
    }

    this.segments = segment;
  }

  /** `0` at the front of the volume, `1` at the back. */
  private farness(z: number): number {
    const value = (this.halfDepth - z) / (this.halfDepth * 2);
    return value < 0 ? 0 : value > 1 ? 1 : value;
  }
}
