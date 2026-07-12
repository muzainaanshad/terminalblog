#!/usr/bin/env node
// Cross-post the two new ecosystem articles to dev.to
const fs = require('fs');
const { execSync } = require('child_process');

const POSTS = [
  {
    slug: 'pi-vim-of-coding-agents',
    title: 'Pi Is the "Vim of Coding Agents" — and That\'s Exactly the Point',
    file: 'src/content/blog/pi-vim-of-coding-agents.mdx',
    tags: ['opensource', 'ai', 'webdev', 'productivity']
  },
  {
    slug: 'claude-code-model-routing-trust-crisis',
    title: "Claude Code's Trust Problem: A Wave of Model and Routing Complaints Hit GitHub",
    file: 'src/content/blog/claude-code-model-routing-trust-crisis.mdx',
    tags: ['ai', 'webdev', 'productivity', 'discuss']
  }
];

const API = 'https://dev.to/api/articles';
const KEY = '9Kw5MgKzMvJ2g1G8TCUoR3un';

for (const p of POSTS) {
  // strip frontmatter
  let body = fs.readFileSync(p.file, 'utf-8');
  body = body.replace(/^---[\s\S]*?---\n/, '');
  const payload = {
    article: {
      title: p.title,
      body_markdown: body,
      published: true,
      tags: p.tags,
      canonical_url: `https://terminalblog.com/blog/${p.slug}/`
    }
  };
  try {
    const res = execSync(`curl -s -X POST -H "api-key: ${KEY}" -H "Content-Type: application/json" ${API} -d @-`, {
      input: JSON.stringify(payload), encoding: 'utf8', timeout: 30000
    });
    console.log(`POSTED ${p.slug}:`, res.slice(0, 200));
  } catch (e) {
    console.error(`FAILED ${p.slug}:`, e.message);
  }
}
