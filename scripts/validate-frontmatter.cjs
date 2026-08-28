// Validate all blog frontmatter parses as YAML.
// Usage: node scripts/validate-frontmatter.cjs
const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Minimal YAML parse check using gray-matter's underlying js-yaml if available,
// else a naive brace/quote balance check. We rely on js-yaml via gray-matter.
let yaml;
try { yaml = require('gray-matter')._YAML || require('js-yaml'); } catch (e) {}
if (!yaml) {
  try { yaml = require('js-yaml'); } catch (e) { console.error('no yaml lib'); process.exit(2); }
}

const dir = path.join(process.cwd(), 'src', 'content', 'blog');
const files = glob.sync('*.mdx', { cwd: dir });
let bad = 0;
const badFiles = [];
for (const f of files) {
  const fp = path.join(dir, f);
  const txt = fs.readFileSync(fp, 'utf8');
  const m = txt.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) { console.log('NO FRONTMATTER:', f); bad++; badFiles.push(f); continue; }
  try {
    yaml.load(m[1]);
  } catch (e) {
    console.log('BAD YAML:', f, '=>', e.message.split('\n')[0]);
    bad++; badFiles.push(f);
  }
}
console.log(`\nChecked ${files.length} files. Bad: ${bad}`);
if (badFiles.length) {
  fs.writeFileSync('tmp/bad-frontmatter.json', JSON.stringify(badFiles, null, 2));
}
process.exit(bad ? 1 : 0);
