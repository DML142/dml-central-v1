import { About } from '@/features/about/About';
import { ContactBand } from '@/features/contact/ContactBand';
import { Constellation } from '@/features/hero/Constellation';
import { Hero } from '@/features/hero/Hero';
import { HeroField } from '@/features/hero/HeroField';
import { ProjectsSection } from '@/features/projects/ProjectsSection';
import { StackSection } from '@/features/stack/StackSection';

export default function Home() {
  return (
    <>
      <Hero
        field={
          <HeroField>
            <Constellation />
          </HeroField>
        }
      />
      <ProjectsSection />
      <StackSection />
      <About />
      <ContactBand />
    </>
  );
}
