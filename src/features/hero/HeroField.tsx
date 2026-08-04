'use client';

import { useCallback, useRef, useState } from 'react';

import { HeroCanvasHost } from '@/components/three/HeroCanvasHost';
import { useFieldDevice } from '@/hooks/use-field-device';
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';
import { useRenderGate } from '@/hooks/use-render-gate';
import { useWebglSupport } from '@/hooks/use-webgl-support';

interface Props {
  /** The seeded SVG field, rendered on the server: the first paint and the fallback in one. */
  children: React.ReactNode;
}

/**
 * Holds both fields. The SVG is already on screen when the Three chunk starts loading, so the
 * canvas fades in over it once it has painted a frame, and fades back out if the context is ever
 * lost. Reduced motion and a missing WebGL context never mount it at all (tech.md 5.5).
 */
export function HeroField({ children }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  const prefersReducedMotion = usePrefersReducedMotion();
  const isSupported = useWebglSupport();
  const isRunning = useRenderGate(containerRef);
  const device = useFieldDevice();

  const [isPainted, setIsPainted] = useState(false);
  const [hasLostContext, setHasLostContext] = useState(false);

  const handleReady = useCallback(() => {
    setIsPainted(true);
  }, []);

  const handleContextLost = useCallback(() => {
    setHasLostContext(true);
    setIsPainted(false);
  }, []);

  const canRender = isSupported && !prefersReducedMotion && !hasLostContext && device !== null;

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      data-webgl={isPainted ? 'ready' : 'static'}
      className="hero-glow absolute inset-0 -z-10 overflow-hidden"
    >
      {children}

      {canRender && (
        <HeroCanvasHost
          profileName={device.profileName}
          color={device.color}
          isRunning={isRunning}
          onReady={handleReady}
          onContextLost={handleContextLost}
        />
      )}
    </div>
  );
}
