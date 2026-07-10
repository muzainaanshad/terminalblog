#!/usr/bin/env node
// Fetches recent commits from tracked coding agent repos (last 3h)
// Uses GitHub API with token auth for higher rate limits

const TOKEN = process.env.GITHUB_TOKEN;

const REPOS = [
  // Original 8
  { owner: 'anthropics', name: 'claude-code', agent: 'claude-code' },
  { owner: 'NousResearch', name: 'hermes-agent', agent: 'hermes' },
  { owner: 'cursor', name: 'cursor', agent: 'cursor' },
  { owner: 'opencode-ai', name: 'opencode', agent: 'opencode' },
  { owner: 'kilocode', name: 'cli', agent: 'kilo' },
  { owner: 'gitlawb', name: 'zero', agent: 'gitlawb-zero' },
  { owner: 'can1357', name: 'oh-my-pi', agent: 'oh-my-pi' },
  { owner: 'openai', name: 'codex', agent: 'codex' },
  // New additions
  { owner: 'aaif-goose', name: 'goose', agent: 'goose' },
  { owner: 'openclaw', name: 'openclaw', agent: 'openclaw' },
  { owner: 'CodebuffAI', name: 'codebuff', agent: 'codebuff' },
  { owner: 'ampcode', name: 'amp', agent: 'ampcode' },
  { owner: 'github', name: 'copilot-cli', agent: 'copilot-cli' },
  { owner: 'mimo-code', name: 'mimo', agent: 'mimo' },
];

const SINCE = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();

async function fetchCommits(owner, name, agent) {
  const url = `https://api.github.com/repos/${owner}/${name}/commits?since=${SINCE}&per_page=10`;
  const headers = {
    'Accept': 'application/vnd.github+json',
    'User-Agent': 'terminalblog-monitor',
  };
  if (TOKEN) headers['Authorization'] = `Bearer ${TOKEN}`;

  try {
    const res = await fetch(url, { headers });
    if (!res.ok) return { agent, error: res.status };
    const commits = await res.json();
    return {
      agent,
      count: commits.length,
      commits: commits.map(c => ({
        msg: c.commit.message.split('\n')[0].slice(0, 120),
        author: c.commit.author?.name || 'unknown',
        time: c.commit.author?.date,
      })),
    };
  } catch (e) {
    return { agent, error: e.message?.slice(0, 100) };
  }
}

const results = await Promise.all(
  REPOS.map(r => fetchCommits(r.owner, r.name, r.agent))
);

const active = results.filter(r => r.count > 0);
const total = active.reduce((s, r) => s + r.count, 0);

console.log(JSON.stringify({
  window: '3h',
  since: SINCE,
  totalCommits: total,
  reposWithActivity: active.length,
  results: active,
}, null, 2));
