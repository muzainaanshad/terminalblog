// Chart Generator — simple SVG bar/line charts for articles
// Endpoint: /api/chart?data=Hermes:10,Claude:20,OhMyPi:15&labels=Hermes,Claude,OhMyPi&title=Cost+Comparison

import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ url }) => {
  const dataStr = url.searchParams.get('data') || '';
  const labelsStr = url.searchParams.get('labels') || '';
  const chartTitle = url.searchParams.get('title') || '';
  const type = url.searchParams.get('type') || 'bar';

  const data = dataStr.split(',').map(d => {
    const [label, val] = d.split(':');
    return { label: label || '', value: parseFloat(val) || 0 };
  });
  const labels = labelsStr ? labelsStr.split(',') : data.map(d => d.label);
  data.forEach((d, i) => { if (labels[i]) d.label = labels[i]; });

  const maxVal = Math.max(...data.map(d => d.value), 1);
  const barW = 80;
  const gap = 40;
  const chartW = Math.max(data.length * (barW + gap) + 80, 400);
  const chartH = 350;
  const padTop = 60;
  const padBottom = 60;
  const padLeft = 60;
  const padRight = 40;
  const drawW = chartW - padLeft - padRight;
  const drawH = chartH - padTop - padBottom;
  const colors = ['#60a5fa', '#34d399', '#f472b6', '#fbbf24', '#a78bfa', '#fb923c', '#38bdf8'];

  const bars = data.map((d, i) => {
    const barH = (d.value / maxVal) * drawH;
    const x = padLeft + i * (barW + gap);
    const y = padTop + drawH - barH;
    const color = colors[i % colors.length];
    return `
    <rect x="${x}" y="${y}" width="${barW}" height="${barH}" rx="4" fill="${color}" opacity="0.9"/>
    <text x="${x + barW/2}" y="${padTop + drawH + 20}" text-anchor="middle" font-family="system-ui,sans-serif" font-size="13" fill="#94a3b8">${d.label}</text>
    <text x="${x + barW/2}" y="${y - 8}" text-anchor="middle" font-family="system-ui,sans-serif" font-size="14" font-weight="600" fill="#e2e8f0">${d.value}</text>`;
  }).join('');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${chartW}" height="${chartH}" viewBox="0 0 ${chartW} ${chartH}">
  <rect width="${chartW}" height="${chartH}" rx="8" fill="#1e293b"/>
  ${chartTitle ? `<text x="${chartW/2}" y="32" text-anchor="middle" font-family="system-ui,sans-serif" font-size="18" font-weight="700" fill="#f1f5f9">${escapeXml(chartTitle)}</text>` : ''}
  <line x1="${padLeft}" y1="${padTop}" x2="${padLeft}" y2="${padTop + drawH}" stroke="#475569" stroke-width="1"/>
  <line x1="${padLeft}" y1="${padTop + drawH}" x2="${chartW - padRight}" y2="${padTop + drawH}" stroke="#475569" stroke-width="1"/>
  ${[0, 0.25, 0.5, 0.75, 1].map(pct => {
    const y = padTop + drawH - (pct * drawH);
    return `<line x1="${padLeft}" y1="${y}" x2="${chartW - padRight}" y2="${y}" stroke="#334155" stroke-width="0.5"/>
    <text x="${padLeft - 8}" y="${y + 4}" text-anchor="end" font-family="system-ui,sans-serif" font-size="11" fill="#64748b">${Math.round(pct * maxVal)}</text>`;
  }).join('')}
  ${bars}
</svg>`;

  return new Response(svg, {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}
