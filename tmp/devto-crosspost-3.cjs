#!/usr/bin/env node
// Cross-post the three new ecosystem articles to dev.to
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const BLOG = path.join(__dirname, '..', 'src', 'content', 'blog');
const KEY = '9Kw5MgKzMvJ2g1G8TCUoR3un';

function parseFrontmatter(raw) {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) return { fm: {}, body: raw };
  const fmText = m[1], body = m[2];
  const fm = {};
  fmText.split('\n').forEach(line => {
    const mm = line.match(/^([a-zA-Z]+):\s*(.*)$/);
    if (mm) {
      let v = mm[2].trim();
      if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
      fm[mm[1]] = v;
    }
  });
  return { fm, body: body.trim() };
}

const articles = [
  {
    file: 'mindwalk-3d-codebase-replay.mdx',
    title: 'Mindwalk Replays Your Coding-Agent Sessions on a 3D Map of Your Codebase',
    slug: 'mindwalk-3d-codebase-replay',
    tags: ['ai', 'opensource', 'tooling', 'visualization'],
  },
  {
    file: 'run-claude-codex-in-browser.mdx',
    title: 'Run Claude Code and Codex in Your Browser — The Browser-Remote Trend Explained',
    slug: 'run-claude-codex-in-browser',
    tags: ['ai', 'remote', 'workflow', 'news'],
  },
  {
    file: 'slipstream-command-deck-ai-dev.mdx',
    title: 'Slipstream and the Rise of the Command Deck for AI-Assisted Development',
    slug: 'slipstream-command-deck-ai-dev',
    tags: ['ai', 'tooling', 'launches', 'ui'],
  },
];

for (const a of articles) {
  const raw = fs.readFileSync(path.join(BLOG, a.file), 'utf-8');
  const { fm, body } = parseFrontmatter(raw);
  const canonical = `https://terminalblog.com/blog/${a.slug}/`;
  const payload = {
    article: {
      title: a.title,
      body_markdown: body,
      published: true,
      tags: a.tags,
      canonical_url: canonical,
    },
  };
  const tmp = path.join('/tmp', a.slug + '.json');
  fs.writeFileSync(tmp, JSON.stringify(payload));
  try {
    const out = execSync(`curl -s -X POST -H "api-key: ${KEY}" -H "Content-Type: application/json" -d @${tmp} https://dev.to/api/articles`, { encoding: 'utf8' });
    console.log(a.slug + ' -> ' + out.slice(0, 200));
  } catch (e) {
    console.log(a.slug + ' ERROR ' + e.message.slice(0, 200));
  }
}
