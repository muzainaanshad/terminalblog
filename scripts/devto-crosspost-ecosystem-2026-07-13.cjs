// Cross-post the four new ecosystem articles to dev.to
// Robust: write each payload to a temp JSON file, POST with --data @file
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

const BLOG = path.join(__dirname, '..', 'src', 'content', 'blog');
const slugs = [
  'coding-agents-that-see-the-browser',
  'coding-agents-as-teammates-onedev',
  'rust-guardrail-tool-ai-agent-code',
  'claude-code-rate-limit-utilization',
];

const tagMap = {
  'coding-agents-that-see-the-browser': ['ai', 'webdev', 'productivity', 'beginners'],
  'coding-agents-as-teammates-onedev': ['ai', 'productivity', 'devops', 'career'],
  'rust-guardrail-tool-ai-agent-code': ['rust', 'security', 'ai', 'tutorial'],
  'claude-code-rate-limit-utilization': ['ai', 'productivity', 'cli', 'beginners'],
};

function stripFrontmatter(md) {
  const m = md.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) return md;
  return m[2].trim();
}

function titleFromFrontmatter(md) {
  const m = md.match(/title:\s*"([^"]*)"/);
  return m ? m[1] : 'Untitled';
}

for (const slug of slugs) {
  const file = path.join(BLOG, slug + '.mdx');
  const raw = fs.readFileSync(file, 'utf8');
  const body = stripFrontmatter(raw);
  const title = titleFromFrontmatter(raw);
  const tags = tagMap[slug] || ['ai', 'productivity'];
  const canonical = `https://terminalblog.com/blog/${slug}/`;

  const payload = {
    article: { title, body_markdown: body, published: true, tags, canonical_url: canonical },
  };

  const tmp = path.join(os.tmpdir(), `devto-${slug}.json`);
  fs.writeFileSync(tmp, JSON.stringify(payload));

  try {
    const out = execSync(
      `curl -s -X POST -H "api-key: 9Kw5MgKzMvJ2g1G8TCUoR3un" -H "Content-Type: application/json" --data @${tmp} https://dev.to/api/articles`,
      { encoding: 'utf8' }
    );
    let status = 'unknown';
    try { const j = JSON.parse(out); status = j.url || (j.error ? JSON.stringify(j.error) : out.slice(0, 200)); } catch { status = out.slice(0, 200); }
    console.log(`RESULT ${slug} -> ${status}`);
  } catch (e) {
    console.error(`FAILED ${slug}: ${e.message}`);
  } finally {
    fs.unlinkSync(tmp);
  }
}
