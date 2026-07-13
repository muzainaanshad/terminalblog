#!/usr/bin/env node
/**
 * Build a weekly Coding Agent digest and publish via Beehiiv Posts API.
 *
 * Env:
 *   BEEHIIV_API_KEY              required
 *   BEEHIIV_PUBLICATION_ID       required (pub_...)
 *   BEEHIIV_SEND                 "true" = publish/send (status=confirmed)
 *                                "false" or unset = create draft only (safer default)
 *   BEEHIIV_DAYS                 lookback days for posts (default 7)
 *   BEEHIIV_MAX_POSTS            max articles in digest (default 8)
 *
 * Note: Create/Send Post API is Beehiiv Enterprise (beta). On 403 the script
 * prints a free-plan path: RSS automation in Beehiiv dashboard.
 *
 * Usage:
 *   node scripts/send-weekly-beehiiv.cjs
 *   BEEHIIV_SEND=true node scripts/send-weekly-beehiiv.cjs
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const BLOG = path.join(ROOT, 'src', 'content', 'blog');
const SITE = 'https://terminalblog.com';

const API_KEY = process.env.BEEHIIV_API_KEY;
const PUB_ID = process.env.BEEHIIV_PUBLICATION_ID;
const SEND =
  process.argv.includes('--send') ||
  String(process.env.BEEHIIV_SEND || 'false').toLowerCase() === 'true';
const DAYS = Number(process.env.BEEHIIV_DAYS || 7);
const MAX = Number(process.env.BEEHIIV_MAX_POSTS || 8);

function parseFrontmatter(raw) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return { fm: {}, body: raw };
  const fm = {};
  for (const line of m[1].split(/\r?\n/)) {
    const mm = line.match(/^(\w+):\s*(.*)$/);
    if (!mm) continue;
    let v = mm[2].trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    fm[mm[1]] = v;
  }
  return { fm, body: raw.slice(m[0].length).trim() };
}

function isNoise(slug, tags) {
  const t = String(tags || '').toLowerCase();
  if (slug.includes('just-shipped')) return true;
  if (t.includes('just-shipped') || t.includes('shipped')) return true;
  return false;
}

function loadRecentPosts() {
  const cutoff = Date.now() - DAYS * 864e5;
  const files = fs.readdirSync(BLOG).filter((f) => f.endsWith('.mdx'));
  const posts = [];

  for (const file of files) {
    const slug = file.replace(/\.mdx$/, '');
    const raw = fs.readFileSync(path.join(BLOG, file), 'utf8');
    const { fm } = parseFrontmatter(raw);
    if (isNoise(slug, fm.tags)) continue;

    const pub = fm.pubDate ? new Date(fm.pubDate).getTime() : 0;
    if (!pub || pub < cutoff) continue;

    const tags = String(fm.tags || '');
    const score =
      (tags.includes('pillar') ? 100 : 0) +
      (tags.includes('beware') || tags.includes('security') ? 80 : 0) +
      (tags.includes('comparison') ? 40 : 0) +
      (tags.includes('guide') ? 30 : 0);

    posts.push({
      slug,
      title: fm.title || slug,
      description: fm.description || '',
      pubDate: fm.pubDate,
      score,
      url: `${SITE}/blog/${slug}/`,
    });
  }

  posts.sort((a, b) => b.score - a.score || new Date(b.pubDate) - new Date(a.pubDate));
  return posts.slice(0, MAX);
}

function buildHtml(posts) {
  const weekOf = new Date().toISOString().slice(0, 10);
  const items = posts
    .map(
      (p) => `
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #e5e7eb;">
          <a href="${p.url}" style="color:#0f766e;font-weight:600;text-decoration:none;font-size:16px;">
            ${escapeHtml(p.title)}
          </a>
          <div style="color:#6b7280;font-size:14px;margin-top:4px;line-height:1.4;">
            ${escapeHtml(p.description)}
          </div>
        </td>
      </tr>`
    )
    .join('');

  return `
<div style="font-family:ui-sans-serif,system-ui,sans-serif;max-width:600px;margin:0 auto;color:#111827;">
  <p style="font-size:13px;color:#0f766e;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;margin:0 0 8px;">
    terminalblog · Coding Agent Weekly
  </p>
  <h1 style="font-size:22px;line-height:1.25;margin:0 0 12px;">
    What mattered this week
  </h1>
  <p style="font-size:15px;color:#4b5563;line-height:1.5;margin:0 0 20px;">
    Security, adoption, and real agent news — not commit spam.
    Week of ${weekOf}.
  </p>
  <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
    ${items || '<tr><td style="padding:12px 0;color:#6b7280;">No high-signal posts this window — check the live site.</td></tr>'}
  </table>
  <p style="margin:24px 0 8px;">
    <a href="${SITE}/leaderboard/" style="display:inline-block;background:#0f766e;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none;font-weight:600;font-size:14px;">
      Open live leaderboard
    </a>
  </p>
  <p style="font-size:13px;color:#6b7280;line-height:1.5;margin:16px 0 0;">
    Embed the leaderboard:
    <a href="${SITE}/embed/leaderboard/" style="color:#0f766e;">${SITE}/embed/leaderboard/</a><br/>
    Full site: <a href="${SITE}/" style="color:#0f766e;">${SITE}</a>
  </p>
</div>`.trim();
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function beehiivCreatePost({ title, subtitle, html, status }) {
  const res = await fetch(
    `https://api.beehiiv.com/v2/publications/${PUB_ID}/posts`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title,
        subtitle,
        body_content: html,
        status, // draft | confirmed
        recipients: {
          web: { tier_ids: ['all'] },
          email: { tier_ids: ['all'] },
        },
        email_settings: {
          email_subject_line: title,
          email_preview_text: subtitle,
          display_title_in_email: true,
          display_subtitle_in_email: true,
        },
      }),
    }
  );
  const data = await res.json().catch(() => ({}));
  return { res, data };
}

function writeSiteDigest(posts, weekOf, title, subtitle) {
  const slug = `coding-agent-weekly-${weekOf}`;
  const out = path.join(BLOG, `${slug}.mdx`);
  if (fs.existsSync(out)) {
    console.log(`Site digest already exists: ${slug}`);
    return { slug, path: out, created: false };
  }

  const list = posts
    .map(
      (p) =>
        `### [${p.title.replace(/]/g, "'")}](${p.url})\n\n${p.description}\n`
    )
    .join('\n');

  const mdx = `---
title: "${title.replace(/"/g, '\\"')}"
description: "${subtitle.replace(/"/g, '\\"')}"
pubDate: ${weekOf}
tags: ["newsletter", "roundup", "coding-agents", "weekly"]
tool: "industry"
author: "sage"
---

${subtitle}

High-signal only — no just-shipped noise.

${list}

## Leaderboard

Track live adoption: [AI Coding Agent Leaderboard](/leaderboard/)  
Embed: [/embed/leaderboard/](/embed/leaderboard/)

## Subscribe

Get this weekly: form on [terminalblog.com](/#newsletter)
`;

  fs.writeFileSync(out, mdx);
  console.log(`Wrote site digest: /blog/${slug}/`);
  return { slug, path: out, created: true };
}

async function main() {
  const posts = loadRecentPosts();
  const weekOf = new Date().toISOString().slice(0, 10);
  const title = `Coding Agent Weekly — ${weekOf}`;
  const subtitle = `${posts.length} high-signal links · security, pricing, adoption`;
  const html = buildHtml(posts);
  const status = SEND ? 'confirmed' : 'draft';

  console.log(`Building digest: ${posts.length} posts (last ${DAYS}d)`);
  posts.forEach((p, i) => console.log(`  ${i + 1}. ${p.title}`));

  // Always publish a site post (works on every Beehiiv plan via RSS)
  const site = writeSiteDigest(posts, weekOf, title, subtitle);

  const outDir = path.join(ROOT, 'tmp');
  fs.mkdirSync(outDir, { recursive: true });
  const previewPath = path.join(outDir, `beehiiv-digest-${weekOf}.html`);
  fs.writeFileSync(previewPath, html);
  console.log(`Preview HTML: ${previewPath}`);

  if (!API_KEY || !PUB_ID) {
    console.log('No Beehiiv env — site digest only. Set BEEHIIV_* to also push via API.');
    console.log(`
FREE PLAN EMAIL PATH:
1. Beehiiv -> RSS automation -> ${SITE}/rss.xml
2. After this digest is deployed, Beehiiv can email it automatically.
`);
    return;
  }

  console.log(`Beehiiv mode: ${status}${SEND ? ' (WILL SEND)' : ' (draft only)'}`);
  const { res, data } = await beehiivCreatePost({ title, subtitle, html, status });

  if (res.ok) {
    console.log('Beehiiv OK:', JSON.stringify(data));
    console.log(
      SEND
        ? 'Post confirmed - Beehiiv will send to subscribers.'
        : 'Draft created in Beehiiv. Re-run with --send to publish.'
    );
    return;
  }

  console.error('Beehiiv error', res.status, JSON.stringify(data, null, 2));

  if (res.status === 403 || res.status === 401) {
    console.log(`
============================================================
Beehiiv Create/Send API needs Enterprise (your plan returned 403).

FREE automation that still works:
1. Site digest written: ${SITE}/blog/${site.slug}/
2. Deploy the site (GitHub Action can commit this file)
3. Beehiiv dashboard -> RSS -> ${SITE}/rss.xml
4. Enable "email new RSS items" / weekly automation

HTML for manual paste: ${previewPath}
============================================================
`);
    // Non-zero only if site digest failed; 403 is expected on free plan
    process.exit(0);
  }

  process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
