import { BREAKPOINTS } from '@/config/breakpoints';

/** The camera that frames the field, and how far the field runs past what it frames (tech.md 5.2). */
export const FIELD = {
  depth: 12,
  cameraZ: 14,
  fov: 45,
  /** The field overruns the frustum by this much, so the constellation bleeds past every edge. */
  bleed: 1.2,
  /** Base radians per second of the sine drift. */
  driftFrequency: 0.35,
  /** Per-point spread around that rate, so the field does not breathe in step (fraction of it). */
  driftRateJitter: 0.6,
  /** How far past the volume the pointer may push a point before it is held at the wall. */
  boundsSlack: 0.08,
} as const;

/**
 * The volume is derived from the viewport rather than fixed, so a portrait phone gets a narrow
 * field it can see all of instead of a wide one it sees a slice of — the same framing the static
 * SVG gets from `preserveAspectRatio: slice`. At 16:9 this returns the 24 × 14 of tech.md 5.2.
 */
export function resolveFieldBounds(aspect: number): {
  width: number;
  height: number;
  depth: number;
} {
  const visibleHeight = 2 * FIELD.cameraZ * Math.tan((FIELD.fov * Math.PI) / 360);
  const height = visibleHeight * FIELD.bleed;

  return { width: height * aspect, height, depth: FIELD.depth };
}

/**
 * A fresh layout on every page load. The static SVG stays seeded — it is server-rendered and has
 * to match the markup — but the WebGL field has no such constraint, and a constellation that is
 * pixel-identical on every visit reads as wallpaper.
 */
export function randomFieldSeed(): number {
  return Math.floor(Math.random() * 0xffffffff);
}

/**
 * Depth-driven look, carried over from the static SVG so the WebGL field is the same drawing.
 * Far points are larger, softer and dimmer — distance reads as a blur, not as perspective
 * (tech.md 5.1). Sizes are device pixels; the point diameters match the SVG radii doubled.
 */
export const FIELD_LOOK = {
  pointSizeNear: 2.2,
  pointSizeFar: 7.2,
  pointAlphaNear: 0.9,
  pointAlphaFar: 0.28,
  edgeSoftnessNear: 0.06,
  edgeSoftnessFar: 0.34,
  connectionAlpha: 0.34,
  /** Divisor on the summed depth of a segment's ends: at both ends far, a line keeps 23% of alpha. */
  connectionDepthDivisor: 2.6,
} as const;

/**
 * When the field cannot hold a frame budget it is not worth having: a device without a real GPU
 * pays for the whole simulation and gets a slideshow. Sustained frames slower than this for this
 * many in a row hand the hero back to the static SVG (tech.md 12).
 */
export const FRAME_BUDGET = {
  slowFrameMs: 40,
  slowFrameLimit: 90,
  warmUpFrames: 30,
} as const;

export interface ParticleProfile {
  count: number;
  maxConnectionDistance: number;
  maxSegments: number;
  repulsionRadius: number;
  repulsionStrength: number;
  springK: number;
  damping: number;
  driftAmplitude: number;
  dpr: [number, number];
}

export const PARTICLE_PROFILES = {
  desktop: {
    count: 260,
    maxConnectionDistance: 3.2,
    maxSegments: 1600,
    repulsionRadius: 3.2,
    repulsionStrength: 0.85,
    springK: 0.015,
    damping: 0.92,
    driftAmplitude: 0.5,
    dpr: [1, 1.75],
  },
  tablet: {
    count: 180,
    maxConnectionDistance: 3.0,
    maxSegments: 1100,
    repulsionRadius: 3.2,
    repulsionStrength: 0.85,
    springK: 0.015,
    damping: 0.92,
    driftAmplitude: 0.5,
    dpr: [1, 1.5],
  },
  mobile: {
    count: 110,
    maxConnectionDistance: 2.6,
    maxSegments: 600,
    repulsionRadius: 2.6,
    repulsionStrength: 0.7,
    springK: 0.02,
    damping: 0.9,
    driftAmplitude: 0.4,
    dpr: [1, 1.5],
  },
} satisfies Record<string, ParticleProfile>;

export type ProfileName = keyof typeof PARTICLE_PROFILES;

interface DeviceHints {
  width: number;
  /** `navigator.hardwareConcurrency`, which Safari only started reporting in 15.4. */
  cores?: number | undefined;
}

/**
 * A narrow viewport or four cores or fewer takes the mobile budget, whichever comes first
 * (tech.md 5.5). An unreported core count is not treated as a weak device.
 */
export function resolveProfileName({ width, cores }: DeviceHints): ProfileName {
  if (width < BREAKPOINTS.md) return 'mobile';
  if (cores !== undefined && cores <= 4) return 'mobile';
  if (width < BREAKPOINTS.xl) return 'tablet';
  return 'desktop';
}
