#!/usr/bin/env node
// Cross-post each new article to Dev.to
const fs = require('fs');
const path = require('path');

const BLOG = path.join(__dirname, '..', 'src', 'content', 'blog');
const API = 'https://dev.to/api/articles';
const KEY = '9Kw5MgKzMvJ2g1G8TCUoR3un';

const slugs = [
  'hermes-gateway-parent-runtime-session-scope',
  'hermes-secret-leakage-sandbox-windows-failures',
  'oh-my-pi-model-hub-session-selector',
  'oh-my-pi-grok-build-provider-cpu-spin',
  'openclaw-claude-fleet-cloud-workers',
  'openclaw-macos-launchd-crash-loop',
  'codex-sandbox-memory-consolidation',
  'codex-gpt-5-6-tool-call-bugs',
  'gitlawb-zero-0-4-0-npm-sandbox',
  'ai-news-roundup-2026-07-11',
];

function parseFront(content) {
  const m = content.match(/^---\n([\s\S]*?)\n---/);
  const fm = m[1];
  const fields = {};
  for (const line of fm.split('\n')) {
    const mm = line.match(/^(\w+):\s*"([^"]*)"$/);
    if (mm) fields[mm[1]] = mm[2];
    const arr = line.match(/^tags:\s*\[(.*)\]$/);
    if (arr) fields.tags = arr[1].split(',').map(s => s.trim().replace(/"/g, ''));
  }
  const body = content.slice(m[0].length).trim();
  return { fields, body };
}

function slugTag(t) {
  return t.toLowerCase().replace(/[^a-z0-9]+/g, '').slice(0, 25);
}

async function post(slug) {
  const fp = path.join(BLOG, slug + '.mdx');
  const content = fs.readFileSync(fp, 'utf-8');
  const { fields, body } = parseFront(content);
  const title = fields.title;
  const canonical = `https://terminalblog.com/blog/${slug}/`;
  const tags = (fields.tags || ['ai', 'coding']).map(slugTag).filter(Boolean).slice(0, 4);
  const payload = {
    article: {
      title,
      body_markdown: body,
      published: true,
      tags,
      canonical_url: canonical,
    },
  };
  const res = await fetch(API, {
    method: 'POST',
    headers: { 'api-key': KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const txt = await res.text();
  let url = '';
  try { url = JSON.parse(txt).url || ''; } catch (e) {}
  console.log(`${res.status} | ${slug} | ${url || txt.slice(0, 120)}`);
  return url;
}

(async () => {
  for (const s of slugs) {
    let ok = false, tries = 0;
    while (!ok && tries < 8) {
      tries++;
      try {
        const url = await post(s);
        if (url) ok = true;
      } catch (e) { console.log(`ERR ${s}: ${e.message}`); }
      if (!ok) { console.log(`retry ${s} (${tries})`); await new Promise(r => setTimeout(r, 35000)); }
      else await new Promise(r => setTimeout(r, 5000));
    }
  }
})();
