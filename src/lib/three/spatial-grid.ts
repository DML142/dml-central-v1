import type { FieldBounds } from '@/lib/three/particle-field';

export interface SpatialGridOptions {
  bounds: FieldBounds;
  /** Cell edge; set to the maximum connection distance so 27 cells cover every candidate. */
  cellSize: number;
  capacity: number;
}

/**
 * A uniform grid over the field volume, rebuilt every frame by counting sort into pre-allocated
 * `Int32Array`s. It turns the connection search from O(n²) into a walk of the 27 cells around each
 * point (tech.md 5.3). Points that drift outside the volume are clamped into the edge cells, so
 * repulsion can never push one out of the index.
 */
export class SpatialGrid {
  private readonly cellSize: number;
  private readonly divisionsX: number;
  private readonly divisionsY: number;
  private readonly divisionsZ: number;
  private readonly halfWidth: number;
  private readonly halfHeight: number;
  private readonly halfDepth: number;

  /** Prefix-summed start index per cell, one extra slot so cell `c` spans `[start[c], start[c+1])`. */
  private readonly cellStart: Int32Array;
  private readonly cellCursor: Int32Array;
  private readonly cellOf: Int32Array;
  private readonly items: Int32Array;

  private count = 0;

  constructor({ bounds, cellSize, capacity }: SpatialGridOptions) {
    this.cellSize = cellSize;
    this.divisionsX = Math.max(1, Math.ceil(bounds.width / cellSize));
    this.divisionsY = Math.max(1, Math.ceil(bounds.height / cellSize));
    this.divisionsZ = Math.max(1, Math.ceil(bounds.depth / cellSize));
    this.halfWidth = bounds.width / 2;
    this.halfHeight = bounds.height / 2;
    this.halfDepth = bounds.depth / 2;

    const cells = this.divisionsX * this.divisionsY * this.divisionsZ;

    this.cellStart = new Int32Array(cells + 1);
    this.cellCursor = new Int32Array(cells);
    this.cellOf = new Int32Array(capacity);
    this.items = new Int32Array(capacity);
  }

  rebuild(positions: Float32Array, count: number): void {
    this.count = count;
    this.cellStart.fill(0);

    for (let i = 0; i < count; i += 1) {
      const offset = i * 3;
      const cell = this.cellIndex(
        this.axisIndex(positions[offset]!, this.halfWidth, this.divisionsX),
        this.axisIndex(positions[offset + 1]!, this.halfHeight, this.divisionsY),
        this.axisIndex(positions[offset + 2]!, this.halfDepth, this.divisionsZ),
      );

      this.cellOf[i] = cell;
      this.cellStart[cell + 1]! += 1;
    }

    for (let cell = 0; cell < this.cellCursor.length; cell += 1) {
      this.cellStart[cell + 1]! += this.cellStart[cell]!;
      this.cellCursor[cell] = this.cellStart[cell]!;
    }

    for (let i = 0; i < count; i += 1) {
      const cell = this.cellOf[i]!;
      this.items[this.cellCursor[cell]!] = i;
      this.cellCursor[cell]! += 1;
    }
  }

  /**
   * Fills `out` with the indices in the 27 cells around `index` and returns how many were written.
   * Only indices above `index` are reported, so a caller visiting every point sees each pair once.
   */
  queryNeighbours(index: number, positions: Float32Array, out: Int32Array): number {
    const offset = index * 3;
    const cx = this.axisIndex(positions[offset]!, this.halfWidth, this.divisionsX);
    const cy = this.axisIndex(positions[offset + 1]!, this.halfHeight, this.divisionsY);
    const cz = this.axisIndex(positions[offset + 2]!, this.halfDepth, this.divisionsZ);

    let written = 0;

    for (let x = Math.max(0, cx - 1); x <= Math.min(this.divisionsX - 1, cx + 1); x += 1) {
      for (let y = Math.max(0, cy - 1); y <= Math.min(this.divisionsY - 1, cy + 1); y += 1) {
        for (let z = Math.max(0, cz - 1); z <= Math.min(this.divisionsZ - 1, cz + 1); z += 1) {
          const cell = this.cellIndex(x, y, z);
          const end = this.cellStart[cell + 1]!;

          for (let slot = this.cellStart[cell]!; slot < end; slot += 1) {
            const candidate = this.items[slot]!;

            if (candidate <= index) continue;
            if (written === out.length) return written;

            out[written] = candidate;
            written += 1;
          }
        }
      }
    }

    return written;
  }

  get size(): number {
    return this.count;
  }

  private axisIndex(value: number, half: number, divisions: number): number {
    const cell = Math.floor((value + half) / this.cellSize);
    return cell < 0 ? 0 : cell > divisions - 1 ? divisions - 1 : cell;
  }

  private cellIndex(x: number, y: number, z: number): number {
    return (z * this.divisionsY + y) * this.divisionsX + x;
  }
}
