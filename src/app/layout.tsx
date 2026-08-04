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
      <body>{children}</body>
    </html>
  );
}
