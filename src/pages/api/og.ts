// OG Image Generator — pure SVG, works everywhere
// Endpoint: /api/og?title=...&tool=...

import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ url }) => {
  const rawTitle = url.searchParams.get('title') || 'Coding Agents';
  const tool = url.searchParams.get('tool') || '';
  const desc = 'Deep dives into autonomous coding assistants';

  const title = escapeXml(rawTitle);
  const toolLine = tool ? escapeXml(tool.toUpperCase()) : '';
  const lines = wrapText(title, 10);
  const titleSvg = lines.slice(0, 3).map((line, i) =>
    `    <tspan x="70" dy="${i === 0 ? 0 : 58}">${line}</tspan>`
  ).join('\n');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0f172a"/>
      <stop offset="50%" style="stop-color:#1e293b"/>
      <stop offset="100%" style="stop-color:#334155"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  ${toolLine ? `<text x="70" y="140" font-family="system-ui,sans-serif" font-size="28" font-weight="700" fill="#60a5fa" letter-spacing="3">${toolLine}</text>` : ''}
  <text x="70" y="${toolLine ? 220 : 200}" font-family="system-ui,sans-serif" font-size="52" font-weight="800" fill="#ffffff">
${titleSvg}
  </text>
  <text x="70" y="520" font-family="system-ui,sans-serif" font-size="20" fill="#94a3b8">Coding Agents &middot; ${escapeXml(desc)}</text>
</svg>`;

  return new Response(svg, {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
};

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function wrapText(text: string, maxWords: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  for (let i = 0; i < words.length && i < maxWords * 3; i += maxWords) {
    lines.push(words.slice(i, i + maxWords).join(' '));
  }
  return lines;
}
