#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const BLOG_DIR = path.join(__dirname, '..', 'src', 'content', 'blog');
const files = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.mdx'));

function parseMdx(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const fmMatch = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!fmMatch) return null;
  const fm = fmMatch[1];
  const body = raw.slice(fmMatch[0].length).trim();
  const fields = {};
  fm.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split(':');
    if (key && valueParts.length) fields[key.trim()] = valueParts.join(':').trim();
  });
  return {
    slug: path.basename(filePath, '.mdx'),
    tags: fields.tags || '[]',
    tool: fields.tool || '',
    wordCount: body.split(/\s+/).filter(Boolean).length,
    hasRelated: raw.includes('## Related articles')
  };
}

const articles = files.map(f => parseMdx(path.join(BLOG_DIR, f))).filter(Boolean);

const recentSlugs = [
  'meta-muse-glimmer-30b-free-local-coding-agent',
  'hn-vibe-coding-own-tools-oss-debate',
  'hn-agents-debugging-production-developer-opinions',
  'hermes-security-credential-guards-provider-isolation',
  'hermes-secret-leakage-sandbox-windows-failures',
  'cve-2026-69192-leading-zero-ssrf-ip-address',
  'cursor-google-workspace-plugins-gmail-drive-calendar',
  'cursor-background-agents-changed-coding',
  'context-engineering-for-coding-agents-2026',
  'coding-agent-weekly-2026-08-10'
];

const recent = articles.filter(a => recentSlugs.includes(a.slug));
const others = articles.filter(a => a.wordCount > 500);

console.log('Recent articles found:', recent.length);
console.log('Total articles:', articles.length);
console.log('Others with >500 words:', others.length);

recent.forEach(a => {
  let aTags = [];
  try { aTags = JSON.parse(a.tags.replace(/'/g, '"')); } catch(e) { console.log('  TAG PARSE ERROR:', e.message); }
  const matches = others.filter(o => {
    if (o.slug === a.slug) return false;
    let oTags = [];
    try { oTags = JSON.parse(o.tags.replace(/'/g, '"')); } catch(e) { return false; }
    return (oTags.some(t => aTags.includes(t)) || (o.tool === a.tool && a.tool !== 'industry'));
  }).sort((a,b) => b.wordCount - a.wordCount).slice(0,3);
  
  console.log('---');
  console.log(a.slug, '| tool:', a.tool, '| words:', a.wordCount, '| hasRelated:', a.hasRelated);
  console.log('Tags:', aTags.join(', '));
  console.log('Matches:', matches.length);
  matches.forEach(m => console.log('  +', m.slug, '| tool:', m.tool));
});
