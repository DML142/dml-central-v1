import './globals.css';

import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'DML — Full-stack engineer',
  description: 'Next.js, NestJS and Docker fullstack developer. Creative sites that actually work.',
};

export const viewport: Viewport = {
  themeColor: '#07060B',
};

interface Props {
  children: React.ReactNode;
}

export default function RootLayout({ children }: Props) {
  return (
    <html lang="en">
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
      <body>{children}</body>
    </html>
  );
}
