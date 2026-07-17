const fs = require('fs');
const m = JSON.parse(fs.readFileSync('src/data/article-memory.json', 'utf8'));
const art = m.articles;

function rel(slug) {
  const a = art[slug]; if (!a) return [];
  const set = new Set([...a.keywords, ...a.tags.map(t => t.toLowerCase())]);
  const scored = Object.entries(art).map(([s, b]) => {
    if (s === slug) return null;
    let score = 0;
    for (const k of set) { if (b.keywords.includes(k)) score += 3; }
    for (const t of (b.tags || [])) { if (a.tags.some(x => x.toLowerCase() === t.toLowerCase())) score += 2; }
    if (b.tool === a.tool && a.tool) score += 2;
    return { s, score, w: b.wordCount };
  }).filter(x => x && x.score > 0).sort((x, y) => y.score - x.score);
  return scored.slice(0, 8);
}

const cands = process.argv.slice(2);
for (const c of cands) {
  const r = rel(c);
  console.log('\n== ' + c + ' (' + (art[c] ? art[c].wordCount : 0) + 'w, tags:' + (art[c] ? art[c].tags.join(',') : '') + ') ==');
  r.forEach(x => console.log('  [' + x.score + '] ' + x.s + ' (' + x.w + 'w)'));
}
