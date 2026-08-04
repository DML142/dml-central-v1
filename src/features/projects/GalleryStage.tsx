'use client';

import Image from 'next/image';

import { useTranslate } from '@/hooks/use-translate';
import { cn } from '@/lib/utils';
import type { ProjectImage } from '@/types/project';

interface Props {
  images: ProjectImage[];
  activeSlide: number;
}

/**
 * Every slide fills the stage and is sized by the container, never by its own intrinsic pixels.
 * That is the rule from tech.md 6.4: a slide must never render at natural size for a frame and
 * then shrink into place. Slides are stacked and cross-faded, so switching one reflows nothing.
 */
export function GalleryStage({ images, activeSlide }: Props) {
  const t = useTranslate();

  return (
    <>
      {images.map((image, index) => {
        const isActive = index === activeSlide;
        // Only the active slide and its two neighbours are fetched (tech.md 6.2.1).
        const isAdjacent = Math.abs(index - activeSlide) <= 1;

        return (
          <Image
            key={image.src}
            src={image.src}
            alt={t(image.altKey)}
            fill
            sizes="100vw"
            priority={isAdjacent}
            loading={isAdjacent ? 'eager' : 'lazy'}
            aria-hidden={!isActive}
            className={cn(
              'pointer-events-none object-contain p-(--gutter) transition-opacity duration-(--dur-base)',
              isActive ? 'opacity-100' : 'opacity-0',
            )}
          />
        );
      })}
    </>
  );
}
