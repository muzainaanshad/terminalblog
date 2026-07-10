#!/usr/bin/env node
// Fetches latest GitHub releases for tracked coding agent repos
// Outputs structured JSON

const REPOS = [
  { owner: 'NousResearch', name: 'hermes-agent', label: 'Hermes Agent' },
  { owner: 'opencode-ai', name: 'opencode', label: 'OpenCode' },
  { owner: 'gitlawb', name: 'zero', label: 'Gitlawb Zero' },
  { owner: 'can1357', name: 'oh-my-pi', label: 'Oh My Pi' },
  { owner: 'kilocode', name: 'cli', label: 'Kilo Code CLI' },
  { owner: 'mimo-code', name: 'mimo', label: 'Mimo Code' },
  { owner: 'pi-delabs', name: 'pi', label: 'pi.dev' },
  { owner: 'aaif-goose', name: 'goose', label: 'Goose' },
  { owner: 'openclaw', name: 'openclaw', label: 'OpenClaw' },
  { owner: 'CodebuffAI', name: 'codebuff', label: 'Codebuff' },
];

async function fetchReleases(owner, repo, label) {
  const url = `https://api.github.com/repos/${owner}/${repo}/releases?per_page=3`;
  const token = process.env.GITHUB_TOKEN;
  const headers = { 'Accept': 'application/vnd.github+json', 'User-Agent': 'TerminalBlog/1.0' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  try {
    const res = await fetch(url, { headers });
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data.map(r => ({
      label,
      version: r.tag_name,
      name: r.name,
      publishedAt: r.published_at,
      url: r.html_url,
      body: (r.body || '').slice(0, 300),
      prerelease: r.prerelease,
    }));
  } catch { return []; }
}

async function main() {
  const results = await Promise.all(
    REPOS.map(r => fetchReleases(r.owner, r.name, r.label))
  );

  const all = results.flat().sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  process.stdout.write(JSON.stringify({
    fetchedAt: new Date().toISOString(),
    releases: all,
    totalReleases: all.length,
  }, null, 2));
}

main().catch(e => {
  process.stderr.write(`Error: ${e.message}\n`);
  process.exit(1);
});
