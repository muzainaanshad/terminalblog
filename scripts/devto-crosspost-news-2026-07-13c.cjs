#!/usr/bin/env node
// Cross-post the 2026-07-13 (third run) Hugging News viral roundup to Dev.to
// Pattern mirrors devto-crosspost-news-2026-07-12.cjs
const fs = require('fs');
const path = require('path');

const BLOG = path.join(__dirname, '..', 'src', 'content', 'blog');
const API = 'https://dev.to/api/articles';
const KEY = '9Kw5MgKzMvJ2g1G8TCUoR3un';

const slugs = [
  'perplexity-orchestrator-grok-45-benchmark-2026-07-13',
  'kraken-agentic-trading-bots-2026-07-13',
  'microsoft-365-copilot-gpt-5-6-default-2026-07-13',
  'genlayer-internet-court-ai-agents-27-firms-2026-07-13',
  'gpt-5-6-claude-fable-code-arena-2026-07-13',
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
      if (!ok) { console.log(`backoff 310s for ${s} (try ${tries})`); await new Promise(r => setTimeout(r, 310000)); }
      else await new Promise(r => setTimeout(r, 5000));
    }
  }
})();
