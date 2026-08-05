'use client';

import { useRef } from 'react';

const MIN_DISTANCE = 40;

interface Handlers {
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
}

interface Point {
  x: number;
  y: number;
}

/**
 * Horizontal swipe. Vertical movement is ignored so a scroll gesture over the stage never changes
 * the slide (tech.md 6.4).
 *
 * Touch is handled through touch events rather than pointer events. Inside a Radix dialog the
 * scroll lock calls `preventDefault` on `touchmove`, and iOS answers that by cancelling the whole
 * pointer sequence: `pointercancel` arrives instead of `pointerup`, so a pointer-only hook sees
 * every swipe as an abandoned gesture. A tap still completes, which is why the arrows worked while
 * the swipe did not. `touchend` always arrives, prevented or not.
 */
export function useSwipe({ onSwipeLeft, onSwipeRight }: Handlers) {
  const origin = useRef<Point | null>(null);

  const settle = (end: Point) => {
    const start = origin.current;
    origin.current = null;
    if (!start) return;

    const dx = end.x - start.x;
    const dy = end.y - start.y;
    if (Math.abs(dx) < MIN_DISTANCE || Math.abs(dx) <= Math.abs(dy)) return;

    if (dx < 0) onSwipeLeft();
    else onSwipeRight();
  };

  return {
    onTouchStart: (event: React.TouchEvent) => {
      const touch = event.changedTouches[0];
      origin.current = touch ? { x: touch.clientX, y: touch.clientY } : null;
    },
    onTouchEnd: (event: React.TouchEvent) => {
      const touch = event.changedTouches[0];
      if (touch) settle({ x: touch.clientX, y: touch.clientY });
      else origin.current = null;
    },
    onTouchCancel: () => {
      origin.current = null;
    },
    // Mouse and pen only: a touch pointer is already served by the handlers above, and taking it
    // twice would step two slides on one swipe.
    onPointerDown: (event: React.PointerEvent) => {
      if (event.pointerType === 'touch') return;
      origin.current = { x: event.clientX, y: event.clientY };
    },
    onPointerUp: (event: React.PointerEvent) => {
      if (event.pointerType === 'touch') return;
      settle({ x: event.clientX, y: event.clientY });
    },
    onPointerCancel: () => {
      origin.current = null;
    },
  };
}
