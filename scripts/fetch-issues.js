#!/usr/bin/env node
// Fetches recent GitHub issues from tracked coding agent repos
// Outputs structured JSON for article generation

const REPOS = [
  { owner: 'NousResearch', name: 'hermes-agent', label: 'Hermes Agent' },
  { owner: 'opencode-ai', name: 'opencode', label: 'OpenCode' },
  { owner: 'mimo-code', name: 'mimo', label: 'Mimo Code' },
  { owner: 'kilocode', name: 'cli', label: 'Kilo Code CLI' },
  { owner: 'pi-delabs', name: 'pi', label: 'pi.dev' },
  { owner: 'gitlawb', name: 'zero', label: 'Gitlawb Zero' },
  { owner: 'can1357', name: 'oh-my-pi', label: 'Oh My Pi' },
  { owner: 'anthropics', name: 'claude-code', label: 'Claude Code' },
  { owner: 'aaif-goose', name: 'goose', label: 'Goose' },
  { owner: 'openclaw', name: 'openclaw', label: 'OpenClaw' },
  { owner: 'CodebuffAI', name: 'codebuff', label: 'Codebuff' },
];

const HOURS_BACK = 48; // look at last 48h of issues

function parseIssue(body = '') {
  if (!body) return '';
  return body.replace(/```[\s\S]*?```/g, '').replace(/!\[.*?\]\(.*?\)/g, '').replace(/#{1,6}\s/g, '').trim().slice(0, 300);
}

async function fetchIssues(owner, repo, label) {
  const since = new Date(Date.now() - HOURS_BACK * 60 * 60 * 1000).toISOString();
  const token = process.env.GITHUB_TOKEN;
  const headers = { 'Accept': 'application/vnd.github+json', 'User-Agent': 'TerminalBlog/1.0' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  // Fetch recent issues (not PRs) + high-engagement open issues
  const urls = [
    `https://api.github.com/repos/${owner}/${repo}/issues?since=${since}&state=all&per_page=15&sort=updated`,
  ];

  const results = [];
  for (const url of urls) {
    try {
      const res = await fetch(url, { headers });
      if (!res.ok) continue;
      const data = await res.json();
      if (!Array.isArray(data)) continue;

      for (const issue of data) {
        if (issue.pull_request) continue; // skip PRs
        results.push({
          number: issue.number,
          title: issue.title,
          state: issue.state,
          labels: issue.labels?.map(l => l.name) || [],
          comments: issue.comments,
          created: issue.created_at,
          updated: issue.updated_at,
          body: parseIssue(issue.body),
          url: issue.html_url,
        });
      }
    } catch { /* skip */ }
  }

  return { repo: `${owner}/${repo}`, label, issues: results };
}

async function main() {
  const results = await Promise.all(
    REPOS.map(r => fetchIssues(r.owner, r.name, r.label))
  );

  const totalIssues = results.reduce((s, r) => s + r.issues.length, 0);

  // Sort by engagement (comments) and recency
  const allIssues = results.flatMap(r =>
    r.issues.map(i => ({ ...i, repo: r.repo, repoLabel: r.label }))
  ).sort((a, b) => b.comments - a.comments);

  process.stdout.write(JSON.stringify({
    fetchedAt: new Date().toISOString(),
    windowHours: HOURS_BACK,
    totalIssues,
    repos: results.map(r => ({ repo: r.repo, label: r.label, count: r.issues.length })),
    topIssues: allIssues.slice(0, 20),
  }, null, 2));
}

main().catch(e => {
  process.stderr.write(`Error: ${e.message}\n`);
  process.exit(1);
});
