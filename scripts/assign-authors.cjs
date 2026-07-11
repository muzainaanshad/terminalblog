#!/usr/bin/env node
// Batch-assign authors to articles missing the author field
const fs = require('fs');
const path = require('path');

const BLOG = path.join(__dirname, '..', 'src', 'content', 'blog');
const AUTHORS = ['kira', 'dev', 'rho', 'sage', 'ada', 'jax'];

function assign(title, content) {
  const t = (title + ' ' + content.slice(0, 300)).toLowerCase();
  if (/(crash|bug|security|vulnerab|data.?loss|fail|bsod|silent|kill|error)/i.test(t)) return 'kira';
  if(/(launch|release|new|beta|feature|update|roll.?out)/i.test(t)) return 'dev';
  if(/(price|cost|benchmark|comparison|number|stat|\$)/i.test(t)) return 'rho';
  if(/(trend|community|ecosystem|future|opinion|predict)/i.test(t)) return 'sage';
  if(/(workflow|setup|config|daily|productivity|tip|guide|how.?to)/i.test(t)) return 'ada';
  if(/(open.?source|self.?host|local|license|model|community)/i.test(t)) return 'jax';
  return AUTHORS[Math.floor(Math.random() * AUTHORS.length)];
}

const files = fs.readdirSync(BLOG).filter(f => f.endsWith('.mdx'));
let updated = 0;

for (const file of files) {
  const fp = path.join(BLOG, file);
  let content = fs.readFileSync(fp, 'utf-8');
  if (content.includes('author:')) continue;

  // Extract title
  const titleMatch = content.match(/^title:\s*"([^"]+)"/m);
  const title = titleMatch ? titleMatch[1] : file;
  const author = assign(title, content);

  // Insert author field after tool: or before image:
  content = content.replace(/^(tool:\s*.*)$/m, `$1\nauthor: "${author}"`);
  fs.writeFileSync(fp, content, 'utf-8');
  updated++;
  console.log(`${updated}. ${author} ← ${file.slice(0, 50)}`);
}

console.log(`\nDone. ${updated} articles updated.`);
