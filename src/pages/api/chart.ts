// Dynamic SVG chart generator for article-specific graphs
// Usage: /api/chart?type=swe-bench&agents=hermes,claude-code,cursor
//        /api/chart?type=pricing&agents=hermes,codex
//        /api/chart?type=features&agents=hermes,cursor

import agentsData from '../../data/agents.json';

const COLORS = {
  green: '#22c55e',
  red: '#ef4444',
  yellow: '#f59e0b',
  blue: '#3b82f6',
  purple: '#a855f7',
  pink: '#ec4899',
  cyan: '#06b6d4',
  lime: '#84cc16',
  gray: '#6b7280',
  darkGray: '#4b5563',
  border: '#1f2937',
  bg: '#0a0a0f',
  headerBg: '#15151e',
};

const AGENT_COLORS = [
  '#22c55e', '#3b82f6', '#a855f7', '#f59e0b', '#ec4899',
  '#06b6d4', '#84cc16', '#ef4444', '#8b5cf6', '#14b8a6',
  '#f97316', '#e11d48', '#0ea5e9', '#65a30d', '#d946ef',
];

function wrap(text, maxChars) {
  if (text.length <= maxChars) return [text];
  const words = text.split(' ');
  const lines = [];
  let current = '';
  for (const w of words) {
    if ((current + ' ' + w).trim().length > maxChars) {
      lines.push(current.trim());
      current = w;
    } else {
      current += ' ' + w;
    }
  }
  if (current.trim()) lines.push(current.trim());
  return lines;
}

function svgHeader(title, subtitle) {
  const st = subtitle ? `<text x="20" y="52" font-family="'Courier New',monospace" font-size="11" fill="#e5e7eb">${subtitle}</text>` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 ${subtitle ? 480 : 400}" width="800" height="${subtitle ? 480 : 400}">
  <rect width="800" height="${subtitle ? 480 : 400}" fill="${COLORS.bg}" rx="8"/>
  <rect x="0" y="0" width="800" height="32" fill="${COLORS.headerBg}" rx="8 8 0 0"/>
  <circle cx="16" cy="16" r="5" fill="#ef4444"/>
  <circle cx="32" cy="16" r="5" fill="#f59e0b"/>
  <circle cx="48" cy="16" r="5" fill="#22c55e"/>
  <text x="400" y="22" font-family="'Courier New',monospace" font-size="11" fill="#6b7280" text-anchor="middle">terminal — ${title}</text>
  <line x1="0" y1="60" x2="800" y2="60" stroke="${COLORS.border}" stroke-width="1"/>
  <text x="20" y="52" font-family="'Courier New',monospace" font-size="11" fill="${COLORS.green}">$</text>
  ${st}
  <line x1="20" y1="85" x2="780" y2="85" stroke="${COLORS.border}" stroke-width="0.5"/>`;
}

function svgFooter() {
  return `<line x1="0" y1="${460}" x2="800" y2="${460}" stroke="${COLORS.border}" stroke-width="1"/>
  <text x="20" y="${478}" font-family="'Courier New',monospace" font-size="9" fill="#6b7280">Data from agents.json · terminalblog.com</text>`;
}

function drawBarChart(ctx) {
  const { agents, valueKey, labelKey, title, format } = ctx;
  const barHeight = 28;
  const gap = 8;
  const chartLeft = 200;
  const chartRight = 740;
  const chartWidth = chartRight - chartLeft;
  const maxVal = Math.max(...agents.map(a => parseFloat(a[valueKey]) || 0), 1);
  const totalHeight = agents.length * (barHeight + gap);
  const height = Math.max(totalHeight + 160, 350);
  
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 ${height}" width="800" height="${height}">
  <rect width="800" height="${height}" fill="${COLORS.bg}" rx="8"/>
  <rect x="0" y="0" width="800" height="32" fill="${COLORS.headerBg}" rx="8 8 0 0"/>
  <circle cx="16" cy="16" r="5" fill="#ef4444"/>
  <circle cx="32" cy="16" r="5" fill="#f59e0b"/>
  <circle cx="48" cy="16" r="5" fill="#22c55e"/>
  <text x="400" y="22" font-family="'Courier New',monospace" font-size="11" fill="${COLORS.gray}" text-anchor="middle">terminal — ${title}</text>
  <line x1="0" y1="60" x2="800" y2="60" stroke="${COLORS.border}" stroke-width="1"/>
  <text x="20" y="52" font-family="'Courier New',monospace" font-size="11" fill="${COLORS.green}">$</text>
  <text x="36" y="52" font-family="'Courier New',monospace" font-size="11" fill="#e5e7eb">terminalblog chart — ${title}</text>`;

  agents.forEach((agent, i) => {
    const y = 95 + i * (barHeight + gap);
    const val = parseFloat(agent[valueKey]) || 0;
    const barW = Math.max((val / maxVal) * chartWidth, 30);
    const color = AGENT_COLORS[i % AGENT_COLORS.length];
    
    svg += `
  <text x="${chartLeft - 10}" y="${y + 18}" font-family="'Courier New',monospace" font-size="10" fill="#e5e7eb" text-anchor="end">${agent.name}</text>
  <rect x="${chartLeft}" y="${y + 3}" width="${barW}" height="${barHeight}" rx="3" fill="${color}" opacity="0.85"/>
  <text x="${chartLeft + barW + 8}" y="${y + 20}" font-family="'Courier New',monospace" font-size="10" fill="${color}" font-weight="bold">${format ? format(val, agent) : val}</text>`;
  });

  svg += `
  <line x1="0" y1="${height - 30}" x2="800" y2="${height - 30}" stroke="${COLORS.border}" stroke-width="1"/>
  <text x="20" y="${height - 10}" font-family="'Courier New',monospace" font-size="9" fill="#6b7280">terminalblog.com · Data from agents.json</text>
</svg>`;
  return svg;
}

