#!/usr/bin/env node
/**
 * Remove repeated consecutive identical paragraphs from comparison MDX.
 * Also collapse the pad-thin "Teams that win..." spam.
 */
const fs = require('fs');
const path = require('path');
const BLOG = path.join(__dirname, '..', 'src', 'content', 'blog');

const SPAM =
  'Teams that win with agents treat the harness as infrastructure: version it, pin models where possible, log tool use, and keep a human merge gate. Brand rankings without those habits produce demos, not delivery.';

function isComp(f) {
  return (
    f.endsWith('.mdx') &&
    (f.includes('-vs-') || /comparison/i.test(f) || f.startsWith('open-source-vs-'))
  );
}

function scrubBody(body) {
  // normalize and drop consecutive duplicate paragraphs
  let parts = body
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
  const out = [];
  let last = '';
  let spamCount = 0;
  for (const p of parts) {
    const norm = p.replace(/\s+/g, ' ').trim();
    if (norm === SPAM.replace(/\s+/g, ' ').trim()) {
      spamCount++;
      if (spamCount > 1) continue; // keep at most one
    }
    if (norm === last) continue;
    out.push(p);
    last = norm;
  }
  return out.join('\n\n') + '\n';
}

let files = 0;
let changed = 0;
for (const f of fs.readdirSync(BLOG).filter(isComp)) {
  files++;
  const p = path.join(BLOG, f);
  const raw = fs.readFileSync(p, 'utf8');
  const m = raw.match(/^(---[\s\S]*?---\r?\n)([\s\S]*)$/);
  if (!m) continue;
  const body = m[2];
  const scrubbed = scrubBody(body);
  if (scrubbed !== body) {
    fs.writeFileSync(p, m[1] + scrubbed);
    changed++;
  }
}
console.log(JSON.stringify({ files, changed }));
