#!/usr/bin/env node
/**
 * fetch-harness-releases.cjs — pull latest releases/tags from coding-harness repos
 * Writes src/data/harness-changelog/releases.json (raw feed for the changelog page).
 * Runs daily via cron; safe to re-run (idempotent, keeps history, capped at 400 entries).
 */
const fs = require('fs');
const path = require('path');

const REPOS = [
  { id: 'claude-code', owner: 'anthropics', repo: 'claude-code', name: 'Claude Code' },
  { id: 'codex', owner: 'openai', repo: 'codex', name: 'Codex CLI' },
  { id: 'opencode', owner: 'anomalyco', repo: 'opencode', name: 'OpenCode' },
  { id: 'gemini-cli', owner: 'google-gemini', repo: 'gemini-cli', name: 'Gemini CLI' },
  { id: 'hermes-agent', owner: 'NousResearch', repo: 'hermes-agent', name: 'Hermes Agent' },
  { id: 'cline', owner: 'cline', repo: 'cline', name: 'Cline' },
  { id: 'goose', owner: 'block', repo: 'goose', name: 'Goose' },
  { id: 'aider', owner: 'Aider-AI', repo: 'aider', name: 'Aider' },
  { id: 'crush', owner: 'charmbracelet', repo: 'crush', name: 'Crush' },
  { id: 'opencode-ai', owner: 'opencode-ai', repo: 'opencode', name: 'OpenCode (sst)' },
];

const OUT = path.join(__dirname, '..', 'src', 'data', 'harness-changelog', 'releases.json');

async function fetchRepo(r) {
  const out = [];
  try {
    const res = await fetch(`https://api.github.com/repos/${r.owner}/${r.repo}/releases?per_page=10`, {
      headers: { 'User-Agent': 'terminalblog-changelog', 'Accept': 'application/vnd.github+json' },
    });
    if (!res.ok) { console.error(`${r.id}: HTTP ${res.status}`); return out; }
    const rels = await res.json();
    for (const rel of rels) {
      out.push({
        id: `${r.id}-${rel.id}`,
        tool: r.name,
        toolId: r.id,
        tag: rel.tag_name,
        title: rel.name || rel.tag_name,
        publishedAt: rel.published_at,
        prerelease: rel.prerelease || /alpha|beta|nightly|rc[.-]|snapshot/i.test(rel.tag_name),
        url: rel.html_url,
        body: (rel.body || '').slice(0, 4000),
      });
    }
  } catch (e) { console.error(`${r.id}: ${e.message}`); }
  return out;
}

(async () => {
  const results = await Promise.all(REPOS.map(fetchRepo));
  let all = results.flat();
  // dedupe + sort newest first
  const seen = new Set();
  all = all.filter(x => { if (seen.has(x.id)) return false; seen.add(x.id); return x.publishedAt; });
  all.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
  all = all.slice(0, 400);
  // merge with existing history to keep entries that fell off per_page=10
  let prev = [];
  try { prev = JSON.parse(fs.readFileSync(OUT, 'utf8')).releases || []; } catch {}
  const prevSeen = new Set(all.map(x => x.id));
  for (const p of prev) if (!prevSeen.has(p.id)) all.push(p);
  all.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
  all = all.slice(0, 400);
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify({ fetchedAt: new Date().toISOString(), count: all.length, releases: all }, null, 1));
  console.log(`saved ${all.length} releases -> ${path.relative(process.cwd(), OUT)}`);
})();
