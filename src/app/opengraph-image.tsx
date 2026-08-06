import { ImageResponse } from 'next/og';

import { en } from '@/content/i18n/en';
import { SITE } from '@/content/site';

export const alt = SITE.title;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// Satori has no DOM, so it cannot resolve the `@theme` custom properties (tech.md 4.1) the rest of
// the page draws from — the same constraint the root layout's `themeColor` literal already accepts.
const VOID = '#07060B';
const LINE = '#241C3A';
const TEXT = '#EDEAF7';
const TEXT_MUTED = '#8E86A8';
const VIOLET = '#8A60FF';
const VIOLET_BRIGHT = '#B388FF';

export default function Image() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 64,
        backgroundColor: VOID,
        backgroundImage: `radial-gradient(circle at 78% 28%, ${VIOLET}33 0%, transparent 55%)`,
        border: `1px solid ${LINE}`,
      }}
    >
      <div
        style={{
          display: 'flex',
          fontSize: 22,
          fontWeight: 500,
          letterSpacing: 6,
          textTransform: 'uppercase',
          color: TEXT_MUTED,
        }}
      >
        {SITE.brand}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div
          style={{
            display: 'flex',
            maxWidth: 920,
            fontSize: 84,
            fontWeight: 700,
            lineHeight: 0.96,
            letterSpacing: -2,
            textTransform: 'uppercase',
            color: TEXT,
          }}
        >
          {en['hero.headline']}
        </div>
        <div style={{ display: 'flex', maxWidth: 780, fontSize: 28, color: TEXT_MUTED }}>
          {SITE.description}
        </div>
        <div style={{ display: 'flex', width: 120, height: 4, backgroundColor: VIOLET_BRIGHT }} />
      </div>
    </div>,
    { ...size },
  );
}
