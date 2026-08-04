'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import { Color, type BufferAttribute, type BufferGeometry } from 'three';

import {
  FIELD,
  FIELD_LOOK,
  FIELD_SEED,
  FRAME_BUDGET,
  resolveFieldBounds,
  type ParticleProfile,
} from '@/config/particles';
import { ConnectionField } from '@/lib/three/connection-field';
import { ParticleField, type Pointer } from '@/lib/three/particle-field';
import { LINES_FRAGMENT, LINES_VERTEX } from '@/lib/three/shaders/lines';
import { POINTS_FRAGMENT, POINTS_VERTEX } from '@/lib/three/shaders/points';
import { SpatialGrid } from '@/lib/three/spatial-grid';

interface Props {
  profile: ParticleProfile;
  color: string;
  onReady: () => void;
  onContextLost: () => void;
  onBudgetMissed: () => void;
}

export function ParticleNetwork({ profile, color, onReady, onContextLost, onBudgetMissed }: Props) {
  const gl = useThree((state) => state.gl);
  const size = useThree((state) => state.size);
  const viewport = useThree((state) => state.viewport);

  // Rounded, so a one-pixel resize does not rebuild the field, and a rotation does.
  const aspect = Math.round((size.width / size.height) * 10) / 10;

  const simulation = useMemo(() => {
    const bounds = resolveFieldBounds(aspect);

    return {
      bounds,
      field: new ParticleField({
        count: profile.count,
        seed: FIELD_SEED,
        bounds,
        driftAmplitude: profile.driftAmplitude,
        driftFrequency: FIELD.driftFrequency,
        repulsionRadius: profile.repulsionRadius,
        repulsionStrength: profile.repulsionStrength,
        springK: profile.springK,
        damping: profile.damping,
      }),
      grid: new SpatialGrid({
        bounds,
        cellSize: profile.maxConnectionDistance,
        capacity: profile.count,
      }),
      connections: new ConnectionField({
        maxSegments: profile.maxSegments,
        maxDistance: profile.maxConnectionDistance,
        baseAlpha: FIELD_LOOK.connectionAlpha,
        depthDivisor: FIELD_LOOK.connectionDepthDivisor,
        halfDepth: bounds.depth / 2,
      }),
    };
  }, [aspect, profile]);

  const pointsAttribute = useRef<BufferAttribute>(null);
  const linePositions = useRef<BufferAttribute>(null);
  const lineAlphas = useRef<BufferAttribute>(null);
  const lineGeometry = useRef<BufferGeometry>(null);

  const pointer = useRef<Pointer>({ x: 0, y: 0 });
  const isPointerInside = useRef(false);
  const hasPainted = useRef(false);
  const frames = useRef(0);
  const slowFrames = useRef(0);

  const pointsUniforms = useMemo(
    () => ({
      uColor: { value: new Color(color) },
      uHalfDepth: { value: simulation.bounds.depth / 2 },
      uSizeNear: { value: FIELD_LOOK.pointSizeNear },
      uSizeFar: { value: FIELD_LOOK.pointSizeFar },
      uAlphaNear: { value: FIELD_LOOK.pointAlphaNear },
      uAlphaFar: { value: FIELD_LOOK.pointAlphaFar },
      uSoftNear: { value: FIELD_LOOK.edgeSoftnessNear },
      uSoftFar: { value: FIELD_LOOK.edgeSoftnessFar },
      uPixelRatio: { value: viewport.dpr },
    }),
    [color, simulation, viewport.dpr],
  );

  const lineUniforms = useMemo(() => ({ uColor: { value: new Color(color) } }), [color]);

  useEffect(() => {
    const field = simulation.field;
    return () => {
      field.dispose();
    };
  }, [simulation]);

  useEffect(() => {
    const canvas = gl.domElement;

    const handleMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;

      isPointerInside.current = x >= 0 && x <= 1 && y >= 0 && y <= 1;
      if (!isPointerInside.current) return;

      pointer.current.x = (x - 0.5) * viewport.width;
      pointer.current.y = -(y - 0.5) * viewport.height;
    };

    const handleLeave = () => {
      isPointerInside.current = false;
    };

    window.addEventListener('pointermove', handleMove, { passive: true });
    window.addEventListener('pointercancel', handleLeave);
    document.addEventListener('pointerleave', handleLeave);

    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointercancel', handleLeave);
      document.removeEventListener('pointerleave', handleLeave);
    };
  }, [gl, viewport.width, viewport.height]);

  useEffect(() => {
    const canvas = gl.domElement;
    canvas.addEventListener('webglcontextlost', onContextLost);

    return () => {
      canvas.removeEventListener('webglcontextlost', onContextLost);
    };
  }, [gl, onContextLost]);

  useFrame((_, delta) => {
    const { field, grid, connections } = simulation;

    field.update(delta, isPointerInside.current ? pointer.current : null);
    grid.rebuild(field.positions, field.count);
    connections.build(field.positions, field.count, grid);

    if (pointsAttribute.current) pointsAttribute.current.needsUpdate = true;
    if (linePositions.current) linePositions.current.needsUpdate = true;
    if (lineAlphas.current) lineAlphas.current.needsUpdate = true;
    lineGeometry.current?.setDrawRange(0, connections.vertexCount);

    if (!hasPainted.current) {
      hasPainted.current = true;
      onReady();
    }

    // A device without a real GPU pays for the whole simulation and gets a slideshow. Give it a
    // few frames to warm up, then hand the hero back to the static field (tech.md 12).
    frames.current += 1;
    if (frames.current <= FRAME_BUDGET.warmUpFrames) return;

    slowFrames.current = delta * 1000 > FRAME_BUDGET.slowFrameMs ? slowFrames.current + 1 : 0;
    if (slowFrames.current >= FRAME_BUDGET.slowFrameLimit) onBudgetMissed();
  });

  const key = `${profile.count}-${aspect}`;

  return (
    <>
      <lineSegments key={`lines-${key}`} renderOrder={0} frustumCulled={false}>
        <bufferGeometry ref={lineGeometry}>
          <bufferAttribute
            ref={linePositions}
            attach="attributes-position"
            args={[simulation.connections.positions, 3]}
          />
          <bufferAttribute
            ref={lineAlphas}
            attach="attributes-alpha"
            args={[simulation.connections.alphas, 1]}
          />
        </bufferGeometry>
        <shaderMaterial
          vertexShader={LINES_VERTEX}
          fragmentShader={LINES_FRAGMENT}
          uniforms={lineUniforms}
          transparent
          depthTest={false}
          depthWrite={false}
        />
      </lineSegments>

      <points key={`points-${key}`} renderOrder={1} frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute
            ref={pointsAttribute}
            attach="attributes-position"
            args={[simulation.field.positions, 3]}
          />
        </bufferGeometry>
        <shaderMaterial
          vertexShader={POINTS_VERTEX}
          fragmentShader={POINTS_FRAGMENT}
          uniforms={pointsUniforms}
          transparent
          depthTest={false}
          depthWrite={false}
        />
      </points>
    </>
  );
}
