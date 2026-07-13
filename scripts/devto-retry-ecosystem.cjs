const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

const BLOG = path.join(__dirname, '..', 'src', 'content', 'blog');
const slugs = ['rust-guardrail-tool-ai-agent-code', 'claude-code-rate-limit-utilization'];
const tagMap = {
  'rust-guardrail-tool-ai-agent-code': ['rust', 'security', 'ai', 'tutorial'],
  'claude-code-rate-limit-utilization': ['ai', 'productivity', 'cli', 'beginners'],
};

function stripF(md) {
  const m = md.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  return m ? m[2].trim() : md;
}
function titleF(md) {
  const m = md.match(/title:\s*"([^"]*)"/);
  return m ? m[1] : 'Untitled';
}

for (const slug of slugs) {
  const raw = fs.readFileSync(path.join(BLOG, slug + '.mdx'), 'utf8');
  const body = stripF(raw);
  const title = titleF(raw);
  const canonical = 'https://terminalblog.com/blog/' + slug + '/';
  const payload = { article: { title, body_markdown: body, published: true, tags: tagMap[slug], canonical_url: canonical } };
  const tmp = path.join(os.tmpdir(), 'devto-' + slug + '.json');
  fs.writeFileSync(tmp, JSON.stringify(payload));
  try {
    const out = execSync(
      `curl -s -X POST -H "api-key: 9Kw5MgKzMvJ2g1G8TCUoR3un" -H "Content-Type: application/json" --data @${tmp} https://dev.to/api/articles`,
      { encoding: 'utf8' }
    );
    let s = '?';
    try { const j = JSON.parse(out); s = j.url || (j.error ? JSON.stringify(j.error) : out.slice(0, 200)); } catch { s = out.slice(0, 200); }
    console.log('RESULT ' + slug + ' -> ' + s);
  } catch (e) {
    console.error('FAIL ' + slug + ': ' + e.message);
  } finally {
    fs.unlinkSync(tmp);
  }
}
