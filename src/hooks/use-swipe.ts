'use client';

import { useRef } from 'react';

const MIN_DISTANCE = 40;

interface Handlers {
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
}

/**
 * Horizontal-only pointer swipe. Vertical movement is ignored so a scroll gesture over the stage
 * never changes the slide (tech.md 6.4).
 */
export function useSwipe({ onSwipeLeft, onSwipeRight }: Handlers) {
  const origin = useRef<{ x: number; y: number } | null>(null);

  return {
    onPointerDown: (event: React.PointerEvent) => {
      origin.current = { x: event.clientX, y: event.clientY };
    },
    onPointerUp: (event: React.PointerEvent) => {
      const start = origin.current;
      origin.current = null;
      if (!start) return;

      const dx = event.clientX - start.x;
      const dy = event.clientY - start.y;
      if (Math.abs(dx) < MIN_DISTANCE || Math.abs(dx) <= Math.abs(dy)) return;

      if (dx < 0) onSwipeLeft();
      else onSwipeRight();
    },
    onPointerCancel: () => {
      origin.current = null;
    },
  };
}
