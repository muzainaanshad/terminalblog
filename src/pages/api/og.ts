// OG Image Generator - Vercel Edge Function
// Generates social card images for article sharing
// Endpoint: /api/og?title=...&tool=...

export async function GET({ request }: { request: Request }) {
  const url = new URL(request.url);
  const title = url.searchParams.get('title') || 'Coding Agents';
  const tool = url.searchParams.get('tool') || '';

  try {
    const { ImageResponse } = await import('@vercel/og');

    const interRegular = await fetch(
      'https://fonts.cdnfonts.com/s/19795/Inter-Regular.woff'
    ).then(r => r.arrayBuffer()).catch(() => new ArrayBuffer(0));

    const interBold = await fetch(
      'https://fonts.cdnfonts.com/s/19795/Inter-SemiBold.woff'
    ).then(r => r.arrayBuffer()).catch(() => new ArrayBuffer(0));

    const fonts = [];
    if (interRegular.byteLength > 0) fonts.push({ name: 'Inter', data: interRegular, weight: 400 });
    if (interBold.byteLength > 0) fonts.push({ name: 'Inter', data: interBold, weight: 700 });

    return new ImageResponse(
      {
        type: 'div',
        props: {
          style: {
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'flex-end',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
            padding: '60px 70px',
            fontFamily: 'Inter, sans-serif',
          },
          children: [
            tool ? {
              type: 'div',
              props: {
                style: {
                  fontSize: '24px',
                  color: '#60a5fa',
                  fontWeight: 600,
                  marginBottom: '12px',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                },
                children: tool,
              },
            } : null,
            {
              type: 'div',
              props: {
                style: {
                  fontSize: '52px',
                  fontWeight: 700,
                  color: '#ffffff',
                  lineHeight: 1.15,
                  marginBottom: '20px',
                  maxWidth: '900px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                },
                children: title,
              },
            },
            {
              type: 'div',
              props: {
                style: {
                  fontSize: '20px',
                  color: '#94a3b8',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                },
                children: [
                  'Coding Agents',
                  { type: 'span', props: { style: { color: '#475569' }, children: '·' } },
                  'Deep dives into autonomous coding assistants',
                ],
              },
            },
          ].filter(Boolean),
        },
      },
      {
        width: 1200,
        height: 630,
        fonts,
      }
    );
  } catch (e) {
    // Fallback: return a simple SVG if ImageResponse fails
    return new Response(
      `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
        <rect width="1200" height="630" fill="#0f172a"/>
        <text x="70" y="350" font-family="sans-serif" font-size="48" font-weight="bold" fill="white">${escapeXml(title)}</text>
        ${tool ? `<text x="70" y="280" font-family="sans-serif" font-size="24" fill="#60a5fa" font-weight="600">${escapeXml(tool)}</text>` : ''}
        <text x="70" y="420" font-family="sans-serif" font-size="20" fill="#94a3b8">Coding Agents · Deep dives into autonomous coding assistants</text>
      </svg>`,
      {
        headers: { 'Content-Type': 'image/svg+xml' },
        status: 200,
      }
    );
  }
}

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
