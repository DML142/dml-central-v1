import { About } from '@/features/about/About';
import { ContactBand } from '@/features/contact/ContactBand';
import { Constellation } from '@/features/hero/Constellation';
import { Hero } from '@/features/hero/Hero';
import { ProjectsSection } from '@/features/projects/ProjectsSection';
import { StackSection } from '@/features/stack/StackSection';

export default function Home() {
  return (
    <>
      <Hero field={<Constellation />} />
      <ProjectsSection />
      <StackSection />
      <About />
      <ContactBand />
    </>
  );
}
