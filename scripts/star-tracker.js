#!/usr/bin/env node
// Fetches GitHub star counts and recent growth for tracked repos
// Outputs structured JSON for homepage stats

const REPOS = [
  { owner: 'NousResearch', name: 'hermes-agent', label: 'Hermes Agent' },
  { owner: 'opencode-ai', name: 'opencode', label: 'OpenCode' },
  { owner: 'gitlawb', name: 'zero', label: 'Gitlawb Zero' },
  { owner: 'can1357', name: 'oh-my-pi', label: 'Oh My Pi' },
  { owner: 'kilocode', name: 'cli', label: 'Kilo Code CLI' },
  { owner: 'mimo-code', name: 'mimo', label: 'Mimo Code' },
  { owner: 'pi-delabs', name: 'pi', label: 'pi.dev' },
];

async function fetchStars(owner, repo, label) {
  const url = `https://api.github.com/repos/${owner}/${repo}`;
  try {
    const res = await fetch(url, {
      headers: { 'Accept': 'application/vnd.github+json', 'User-Agent': 'TerminalBlog/1.0' }
    });
    if (!res.ok) return null;
    const data = await res.json();
    return {
      label,
      stars: data.stargazers_count || 0,
      forks: data.forks_count || 0,
      openIssues: data.open_issues_count || 0,
      language: data.language || '',
      description: (data.description || '').slice(0, 120),
      updatedAt: data.updated_at,
    };
  } catch { return null; }
}

async function main() {
  const results = await Promise.all(
    REPOS.map(r => fetchStars(r.owner, r.name, r.label))
  );

  const valid = results.filter(Boolean);
  const totalStars = valid.reduce((s, r) => s + r.stars, 0);

  process.stdout.write(JSON.stringify({
    fetchedAt: new Date().toISOString(),
    repos: valid,
    totalStars,
    avgStars: Math.round(totalStars / valid.length),
    topRepo: valid.sort((a, b) => b.stars - a.stars)[0]?.label || '',
  }, null, 2));
}

main().catch(e => {
  process.stderr.write(`Error: ${e.message}\n`);
  process.exit(1);
});
