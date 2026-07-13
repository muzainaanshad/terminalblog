#!/usr/bin/env node
/**
 * Continuous SEO learning loop (local + optional GSC).
 *
 * Always works offline from:
 *   - content-gate-report.json
 *   - quality-report.json / historical-debt-report.json
 *   - sitemap-ish post inventory
 *
 * Optional Google Search Console (Search Analytics API):
 *   Set GOOGLE_APPLICATION_CREDENTIALS to a service-account JSON
 *   that has access to the GSC property, and GSC_SITE_URL=https://terminalblog.com/
 *
 * Optional GA4:
 *   GA4_PROPERTY_ID=properties/XXXXXXXX
 *   (same service account needs GA Data API access)
 *
 * Output:
 *   docs/seo-learnings/YYYY-MM-DD.md
 *   seo-learnings-latest.json
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const BLOG = path.join(ROOT, 'src', 'content', 'blog');
const OUT_DIR = path.join(ROOT, 'docs', 'seo-learnings');
const today = new Date().toISOString().slice(0, 10);

function readJson(p) {
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {
    return null;
  }
}

function listPosts() {
  return fs
    .readdirSync(BLOG)
    .filter((f) => f.endsWith('.mdx'))
    .map((f) => {
      const raw = fs.readFileSync(path.join(BLOG, f), 'utf8');
      const title = (raw.match(/^title:\s*["']?(.*?)["']?\s*$/m) || [])[1] || f;
      const tags = (raw.match(/^tags:\s*(\[.*\])/m) || [])[1] || '[]';
      const words = raw.split(/\s+/).length;
      return { slug: f.replace(/\.mdx$/, ''), title, tags, words, file: f };
    });
}

async function fetchGscIfConfigured() {
  const site = process.env.GSC_SITE_URL || 'https://terminalblog.com/';
  const creds = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!creds || !fs.existsSync(creds)) {
    return {
      available: false,
      reason: 'Set GOOGLE_APPLICATION_CREDENTIALS + share GSC property with the service account',
    };
  }

  try {
    // Lazy require — only if googleapis installed
    let google;
    try {
      google = require('googleapis');
    } catch {
      return {
        available: false,
        reason: 'Install googleapis: npm i googleapis --save-dev',
      };
    }

    const auth = new google.google.auth.GoogleAuth({
      keyFile: creds,
      scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
    });
    const searchconsole = google.google.searchconsole({ version: 'v1', auth });
    const end = new Date();
    const start = new Date(Date.now() - 28 * 864e5);
    const fmt = (d) => d.toISOString().slice(0, 10);

    const res = await searchconsole.searchanalytics.query({
      siteUrl: site,
      requestBody: {
        startDate: fmt(start),
        endDate: fmt(end),
        dimensions: ['query', 'page'],
        rowLimit: 100,
      },
    });

    const rows = res.data.rows || [];
    return {
      available: true,
      range: { start: fmt(start), end: fmt(end) },
      topQueries: rows.slice(0, 40).map((r) => ({
        query: r.keys[0],
        page: r.keys[1],
        clicks: r.clicks,
        impressions: r.impressions,
        ctr: r.ctr,
        position: r.position,
      })),
      opportunities: rows
        .filter((r) => r.impressions >= 50 && r.ctr < 0.03 && r.position <= 20)
        .slice(0, 20)
        .map((r) => ({
          query: r.keys[0],
          page: r.keys[1],
          impressions: r.impressions,
          ctr: r.ctr,
          position: r.position,
          action: 'Improve title/meta + first paragraph for this query',
        })),
    };
  } catch (e) {
    return { available: false, reason: e.message };
  }
}

function buildLearnings({ posts, debt, gate, gsc }) {
  const pillars = posts.filter((p) => /pillar/.test(p.tags) || /pillar|checklist|decision-guide|pricing-guide|agents-md-complete/.test(p.slug));
  const justShipped = posts.filter((p) => /just-shipped/.test(p.slug));
  const thin = posts.filter((p) => p.words < 400);

  const actions = [];

  // Always-on heuristics
  if (justShipped.length > posts.length * 0.25) {
    actions.push({
      priority: 'P0',
      type: 'volume',
      action: `just-shipped is ${justShipped.length}/${posts.length} posts — batch digests, do not publish more roundups this week`,
    });
  }
  if (debt?.totals?.invalidTool > 0) {
    actions.push({
      priority: 'P0',
      type: 'metadata',
      action: `Run: node scripts/clear-historical-debt.cjs --fix-tools  (${debt.totals.invalidTool} bad tool tags)`,
    });
  }
  if (debt?.totals?.thin > 50) {
    actions.push({
      priority: 'P1',
      type: 'thin-content',
      action: `Archive thin posts: node scripts/clear-historical-debt.cjs --archive-thin  (${debt.totals.thin} thin)`,
    });
  }

  // Pillar reinforcement
  for (const p of pillars.slice(0, 6)) {
    actions.push({
      priority: 'P1',
      type: 'internal-links',
      action: `Add 3 internal links FROM new posts TO /blog/${p.slug}/ this week`,
    });
  }

  // GSC-driven
  if (gsc?.available && gsc.opportunities?.length) {
    for (const o of gsc.opportunities.slice(0, 10)) {
      actions.push({
        priority: 'P0',
        type: 'gsc-ctr',
        action: `"${o.query}" → ${o.page} (${o.impressions} impr, CTR ${(o.ctr * 100).toFixed(1)}%, pos ${o.position?.toFixed?.(1) || o.position}) — rewrite title/H1`,
      });
    }
  } else if (gsc && !gsc.available) {
    actions.push({
      priority: 'P1',
      type: 'setup',
      action: `Connect GSC for live learning: ${gsc.reason}`,
    });
  }

  // Default growth bets if no GSC
  if (!gsc?.available) {
    actions.push(
      {
        priority: 'P1',
        type: 'content',
        action: 'Expand /blog/coding-agent-security-checklist-2026/ with any new Beware posts this week',
      },
      {
        priority: 'P1',
        type: 'distribution',
        action: 'Post leaderboard embed screenshot on X + link /leaderboard/',
      },
      {
        priority: 'P2',
        type: 'content',
        action: 'One original Beware > five just-shipped posts',
      }
    );
  }

  return {
    date: today,
    stats: {
      posts: posts.length,
      pillars: pillars.length,
      justShipped: justShipped.length,
      thin: thin.length,
      gateErrors: gate?.errors ?? null,
    },
    gsc,
    actions,
  };
}

function toMarkdown(learn) {
  const lines = [
    `# SEO learnings — ${learn.date}`,
    '',
    'Auto-generated by `node scripts/seo-learn.cjs`.',
    '',
    '## Stats',
    '',
    `- Posts: ${learn.stats.posts}`,
    `- Pillars: ${learn.stats.pillars}`,
    `- just-shipped: ${learn.stats.justShipped}`,
    `- Thin-ish inventory: ${learn.stats.thin}`,
    '',
    '## Actions (do these)',
    '',
  ];
  for (const a of learn.actions) {
    lines.push(`- **${a.priority}** \`[${a.type}]\` ${a.action}`);
  }
  if (learn.gsc?.available) {
    lines.push('', '## Top GSC queries (28d)', '');
    for (const q of (learn.gsc.topQueries || []).slice(0, 15)) {
      lines.push(
        `- \`${q.query}\` — ${q.clicks} clicks / ${q.impressions} impr / pos ${Number(q.position).toFixed(1)} — ${q.page}`
      );
    }
  } else {
    lines.push('', '## GSC', '', `_Not connected:_ ${learn.gsc?.reason || 'n/a'}`, '');
    lines.push('See [docs/seo-mcp-analytics.md](../seo-mcp-analytics.md).');
  }
  lines.push('');
  return lines.join('\n');
}

async function main() {
  // refresh reports
  try {
    require('child_process').execSync('node scripts/content-gate.cjs', {
      cwd: ROOT,
      stdio: 'ignore',
    });
  } catch { /* ok */ }
  try {
    require('child_process').execSync('node scripts/clear-historical-debt.cjs', {
      cwd: ROOT,
      stdio: 'ignore',
    });
  } catch { /* ok */ }

  const posts = listPosts();
  const debt = readJson(path.join(ROOT, 'historical-debt-report.json'));
  const gate = readJson(path.join(ROOT, 'content-gate-report.json'));
  const gsc = await fetchGscIfConfigured();
  const learn = buildLearnings({ posts, debt, gate, gsc });

  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
  const mdPath = path.join(OUT_DIR, `${today}.md`);
  fs.writeFileSync(mdPath, toMarkdown(learn));
  fs.writeFileSync(path.join(ROOT, 'seo-learnings-latest.json'), JSON.stringify(learn, null, 2));

  console.log(toMarkdown(learn));
  console.log(`\nWrote ${mdPath}`);
  console.log('Wrote seo-learnings-latest.json');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
