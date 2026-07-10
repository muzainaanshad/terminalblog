#!/usr/bin/env node
// fetches recent commits from all tracked repos, outputs clean JSON
// stdout is injected into cron job prompt as context

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

const HOURS_BACK = 24;

async function fetchCommits(owner, repo) {
  const since = new Date(Date.now() - HOURS_BACK * 60 * 60 * 1000).toISOString();
  const url = `https://api.github.com/repos/${owner}/${repo}/commits?since=${since}&per_page=15`;
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
      author: c.commit.committer.name
    }));
  } catch {
    return [];
  }
}

function categorize(msg) {
  const m = msg.toLowerCase();
  if (/merge|chore:|docs:|readme|typo|bump|version|ci:|release/i.test(m)) return 'noise';
  if (/^feat\(?/i.test(m)) return 'feature';
  if (/^fix\(?/i.test(m)) return 'fix';
  if (/^refactor\(?|^improve|^enhance/i.test(m)) return 'improvement';
  if (/^test\(?/i.test(m)) return 'test';
  return 'other';
}

async function main() {
  const articles = [];

  for (const repo of REPOS) {
    const commits = await fetchCommits(repo.owner, repo.name);
    const clean = commits
      .map(c => ({ ...c, category: categorize(c.message) }))
      .filter(c => c.category !== 'noise');

    if (clean.length > 0) {
      articles.push({
        tool: repo.label,
        recentChanges: clean.slice(0, 5).map(c => ({
          what: c.message,
          category: c.category,
          date: c.date.slice(0, 10)
        })),
        commitCount: clean.length
      });
    }
  }

  // Always output something - even if no new commits, write a general ecosystem article
  const output = {
    timestamp: new Date().toISOString(),
    repos: articles,
    hasNewContent: articles.length > 0
  };

  // If no content from any repo, signal that we should still write something
  if (articles.length === 0) {
    output.tip = 'No recent changes. Write a general educational article about coding agents instead.';
  }

  process.stdout.write(JSON.stringify(output, null, 2));
}

main().catch(e => {
  process.stderr.write(`Error: ${e.message}\n`);
  process.exit(1);
});
