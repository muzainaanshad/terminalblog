#!/usr/bin/env node
/**
 * summarize-harness-releases.cjs — add oneLine + summary to releases lacking them.
 * Reads releases.json, writes summaries.json (slim file: id -> {oneLine, summary, impact}).
 * The actual summarization is done by an LLM (opencode headless) using this file's --export/--import modes.
 *
 * Modes:
 *   --export [file]   write pending (unsummarized) releases as plain-text batch to file
 *   --import [file]   read LLM answers (one JSON object per line) and merge into summaries.json
 *   --status          report counts
 */
const fs = require('fs');
const path = require('path');

const DATA = path.join(__dirname, '..', 'src', 'data', 'harness-changelog');
const REL = path.join(DATA, 'releases.json');
const SUM = path.join(DATA, 'summaries.json');

const load = (f, dflt) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return dflt; } };
const save = (f, v) => fs.writeFileSync(f, JSON.stringify(v, null, 1));

const summaries = load(SUM, {});

function pending() {
  const { releases } = load(REL, { releases: [] });
  return releases.filter(r => !r.prerelease && !summaries[r.id]);
}

const mode = process.argv[2] || '--status';
const file = process.argv[3];

if (mode === '--export') {
  const items = pending();
  const lines = items.map(r => JSON.stringify({ id: r.id, tool: r.tool, tag: r.tag, body: r.body.slice(0, 2500) }));
  fs.writeFileSync(file, lines.join('\n'));
  console.log(`exported ${items.length} pending -> ${file}`);
} else if (mode === '--import') {
  const lines = fs.readFileSync(file, 'utf8').split('\n').filter(Boolean);
  let n = 0;
  for (const line of lines) {
    try {
      const o = JSON.parse(line);
      if (o.id && o.oneLine && o.summary) { summaries[o.id] = { oneLine: o.oneLine.slice(0, 120), summary: o.summary.slice(0, 400), impact: o.impact || 'minor' }; n++; }
    } catch {}
  }
  save(SUM, summaries);
  console.log(`imported ${n}/${lines.length} summaries; total ${Object.keys(summaries).length}`);
} else {
  const { releases } = load(REL, { releases: [] });
  const stable = releases.filter(r => !r.prerelease);
  console.log(`releases: ${releases.length} (${stable.length} stable), summarized: ${stable.filter(r => summaries[r.id]).length}, pending: ${pending().length}`);
}
