'use client';

import { SectionShell } from '@/components/layout/SectionShell';
import { PROJECTS } from '@/content/projects';
import { ProjectCard } from '@/features/projects/ProjectCard';
import { ProjectGalleryModal } from '@/features/projects/ProjectGalleryModal';
import { useTranslate } from '@/hooks/use-translate';

export function ProjectsSection() {
  const t = useTranslate();

  return (
    <SectionShell id="projects" title={t('projects.title')} count="02">
      <div className="grid grid-cols-1 lg:grid-cols-2">
        {PROJECTS.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>

      <ProjectGalleryModal />
    </SectionShell>
  );
}
