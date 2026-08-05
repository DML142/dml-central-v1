'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';

import { useTranslate } from '@/hooks/use-translate';
import { cn } from '@/lib/utils';
import type { ProjectImage } from '@/types/project';

interface Props {
  images: ProjectImage[];
  activeSlide: number;
  onSelect: (index: number) => void;
}

export function GalleryThumbs({ images, activeSlide, onSelect }: Props) {
  const t = useTranslate();
  const activeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
  }, [activeSlide]);

  return (
    <div
      role="group"
      aria-label={t('gallery.thumbs')}
      className="border-line section-gutter thumb-strip flex gap-2 overflow-x-auto border-t py-3"
    >
      {images.map((image, index) => {
        const isActive = index === activeSlide;

        return (
          <button
            key={image.src}
            ref={isActive ? activeRef : null}
            type="button"
            aria-current={isActive}
            aria-label={t('gallery.thumb', { n: index + 1 })}
            onClick={() => {
              onSelect(index);
            }}
            className={cn(
              'border-line bg-void w-24 shrink-0 cursor-pointer border p-0 transition duration-(--dur-fast)',
              isActive && 'border-violet scale-105',
            )}
          >
            {/* `contain`, not `cover`: the shots run from 0.38 to 2.39 aspect, and cropping a
                portrait capture to a landscape thumb leaves an unreadable strip. */}
            <Image
              src={image.src}
              alt=""
              width={image.width}
              height={image.height}
              loading="lazy"
              sizes="96px"
              className={cn(
                'aspect-video size-full object-contain transition-opacity duration-(--dur-fast)',
                isActive ? 'opacity-100' : 'opacity-50 hover:opacity-100',
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
