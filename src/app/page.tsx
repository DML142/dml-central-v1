import { FooterBar } from '@/components/layout/FooterBar';
import { FrameBox, FrameGrid } from '@/components/layout/FrameGrid';
import { LocaleSync } from '@/components/layout/LocaleSync';
import { SideRail } from '@/components/layout/SideRail';
import { SkipLink } from '@/components/layout/SkipLink';
import { TopBar } from '@/components/layout/TopBar';
import { About } from '@/features/about/About';
import { ContactBand } from '@/features/contact/ContactBand';
import { ContactModal } from '@/features/contact/ContactModal';
import { Constellation } from '@/features/hero/Constellation';
import { Hero } from '@/features/hero/Hero';
import { ProjectsSection } from '@/features/projects/ProjectsSection';
import { StackSection } from '@/features/stack/StackSection';

export default function Home() {
  return (
    <>
      <LocaleSync />
      <SkipLink />

      <FrameGrid>
        <TopBar />

        <FrameBox>
          <SideRail />

          <main id="main" className="min-w-0">
            <Hero field={<Constellation />} />
            <ProjectsSection />
            <StackSection />
            <About />
            <ContactBand />
          </main>
        </FrameBox>

        <FooterBar />
      </FrameGrid>

      <ContactModal />
    </>
  );
}
