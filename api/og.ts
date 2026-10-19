// Edge Runtime: no Node.js APIs, no native binaries.
// @vercel/og handles SVG→PNG via WebAssembly — works everywhere.
import { ImageResponse } from '@vercel/og';
import { createElement as h } from 'react';

export const config = { runtime: 'edge' };

// Fonts cached between warm invocations on the same isolate.
let fontRegular: ArrayBuffer | undefined;
let fontBold: ArrayBuffer | undefined;

async function getFonts(origin: string) {
  if (!fontRegular || !fontBold) {
    [fontRegular, fontBold] = await Promise.all([
      fetch(`${origin}/fonts/inter-400.ttf`).then((r) => r.arrayBuffer()),
      fetch(`${origin}/fonts/inter-700.ttf`).then((r) => r.arrayBuffer()),
    ]);
  }
  return [fontRegular, fontBold] as [ArrayBuffer, ArrayBuffer];
}

export default async function handler(request: Request) {
  const { searchParams, origin } = new URL(request.url);

  const title       = searchParams.get('title')       || 'Portfolio';
  const description = searchParams.get('description') || 'Developer Portfolio';
  const type        = searchParams.get('type')        || 'website';
  const authorName  = searchParams.get('name')        || 'Developer';
  const authorRole  = searchParams.get('role')        || 'Full-Stack Developer';
  const siteHost    = searchParams.get('site')        || 'example.com';
  const accent      = searchParams.get('accent')      || '#6366f1';

  const typeLabel =
    type === 'article' ? '✍  Blog Post' :
    type === 'project' ? '⚡  Project'   : null;

  const titleFontSize = title.length > 40 ? 44 : 56;
  const displayTitle = title.length > 50 ? title.substring(0, 50) + '…' : title;
  const displayDesc  = description.length > 80 ? description.substring(0, 80) + '…' : description;

  // Fetch logo for avatar
  let logoDataUrl = '';
  try {
    const logoRes = await fetch(`${origin}/logo.jpg`);
    if (logoRes.ok) {
      const buf = await logoRes.arrayBuffer();
      logoDataUrl = `data:image/jpeg;base64,${btoa(String.fromCharCode(...new Uint8Array(buf)))}`;
    }
  } catch { /* no logo */ }

  const [fontRegularData, fontBoldData] = await getFonts(origin);

  return new ImageResponse(
    h('div', {
      style: {
        width: '1200px',
        height: '630px',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 100%)',
        padding: '72px',
        fontFamily: 'Inter',
        position: 'relative',
        overflow: 'hidden',
      },
    },

      // Decorative bg circles
      h('div', { style: { position: 'absolute', right: '-60px', top: '-60px', width: '440px', height: '440px', borderRadius: '50%', background: accent, opacity: 0.07 } }),
      h('div', { style: { position: 'absolute', left: '-30px', bottom: '-30px', width: '360px', height: '360px', borderRadius: '50%', background: accent, opacity: 0.06 } }),

      // Type badge
      typeLabel && h('div', {
        style: {
          display: 'flex',
          alignSelf: 'flex-start',
          background: accent + '33',
          border: `1px solid ${accent}55`,
          borderRadius: '18px',
          padding: '6px 20px',
          marginBottom: '24px',
          color: accent,
          fontSize: '16px',
          fontWeight: 500,
        },
      }, typeLabel),

      // Title
      h('div', {
        style: {
          color: '#ffffff',
          fontSize: `${titleFontSize}px`,
          fontWeight: 700,
          lineHeight: 1.15,
          letterSpacing: '-1px',
          marginBottom: '16px',
          maxWidth: '680px',
        },
      }, displayTitle),

      // Description
      h('div', {
        style: {
          color: '#94a3b8',
          fontSize: '22px',
          lineHeight: 1.5,
          marginBottom: '28px',
          maxWidth: '680px',
        },
      }, displayDesc),

      // Accent divider line
      h('div', { style: { width: '60px', height: '3px', background: accent, borderRadius: '2px', marginBottom: '32px' } }),

      // Author row
      h('div', { style: { display: 'flex', alignItems: 'center', gap: '12px' } },
        logoDataUrl
          ? h('img', { src: logoDataUrl, width: 48, height: 48, style: { borderRadius: '50%', objectFit: 'cover' } })
          : h('div', { style: { width: '48px', height: '48px', borderRadius: '50%', background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '20px', fontWeight: 700 } }, authorName[0] || 'A'),
        h('div', { style: { display: 'flex', flexDirection: 'column' } },
          h('div', { style: { color: '#e2e8f0', fontSize: '16px', fontWeight: 600 } }, authorName),
          h('div', { style: { color: '#64748b', fontSize: '14px' } }, authorRole),
        ),
      ),

      // Code window (right)
      h('div', {
        style: {
          position: 'absolute',
          right: '72px',
          top: '140px',
          width: '370px',
          height: '330px',
          background: 'rgba(255,255,255,0.027)',
          border: '1px solid rgba(255,255,255,0.063)',
          borderRadius: '14px',
          display: 'flex',
          flexDirection: 'column',
          padding: '20px',
        },
      },
        h('div', { style: { display: 'flex', gap: '8px', marginBottom: '20px' } },
          h('div', { style: { width: '14px', height: '14px', borderRadius: '50%', background: '#ff5f57' } }),
          h('div', { style: { width: '14px', height: '14px', borderRadius: '50%', background: '#ffbd2e' } }),
          h('div', { style: { width: '14px', height: '14px', borderRadius: '50%', background: '#28ca41' } }),
        ),
        ...[
          [200, accent + '99'], [280, 'rgba(255,255,255,0.13)'],
          [240, accent + '88'], [260, 'rgba(255,255,255,0.09)'],
          [200, accent + '77'], [220, 'rgba(255,255,255,0.12)'],
          [300, accent + '66'], [240, 'rgba(255,255,255,0.08)'],
          [180, accent + '99'], [260, 'rgba(255,255,255,0.12)'],
          [160, accent + '88'], [220, 'rgba(255,255,255,0.09)'],
        ].map(([w, bg], i) =>
          h('div', {
            key: String(i),
            style: {
              width: `${w}px`,
              height: '8px',
              background: String(bg),
              borderRadius: '4px',
              marginBottom: '10px',
              marginLeft: i % 2 === 1 ? '20px' : '0',
            },
          }),
        ),
      ),

      // Footer
      h('div', {
        style: {
          position: 'absolute',
          bottom: '0',
          left: '0',
          right: '0',
          display: 'flex',
          flexDirection: 'column',
        },
      },
        h('div', { style: { height: '1px', background: 'rgba(255,255,255,0.063)', marginLeft: '72px', marginRight: '72px', marginBottom: '16px' } }),
        h('div', { style: { color: '#475569', fontSize: '16px', paddingLeft: '72px', paddingBottom: '20px' } }, siteHost),
        h('div', { style: { height: '4px', background: accent, width: '100%' } }),
      ),
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: 'Inter', data: fontRegularData, weight: 400, style: 'normal' },
        { name: 'Inter', data: fontBoldData,    weight: 700, style: 'normal' },
      ],
    },
  );
}