export async function GET({ url }) {
  const type = url.searchParams.get('type') || 'swe-bench';
  const agentIds = url.searchParams.get('agents')?.split(',').filter(Boolean) || [];

  const agents = agentsData.filter(a => agentIds.length === 0 || agentIds.includes(a.id));

  let svg = '';

  switch (type) {
    case 'swe-bench':
      svg = drawBarChart({
        agents,
        valueKey: 'sweBench',
        labelKey: 'name',
        title: 'SWE-bench Scores',
        format: (v) => v + '%',
      });
      break;

    case 'pricing': {
      const rows = agents.map((a, i) => {
        const color = AGENT_COLORS[i % AGENT_COLORS.length];
        const price = a.pricing.split('/')[0].trim();
        return `  <text x="20" y="${115 + i*24}" fill="${color}">${a.name}</text>
  <text x="200" y="${115 + i*24}" fill="${a.pricing.startsWith('Free') || a.pricing.startsWith('$0') ? COLORS.green : COLORS.yellow}">${price}</text>
  <text x="400" y="${115 + i*24}" fill="${COLORS.gray}">${a.pricing}</text>`;
      }).join('\n');
      
      svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 ${agents.length * 24 + 130}" width="800" height="${agents.length * 24 + 130}">
  <rect width="800" height="${agents.length * 24 + 130}" fill="${COLORS.bg}" rx="8"/>
  <rect x="0" y="0" width="800" height="32" fill="${COLORS.headerBg}" rx="8 8 0 0"/>
  <circle cx="16" cy="16" r="5" fill="#ef4444"/>
  <circle cx="32" cy="16" r="5" fill="#f59e0b"/>
  <circle cx="48" cy="16" r="5" fill="#22c55e"/>
  <text x="400" y="22" font-family="'Courier New',monospace" font-size="11" fill="${COLORS.gray}" text-anchor="middle">terminal — pricing</text>
  <line x1="0" y1="60" x2="800" y2="60" stroke="${COLORS.border}" stroke-width="1"/>
  <text x="20" y="52" font-family="'Courier New',monospace" font-size="11" fill="${COLORS.green}">$</text>
  <text x="36" y="52" font-family="'Courier New',monospace" font-size="11" fill="#e5e7eb">terminalblog chart — pricing</text>
  <line x1="20" y1="85" x2="780" y2="85" stroke="${COLORS.border}" stroke-width="0.5"/>
  <text x="20" y="103" font-family="'Courier New',monospace" font-size="9" fill="${COLORS.yellow}" font-weight="bold">AGENT</text>
  <text x="200" y="103" font-family="'Courier New',monospace" font-size="9" fill="${COLORS.yellow}" font-weight="bold">PRICE</text>
  <text x="400" y="103" font-family="'Courier New',monospace" font-size="9" fill="${COLORS.yellow}" font-weight="bold">FULL</text>
${rows}
  <line x1="0" y1="${agents.length * 24 + 118}" x2="800" y2="${agents.length * 24 + 118}" stroke="${COLORS.border}" stroke-width="1"/>
  <text x="20" y="${agents.length * 24 + 138}" font-family="'Courier New',monospace" font-size="9" fill="#6b7280">terminalblog.com · Data from agents.json</text>
</svg>`;
      break;
    }

    case 'features': {
      const features = ['vision', 'cron', 'multiProvider', 'gitIntegration', 'pluginSystem', 'subagents', 'bgTasks', 'localFirst'];
      const featureLabels = { vision: 'Vision', cron: 'Cron/Schedule', multiProvider: 'Multi-provider', gitIntegration: 'Git', pluginSystem: 'Plugins', subagents: 'Subagents', bgTasks: 'BG tasks', localFirst: 'Local-first' };
      const colW = Math.min(70, Math.floor((700 - 100) / agents.length));
      const tableLeft = 100;
      const rowH = 22;
      const headerH = 95;
      const totalH = headerH + features.length * rowH + 50;
      
      let tsvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 ${totalH}" width="800" height="${totalH}">
  <rect width="800" height="${totalH}" fill="${COLORS.bg}" rx="8"/>
  <rect x="0" y="0" width="800" height="32" fill="${COLORS.headerBg}" rx="8 8 0 0"/>
  <circle cx="16" cy="16" r="5" fill="#ef4444"/>
  <circle cx="32" cy="16" r="5" fill="#f59e0b"/>
  <circle cx="48" cy="16" r="5" fill="#22c55e"/>
  <text x="400" y="22" font-family="'Courier New',monospace" font-size="11" fill="${COLORS.gray}" text-anchor="middle">terminal — feature matrix</text>
  <line x1="0" y1="60" x2="800" y2="60" stroke="${COLORS.border}" stroke-width="1"/>
  <text x="20" y="52" font-family="'Courier New',monospace" font-size="11" fill="${COLORS.green}">$</text>
  <text x="36" y="52" font-family="'Courier New',monospace" font-size="11" fill="#e5e7eb">terminalblog chart — features</text>
  <text x="20" y="${headerH}" font-family="'Courier New',monospace" font-size="9" fill="${COLORS.yellow}">FEATURE</text>`;
      
      agents.forEach((a, i) => {
        tsvg += `\n  <text x="${tableLeft + i * colW + colW/2}" y="${headerH}" font-family="'Courier New',monospace" font-size="8" fill="${AGENT_COLORS[i % AGENT_COLORS.length]}" text-anchor="middle">${a.name.split(' ')[0]}</text>`;
      });
      
      features.forEach((f, fi) => {
        const y = headerH + 20 + fi * rowH;
        tsvg += `\n  <text x="20" y="${y + 8}" font-family="'Courier New',monospace" font-size="8" fill="#e5e7eb">${featureLabels[f]}</text>`;
        agents.forEach((a, i) => {
          const val = a.features[f];
          const mark = val ? '✓' : '✗';
          const color = val ? COLORS.green : COLORS.red;
          tsvg += `\n  <text x="${tableLeft + i * colW + colW/2}" y="${y + 8}" font-family="'Courier New',monospace" font-size="9" fill="${color}" text-anchor="middle">${mark}</text>`;
        });
      });
      
      tsvg += `\n  <line x1="0" y1="${totalH - 20}" x2="800" y2="${totalH - 20}" stroke="${COLORS.border}" stroke-width="1"/>
  <text x="20" y="${totalH - 5}" font-family="'Courier New',monospace" font-size="8" fill="#6b7280">terminalblog.com</text>
</svg>`;
      svg = tsvg;
      break;
    }

    default:
      svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 200" width="800" height="200">
  <rect width="800" height="200" fill="${COLORS.bg}" rx="8"/>
  <text x="400" y="100" font-family="'Courier New',monospace" font-size="14" fill="${COLORS.gray}" text-anchor="middle">Unknown chart type: ${type}</text>
</svg>`;
  }

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
