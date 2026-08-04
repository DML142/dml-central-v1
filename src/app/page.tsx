import { FooterBar } from '@/components/layout/FooterBar';
import { FrameBox, FrameGrid } from '@/components/layout/FrameGrid';
import { LocaleSync } from '@/components/layout/LocaleSync';
import { SideRail } from '@/components/layout/SideRail';
import { SkipLink } from '@/components/layout/SkipLink';
import { TopBar } from '@/components/layout/TopBar';
import { About } from '@/features/about/About';
import { ContactBand } from '@/features/contact/ContactBand';
import { Constellation } from '@/features/hero/Constellation';
import { Hero } from '@/features/hero/Hero';

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
            <About />
            <ContactBand />
          </main>
        </FrameBox>

        <FooterBar />
      </FrameGrid>
    </>
  );
}
