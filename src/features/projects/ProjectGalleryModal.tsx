'use client';

import { useEffect, useState } from 'react';

import { Eyebrow } from '@/components/common/Eyebrow';
import { Dialog, DialogClose, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { findProject } from '@/content/projects';
import { GalleryStage } from '@/features/projects/GalleryStage';
import { GalleryThumbs } from '@/features/projects/GalleryThumbs';
import { useSwipe } from '@/hooks/use-swipe';
import { useTranslate } from '@/hooks/use-translate';
import { useProjectsStore } from '@/stores/projects-store';

const pad = (value: number) => String(value).padStart(2, '0');

export function ProjectGalleryModal() {
  const t = useTranslate();
  const openProjectId = useProjectsStore((state) => state.openProjectId);
  const activeSlide = useProjectsStore((state) => state.activeSlide);
  const closeProject = useProjectsStore((state) => state.closeProject);
  const setSlide = useProjectsStore((state) => state.setSlide);
  const stepSlide = useProjectsStore((state) => state.stepSlide);

  const openProject = openProjectId ? findProject(openProjectId) : undefined;

  // The dialog stays mounted through its exit state, so Radix can run the fade and hand focus back
  // to the trigger (tech.md 9.3). Unmounting on close skipped both.
  const [shownProject, setShownProject] = useState(openProject);
  if (openProject && openProject !== shownProject) setShownProject(openProject);

  const project = openProject ?? shownProject;
  const total = project?.gallery.length ?? 0;

  const step = (delta: number) => {
    stepSlide(delta, total);
  };

  const swipe = useSwipe({
    onSwipeLeft: () => {
      step(1);
    },
    onSwipeRight: () => {
      step(-1);
    },
  });

  useEffect(() => {
    if (!openProject) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') stepSlide(-1, total);
      else if (event.key === 'ArrowRight') stepSlide(1, total);
      else if (event.key === 'Home') setSlide(0);
      else if (event.key === 'End') setSlide(total - 1);
      else return;

      event.preventDefault();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [openProject, setSlide, stepSlide, total]);

  if (!project) return null;

  return (
    <Dialog
      open={Boolean(openProject)}
      onOpenChange={(next) => {
        if (!next) closeProject();
      }}
    >
      <DialogContent
        aria-describedby={undefined}
        onCloseAutoFocus={(event) => {
          // The card that opened the gallery has already taken focus back.
          event.preventDefault();
        }}
      >
        <div className="border-line section-gutter flex items-center justify-between gap-4 border-b py-4">
          <div>
            <Eyebrow>
              {pad(activeSlide + 1)} / {pad(total)}
            </Eyebrow>
            <DialogTitle>{t('gallery.title', { project: project.title })}</DialogTitle>
          </div>

          <DialogClose
            aria-label={t('gallery.close')}
            className="border-line text-text-muted hover:border-line-strong hover:text-text flex size-11 cursor-pointer items-center justify-center border transition-colors duration-(--dur-fast)"
          >
            <span aria-hidden="true">✕</span>
          </DialogClose>
        </div>

        <div
          {...swipe}
          className="relative flex min-h-0 flex-1 touch-pan-y items-center justify-center overflow-hidden"
        >
          <GalleryStage images={project.gallery} activeSlide={activeSlide} />

          <button
            type="button"
            aria-label={t('gallery.prev')}
            onClick={() => {
              step(-1);
            }}
            className="gallery-arrow left-(--gutter)"
          >
            <span aria-hidden="true">←</span>
          </button>
          <button
            type="button"
            aria-label={t('gallery.next')}
            onClick={() => {
              step(1);
            }}
            className="gallery-arrow right-(--gutter)"
          >
            <span aria-hidden="true">→</span>
          </button>
        </div>

        <GalleryThumbs images={project.gallery} activeSlide={activeSlide} onSelect={setSlide} />

        <span role="status" aria-live="polite" className="sr-only">
          {t('gallery.announce', { n: activeSlide + 1 })}
        </span>
      </DialogContent>
    </Dialog>
  );
}
