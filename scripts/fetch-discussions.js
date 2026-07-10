#!/usr/bin/env node
// Fetches recent discussions from HN and Reddit about coding agents (last 3h)

const QUERIES = [
  'Claude Code', 'Cursor AI', 'OpenAI Codex', 'Hermes Agent',
  'OpenCode', 'Kilo Code', 'Goose AI', 'coding agent',
  'AI coding', 'AmpCode', 'Copilot CLI',
];

async function searchHN(query) {
  const url = `https://hn.algolia.com/api/v1/search_by_date?query=${encodeURIComponent(query)}&tags=story&numericFilters=created_at_i>${Math.floor((Date.now() - 3*60*60*1000)/1000)}&hitsPerPage=5`;
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
  const url = `https://www.reddit.com/search.json?q=${encodeURIComponent(query)}&sort=new&t=hour&limit=5`;
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'terminalblog/1.0' } });
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

const allResults = [];
for (const q of QUERIES) {
  const [hn, reddit] = await Promise.all([searchHN(q), searchReddit(q)]);
  allResults.push(...hn, ...reddit);
}

// Deduplicate by URL
const seen = new Set();
const unique = allResults.filter(r => {
  if (seen.has(r.url)) return false;
  seen.add(r.url);
  return true;
});

console.log(JSON.stringify({
  window: '3h',
  totalResults: unique.length,
  hn: unique.filter(r => r.source === 'hn').length,
  reddit: unique.filter(r => r.source === 'reddit').length,
  results: unique.slice(0, 30),
}, null, 2));
