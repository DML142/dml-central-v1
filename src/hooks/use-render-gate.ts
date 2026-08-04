'use client';

import { useEffect, useState, type RefObject } from 'react';

import { useProjectsStore } from '@/stores/projects-store';
import { useUiStore } from '@/stores/ui-store';

/**
 * Whether the field is worth simulating: on screen, in a visible tab, and not sitting behind a
 * modal that owns the page (tech.md 5.4). Everything else is a frame nobody sees.
 */
export function useRenderGate(ref: RefObject<HTMLElement | null>): boolean {
  const [isOnScreen, setIsOnScreen] = useState(false);
  const [isTabVisible, setIsTabVisible] = useState(true);

  const isContactOpen = useUiStore((state) => state.isContactOpen);
  const openProjectId = useProjectsStore((state) => state.openProjectId);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsOnScreen(entry?.isIntersecting ?? false);
      },
      { rootMargin: '10%' },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [ref]);

  useEffect(() => {
    const handleVisibility = () => {
      setIsTabVisible(document.visibilityState === 'visible');
    };

    handleVisibility();
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  return isOnScreen && isTabVisible && !isContactOpen && openProjectId === null;
}
