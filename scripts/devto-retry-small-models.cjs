#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const BLOG = path.join(__dirname, '..', 'src', 'content', 'blog');
const API = 'https://dev.to/api/articles';
const KEY = '9Kw5MgKzMvJ2g1G8TCUoR3un';
const slug = 'ai-customers-small-models-beautiful';
const content = fs.readFileSync(path.join(BLOG, slug + '.mdx'), 'utf-8');
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
const tags = (fields.tags || ['ai', 'coding']).map(t => t.toLowerCase().replace(/[^a-z0-9]+/g, '').slice(0, 25)).filter(Boolean).slice(0, 4);
const payload = { article: { title: fields.title, body_markdown: body, published: true, tags, canonical_url: `https://terminalblog.com/blog/${slug}/` } };
(async () => {
  let ok = false, tries = 0;
  while (!ok && tries < 6) {
    tries++;
    try {
      const res = await fetch(API, { method: 'POST', headers: { 'api-key': KEY, 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const txt = await res.text();
      let url = '';
      try { url = JSON.parse(txt).url || ''; } catch (e) {}
      console.log(`${res.status} | ${slug} | ${url || txt.slice(0, 120)}`);
      if (url) { ok = true; break; }
    } catch (e) { console.log(`ERR ${slug}: ${e.message}`); }
    if (!ok) { console.log(`retry (${tries})`); await new Promise(r => setTimeout(r, 31000)); }
  }
})();
