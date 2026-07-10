#!/usr/bin/env node
// fetches recent commits from all tracked repos, outputs clean JSON

const REPOS = [
  { owner: 'NousResearch', name: 'hermes-agent', label: 'Hermes Agent' },
  { owner: 'opencode-ai', name: 'opencode', label: 'OpenCode' },
  { owner: 'mimo-code', name: 'mimo', label: 'Mimo Code' },
  { owner: 'kilocode', name: 'cli', label: 'Kilo Code CLI' },
  { owner: 'pi-delabs', name: 'pi', label: 'pi.dev' },
  { owner: 'gitlawb', name: 'zero', label: 'Gitlawb Zero' },
  { owner: 'can1357', name: 'oh-my-pi', label: 'Oh My Pi' },
  { owner: 'anthropics', name: 'claude-code', label: 'Claude Code' }
];

const HOURS_BACK = 6; // matches 3-hour cron with overlap

async function fetchCommits(owner, repo) {
  const since = new Date(Date.now() - HOURS_BACK * 60 * 60 * 1000).toISOString();
  const url = `https://api.github.com/repos/${owner}/${repo}/commits?since=${since}&per_page=10`;
  try {
    const res = await fetch(url, {
      headers: { 'Accept': 'application/vnd.github+json', 'User-Agent': 'CodingAgentsBot/1.0' }
    });
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data.map(c => ({
      message: c.commit.message.split('\n')[0],
      date: c.commit.committer.date,
    }));
  } catch { return []; }
}

async function main() {
  const articles = [];
  for (const repo of REPOS) {
    const commits = await fetchCommits(repo.owner, repo.name);
    const clean = commits.filter(c => !/merge|chore:|docs:|readme|typo|bump|version|ci:|release/i.test(c.message));
    if (clean.length > 0) {
      articles.push({
        tool: repo.label,
        recentChanges: clean.slice(0, 5).map(c => ({ what: c.message, date: c.date.slice(0, 10) })),
        commitCount: clean.length
      });
    }
  }
  const output = { timestamp: new Date().toISOString(), repos: articles, hasNewContent: articles.length > 0 };
  if (articles.length === 0) output.tip = 'No recent changes. Write a general educational article instead.';
  process.stdout.write(JSON.stringify(output, null, 2));
}

main().catch(e => { process.stderr.write(`Error: ${e.message}\n`); process.exit(1); });
