#!/usr/bin/env node
// Fetches recent GitHub issues from tracked coding agent repos (last 3h)

const TOKEN = process.env.GITHUB_TOKEN;

const REPOS = [
  { owner: 'anthropics', name: 'claude-code', agent: 'claude-code' },
  { owner: 'NousResearch', name: 'hermes-agent', agent: 'hermes' },
  { owner: 'opencode-ai', name: 'opencode', agent: 'opencode' },
  { owner: 'openai', name: 'codex', agent: 'codex' },
  { owner: 'cursor', name: 'cursor', agent: 'cursor' },
  { owner: 'kilocode', name: 'cli', agent: 'kilo' },
  { owner: 'gitlawb', name: 'zero', agent: 'gitlawb-zero' },
  { owner: 'can1357', name: 'oh-my-pi', agent: 'oh-my-pi' },
  { owner: 'aaif-goose', name: 'goose', agent: 'goose' },
  { owner: 'openclaw', name: 'openclaw', agent: 'openclaw' },
  { owner: 'CodebuffAI', name: 'codebuff', agent: 'codebuff' },
  { owner: 'ampcode', name: 'amp', agent: 'ampcode' },
  { owner: 'github', name: 'copilot-cli', agent: 'copilot-cli' },
];

const SINCE = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();

async function fetchIssues(owner, name, agent) {
  const url = `https://api.github.com/repos/${owner}/${name}/issues?state=all&since=${SINCE}&per_page=10&sort=created&direction=desc`;
  const headers = {
    'Accept': 'application/vnd.github+json',
    'User-Agent': 'terminalblog-monitor',
  };
  if (TOKEN) headers['Authorization'] = `Bearer ${TOKEN}`;

  try {
    const res = await fetch(url, { headers });
    if (!res.ok) return { agent, error: res.status };
    const issues = await res.json();
    return {
      agent,
      count: issues.length,
      issues: issues.map(i => ({
        title: i.title,
        number: i.number,
        url: i.html_url,
        state: i.state,
        comments: i.comments,
        labels: i.labels?.map(l => l.name) || [],
        time: i.created_at,
      })),
    };
  } catch (e) {
    return { agent, error: e.message?.slice(0, 100) };
  }
}

const results = await Promise.all(
  REPOS.map(r => fetchIssues(r.owner, r.name, r.agent))
);

const active = results.filter(r => r.count > 0);
const total = active.reduce((s, r) => s + r.count, 0);

console.log(JSON.stringify({
  window: '3h',
  since: SINCE,
  totalIssues: total,
  reposWithActivity: active.length,
  results: active,
}, null, 2));
