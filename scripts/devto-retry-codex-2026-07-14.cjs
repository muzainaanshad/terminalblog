#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const BLOG = path.join(__dirname, '..', 'src', 'content', 'blog');
const API = 'https://dev.to/api/articles';
const KEY = '9Kw5MgKzMvJ2g1G8TCUoR3un';
const slug = 'codex-just-shipped-windows-console-pid-reap-agent-identity';
const content = fs.readFileSync(path.join(BLOG, slug + '.mdx'), 'utf-8');
const m = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
const fm = m[1];
const fields = {};
for (const line of fm.split(/\r?\n/)) {
  const mm = line.match(/^(\w+):\s*"([^"]*)"$/);
  if (mm) fields[mm[1]] = mm[2];
  const arr = line.match(/^tags:\s*\[(.*)\]$/);
  if (arr) fields.tags = arr[1].split(',').map(s => s.trim().replace(/"/g, ''));
}
const body = content.slice(m[0].length).trim();
const title = fields.title;
const canonical = `https://terminalblog.com/blog/${slug}/`;
const tags = (fields.tags || ['ai', 'coding']).map(t => t.toLowerCase().replace(/[^a-z0-9]+/g, '').slice(0, 25)).filter(Boolean).slice(0, 4);
(async () => {
  let ok = false, tries = 0;
  while (!ok && tries < 12) {
    tries++;
    try {
      const res = await fetch(API, {
        method: 'POST',
        headers: { 'api-key': KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ article: { title, body_markdown: body, published: true, tags, canonical_url: canonical } }),
      });
      const txt = await res.text();
      let url = '';
      try { url = JSON.parse(txt).url || ''; } catch (e) {}
      console.log(`${res.status} | ${url || txt.slice(0, 120)}`);
      if (res.status === 201) { ok = true; }
      else { console.log(`wait 310s retry ${tries}`); await new Promise(r => setTimeout(r, 310000)); }
    } catch (e) {
      console.log(`ERR ${e.message}`);
      await new Promise(r => setTimeout(r, 310000));
    }
  }
  process.exit(ok ? 0 : 1);
})();
