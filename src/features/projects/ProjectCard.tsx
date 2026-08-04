'use client';

import { useEffect, useRef } from 'react';

import { Chip } from '@/components/common/Chip';
import { CtaButton } from '@/components/common/CtaButton';
import { Eyebrow } from '@/components/common/Eyebrow';
import { IndexLabel } from '@/components/common/IndexLabel';
import { InlineLink } from '@/components/common/InlineLink';
import { useTranslate } from '@/hooks/use-translate';
import { cn } from '@/lib/utils';
import { useProjectsStore } from '@/stores/projects-store';
import type { Project } from '@/types/project';

interface Props {
  project: Project;
}

export function ProjectCard({ project }: Props) {
  const t = useTranslate();
  const openProject = useProjectsStore((state) => state.openProject);
  const openProjectId = useProjectsStore((state) => state.openProjectId);
  const isSecondary = project.emphasis === 'secondary';

  // Focus goes back the moment the store closes, not when the fade ends — the keyboard never
  // waits on an animation (tech.md 9.3).
  const galleryButton = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);

  useEffect(() => {
    const isOpen = openProjectId === project.id;
    if (wasOpen.current && !isOpen) galleryButton.current?.focus();
    wasOpen.current = isOpen;
  }, [openProjectId, project.id]);

  return (
    <article
      data-project={project.id}
      className={cn(
        'border-line section-gutter hover:border-line-strong group flex flex-col gap-4 border-b py-8 transition-colors duration-(--dur-base) lg:border-b-0 lg:border-l lg:first:border-l-0',
        isSecondary && 'text-text-muted',
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <IndexLabel className="group-hover:text-violet">{project.index}</IndexLabel>
        {project.status === 'deprecated' ? (
          <span className="micro text-danger border border-current px-3 py-1 opacity-60">
            {t(project.statusKey)}
          </span>
        ) : (
          <Eyebrow tone="accent">{t(project.statusKey)}</Eyebrow>
        )}
      </div>

      <div>
        <h3 className={cn('display text-display-lg mt-3', isSecondary && 'text-text-muted')}>
          {project.title}
        </h3>
        <p className={cn('micro mt-2', isSecondary ? 'text-text-faint' : 'text-violet-bright')}>
          {t(project.taglineKey)}
        </p>
      </div>

      <p className="text-text-muted max-w-summary">{t(project.summaryKey)}</p>

      {project.highlightKeys.length > 0 && (
        <ul className="flex list-none flex-col gap-2 p-0">
          {project.highlightKeys.map((key) => (
            <li key={key} className="mono-copy text-text-muted rule-bullet relative pl-6">
              {t(key)}
            </li>
          ))}
        </ul>
      )}

      {project.noteKey && <p className="mono-copy text-text-faint">{t(project.noteKey)}</p>}

      <div className="flex flex-wrap gap-2">
        {project.tech.map((label) => (
          <Chip key={label}>{label}</Chip>
        ))}
      </div>

      <div className="mt-auto flex flex-wrap items-center gap-x-6 gap-y-3 pt-3">
        <CtaButton
          ref={galleryButton}
          variant="ghost"
          onClick={() => {
            openProject(project.id);
          }}
        >
          {t('action.gallery')}
        </CtaButton>

        {project.links.map((link) => (
          <InlineLink key={link.kind} href={link.href}>
            {t(link.labelKey)}
          </InlineLink>
        ))}
      </div>
    </article>
  );
}
