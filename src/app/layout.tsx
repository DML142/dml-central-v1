import './globals.css';

import { FooterBar } from '@/components/layout/FooterBar';
import { FrameBox, FrameGrid } from '@/components/layout/FrameGrid';
import { LocaleSync } from '@/components/layout/LocaleSync';
import { SideRail } from '@/components/layout/SideRail';
import { SkipLink } from '@/components/layout/SkipLink';
import { SmoothScrollHost } from '@/components/layout/SmoothScrollHost';
import { TopBar } from '@/components/layout/TopBar';
import { SITE } from '@/content/site';
import { ContactModal } from '@/features/contact/ContactModal';
import { SITE_URL } from '@/lib/public-env';

import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE.title,
  description: SITE.description,
  applicationName: SITE.brand,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: '/',
    siteName: SITE.brand,
    title: SITE.title,
    description: SITE.description,
    locale: 'en_US',
    alternateLocale: ['uk_UA', 'ru_RU'],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE.title,
    description: SITE.description,
  },
};

export const viewport: Viewport = {
  themeColor: '#07060B',
  colorScheme: 'dark',
};

interface Props {
  children: React.ReactNode;
}

// `suppressHydrationWarning` covers this element only, not the tree: browser extensions write
// their own attributes onto `<html>` before React hydrates, and no version of the markup can match
// them. A mismatch anywhere inside the page is still reported.
export default function RootLayout({ children }: Props) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Only the Latin display cut is preloaded: it carries the headline in the default
            locale, and the other nineteen subsets are picked by unicode-range on demand. */}
        <link
          rel="preload"
          href="/fonts/oswald-latin-700-normal.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <LocaleSync />
        <SkipLink />

        <SmoothScrollHost />

        <FrameGrid>
          <TopBar />

          <FrameBox>
            <SideRail />

            <main id="main" className="min-w-0">
              {children}
            </main>
          </FrameBox>

          <FooterBar />
        </FrameGrid>

        <ContactModal />
      </body>
    </html>
  );
}
