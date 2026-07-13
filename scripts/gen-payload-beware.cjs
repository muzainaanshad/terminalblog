const fs = require('fs');
const raw = fs.readFileSync('src/content/blog/claude-code-stdout-silent-truncation.mdx', 'utf8');
const N = parseInt(process.argv[2] || '600', 10);
const b = raw.slice(0, N);
const p = {
  article: {
    title: 'Beware: Claude Code claude -p silently truncates L' + N,
    body_markdown: b,
    published: true,
    tags: ['linux'],
    canonical_url: 'https://terminalblog.com/blog/claude-code-stdout-silent-truncation-t' + N + '/',
  },
};
fs.writeFileSync('scripts/devto-payload-beware.json', JSON.stringify(p));
console.log('payload len', N);
