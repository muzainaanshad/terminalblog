#!/usr/bin/env node
/**
 * fetch-harness-releases.cjs — daily harness changelog fetcher.
 * Per-repo source strategy:
 *   releases — GitHub Releases (most tools)
 *   tags     — git tags (repos that tag versions without Releases, e.g. hermes-agent, aider)
 *              tag commit message (first line) becomes the body.
 * Writes src/data/harness-changelog/releases.json. Keeps 400-entry history.
 */
const fs = require('fs');
const path = require('path');

const REPOS = [
  { id: 'claude-code', owner: 'anthropics', repo: 'claude-code', name: 'Claude Code', source: 'releases' },
  { id: 'codex', owner: 'openai', repo: 'codex', name: 'Codex CLI', source: 'releases' },
  { id: 'opencode', owner: 'anomalyco', repo: 'opencode', name: 'OpenCode', source: 'releases' },
  { id: 'gemini-cli', owner: 'google-gemini', repo: 'gemini-cli', name: 'Gemini CLI', source: 'releases' },
  { id: 'hermes-agent', owner: 'NousResearch', repo: 'hermes-agent', name: 'Hermes Agent', source: 'tags' },
  { id: 'cline', owner: 'cline', repo: 'cline', name: 'Cline', source: 'releases' },
  { id: 'goose', owner: 'block', repo: 'goose', name: 'Goose', source: 'releases' },
  { id: 'aider', owner: 'Aider-AI', repo: 'aider', name: 'Aider', source: 'tags' },
  { id: 'crush', owner: 'charmbracelet', repo: 'crush', name: 'Crush', source: 'releases' },
  { id: 'kilocode', owner: 'Kilo-Org', repo: 'kilocode', name: 'Kilo Code', source: 'releases' },
  { id: 'pi', owner: 'badlogic', repo: 'pi-mono', name: 'Pi', source: 'releases' },
  { id: 'qwen-code', owner: 'QwenLM', repo: 'qwen-code', name: 'Qwen Code', source: 'releases' },
  { id: 'continue', owner: 'continuedev', repo: 'continue', name: 'Continue', source: 'releases' },
  { id: 'openhands', owner: 'All-Hands-AI', repo: 'openhands', name: 'OpenHands', source: 'releases' },
  { id: 'gptme', owner: 'gptme', repo: 'gptme', name: 'gptme', source: 'releases' },
  { id: 'forge', owner: 'antinomyhq', repo: 'forge', name: 'Forge Code', source: 'releases' },
];

const OUT = path.join(__dirname, '..', 'src', 'data', 'harness-changelog', 'releases.json');
const UA = { 'User-Agent': 'terminalblog-changelog', 'Accept': 'application/vnd.github+json' };
const PRE_RE = /alpha|beta|nightly|rc[.-]|snapshot|dev/i;

async function gh(url) {
  const res = await fetch(url, { headers: UA });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function fetchRepo(r) {
  const out = [];
  try {
    if (r.source === 'releases') {
      const rels = await gh(`https://api.github.com/repos/${r.owner}/${r.repo}/releases?per_page=15`);
      for (const rel of rels) {
        out.push({
          id: `${r.id}-${rel.id}`,
          tool: r.name, toolId: r.id, tag: rel.tag_name,
          title: rel.name || rel.tag_name,
          publishedAt: rel.published_at || rel.created_at,
          prerelease: rel.prerelease || PRE_RE.test(rel.tag_name),
          url: rel.html_url,
          body: (rel.body || '').slice(0, 4000),
        });
      }
    } else {
      // tags: resolve each tag to its commit date + message
      const tags = await gh(`https://api.github.com/repos/${r.owner}/${r.repo}/tags?per_page=15`);
      for (const tag of tags.slice(0, 12)) {
        if (PRE_RE.test(tag.name)) continue;
        try {
          const c = await gh(`https://api.github.com/repos/${r.owner}/${r.repo}/commits/${tag.commit.sha}`);
          out.push({
            id: `${r.id}-tag-${tag.name}`,
            tool: r.name, toolId: r.id, tag: tag.name,
            title: tag.name,
            publishedAt: c.commit.committer.date,
            prerelease: PRE_RE.test(tag.name),
            url: `https://github.com/${r.owner}/${r.repo}/releases/tag/${encodeURIComponent(tag.name)}`,
            body: (c.commit.message || '').split('\n').slice(0, 8).join('\n').slice(0, 2500),
          });
        } catch (e) { console.error(`${r.id}/${tag.name}: ${e.message}`); }
      }
    }
  } catch (e) { console.error(`${r.id}: ${e.message}`); }
  return out;
}

(async () => {
  const results = await Promise.all(REPOS.map(fetchRepo));
  let all = results.flat().filter(x => x.publishedAt);
  // drop tag-only version bumps (body is just a chore/release line) — pure noise
  all = all.filter(x => !/^\s*chore(\(.*\))?:\s*(release|version|bump)/i.test(x.body || '') || /\n/.test(x.body || ''));
  const seen = new Set();
  all = all.filter(x => { if (seen.has(x.id)) return false; seen.add(x.id); return true; });
  all.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
  // merge with existing history
  let prev = [];
  try { prev = JSON.parse(fs.readFileSync(OUT, 'utf8')).releases || []; } catch {}
  const prevSeen = new Set(all.map(x => x.id));
  for (const p of prev) if (!prevSeen.has(p.id)) all.push(p);
  all.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
  // dedupe same tool+tag (annotated vs lightweight tag refs, incl. history) — keep the richer body
  const best = new Map();
  for (const x of all) {
    const k = x.toolId + '|' + x.tag;
    const cur = best.get(k);
    if (!cur || (x.body || '').length > (cur.body || '').length) best.set(k, x);
  }
  all = [...best.values()].sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
  all = all.slice(0, 400);
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify({ fetchedAt: new Date().toISOString(), count: all.length, releases: all }, null, 1));
  const byTool = {};
  for (const x of all) byTool[x.tool] = (byTool[x.tool] || 0) + 1;
  console.log(`saved ${all.length} entries across ${Object.keys(byTool).length} tools`);
  console.log(JSON.stringify(byTool));
})();
