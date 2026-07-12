#!/usr/bin/env node
// Research recent discussions (last 72h) on HN + Reddit about coding agents.
// Used to find genuine backlink opportunities for terminalblog.com.

const QUERIES = [
  'Claude Code', 'Cursor AI', 'OpenAI Codex', 'Hermes Agent',
  'OpenCode', 'coding agent', 'AI coding', 'Copilot CLI',
  'coding agents', 'Claude Code bug', 'Claude Code security', 'free coding agent',
];

async function searchHN(query) {
  const since = Math.floor((Date.now() - 72 * 60 * 60 * 1000) / 1000);
  const url = `https://hn.algolia.com/api/v1/search_by_date?query=${encodeURIComponent(query)}&tags=story&numericFilters=created_at_i>${since}&hitsPerPage=8`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    return (data.hits || []).map(h => ({
      source: 'hn',
      title: h.title,
      url: h.url || `https://news.ycombinator.com/item?id=${h.objectID}`,
      points: h.points,
      comments: h.num_comments,
      time: h.created_at,
    }));
  } catch { return []; }
}

async function searchReddit(query) {
  const url = `https://www.reddit.com/search.json?q=${encodeURIComponent(query)}&sort=new&t=week&limit=8`;
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'terminalblog-research/1.0' } });
    const data = await res.json();
    return (data.data?.children || []).map(c => ({
      source: 'reddit',
      title: c.data.title,
      url: `https://reddit.com${c.data.permalink}`,
      subreddit: c.data.subreddit,
      score: c.data.score,
      comments: c.data.num_comments,
      time: new Date(c.data.created_utc * 1000).toISOString(),
    }));
  } catch { return []; }
}

(async () => {
  const all = [];
  for (const q of QUERIES) {
    const [hn, reddit] = await Promise.all([searchHN(q), searchReddit(q)]);
    all.push(...hn, ...reddit);
  }
  const seen = new Set();
  const unique = all.filter(r => {
    if (seen.has(r.url)) return false;
    seen.add(r.url);
    return true;
  });
  const sorted = unique.sort((a, b) => new Date(b.time) - new Date(a.time));
  console.log(JSON.stringify({ window: '72h', total: sorted.length, results: sorted }, null, 2));
})();
