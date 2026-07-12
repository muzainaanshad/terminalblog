const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const BLOG = path.join(__dirname, '..', 'src', 'content', 'blog');
const KEY = '9Kw5MgKzMvJ2g1G8TCUoR3un';
const raw = fs.readFileSync(path.join(BLOG, 'slipstream-command-deck-ai-dev.mdx'), 'utf-8');
const m = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
const body = m[2].trim();
const payload = {
  article: {
    title: 'Slipstream and the Rise of the Command Deck for AI-Assisted Development',
    body_markdown: body,
    published: true,
    tags: ['ai', 'tooling', 'launches', 'ui'],
    canonical_url: 'https://terminalblog.com/blog/slipstream-command-deck-ai-dev/',
  },
};
fs.writeFileSync('/tmp/slip.json', JSON.stringify(payload));
const out = execSync(`curl -s -X POST -H "api-key: ${KEY}" -H "Content-Type: application/json" -d @/tmp/slip.json https://dev.to/api/articles`, { encoding: 'utf8' });
console.log(out.slice(0, 200));
