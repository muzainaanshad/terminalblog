#!/usr/bin/env node
// Fetches recent discussions about coding agents from HN and Reddit
// Outputs structured JSON with quotes, context, and metadata

const HOURS_BACK = 6; // matches 3-hour cron with overlap
const SITE = "https://seo-ai-blog-nu.vercel.app";

async function searchHN() {
  const since = new Date(Date.now() - HOURS_BACK * 60 * 60 * 1000);
  const keywords = [
    '"coding agent"', '"claude code"', '"opencode"', '"cursor"', 
    '"codex"', '"devin"', '"aider"', '"cline"', '"hermes agent"',
    '"AI coding"', '"AI agent"', '"copilot"', '"windsurf"',
    '"gitlawb"', '"oh my pi"', '"kilo code"'
  ];
  
  const results = [];
  for (const kw of keywords.slice(0, 5)) {
    try {
      const url = `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(kw)}&numericFilters=created_at_i>${Math.floor(since.getTime()/1000)}&hitsPerPage=20`;
      const res = await fetch(url);
      if (!res.ok) continue;
      const data = await res.json();
      if (data.hits) {
        for (const h of data.hits) {
          results.push({
            source: 'hackernews',
            title: h.title || h.story_title || '',
            url: h.url || `https://news.ycombinator.com/item?id=${h.objectID}`,
            points: h.points || 0,
            numComments: h.num_comments || 0,
            author: h.author,
            createdAt: h.created_at,
            objectID: h.objectID,
            excerpt: (h.story_text || h.comment_text || '').slice(0, 500)
          });
        }
      }
    } catch {}
  }
  return results;
}

async function searchReddit() {
  const since = Math.floor((Date.now() - HOURS_BACK * 60 * 60 * 1000) / 1000);
  const queries = [
    'coding+agents+AI', 'Claude+Code+review', 'best+coding+agent',
    'opencode+cursor', 'Devin+AI+coding', 'AI+coding+tools+2026',
    'aider+cline+comparison', 'Cursor+vs+Claude'
  ];
  
  const results = [];
  for (const q of queries.slice(0, 4)) {
    try {
      const url = `https://www.reddit.com/search.json?q=${q}&sort=new&t=week&limit=15`;
      const res = await fetch(url, {
        headers: { 'User-Agent': 'CodingAgentsBot/1.0' }
      });
      if (!res.ok) continue;
      const data = await res.json();
      if (data.data?.children) {
        for (const child of data.data.children) {
          const d = child.data;
          results.push({
            source: 'reddit',
            title: d.title,
            url: `https://reddit.com${d.permalink}`,
            ups: d.ups,
            numComments: d.num_comments,
            author: d.author,
            subreddit: d.subreddit,
            createdAt: new Date(d.created_utc * 1000).toISOString(),
            excerpt: (d.selftext || '').slice(0, 500)
          });
        }
      }
    } catch {}
  }
  return results;
}

async function main() {
  const [hnResults, redditResults] = await Promise.all([
    searchHN(),
    searchReddit()
  ]);

  const all = [...hnResults, ...redditResults]
    .filter(d => d.title && d.title.length > 10)
    .sort((a, b) => (b.points || b.ups || 0) - (a.points || a.ups || 0));

  const output = {
    fetchedAt: new Date().toISOString(),
    discussions: all.slice(0, 25),
    totalFound: all.length,
    tips: generateTips(all)
  };

  process.stdout.write(JSON.stringify(output, null, 2));
}

function generateTips(discussions) {
  if (discussions.length === 0) {
    return [
      'No active discussions found. Write a comparison guide or a "what I learned building with X" opinion piece instead.'
    ];
  }
  const tips = [];
  const top = discussions.slice(0, 5);
  
  // Check for debate topics
  const controversial = discussions.filter(d => d.numComments > 10);
  if (controversial.length > 0) {
    tips.push(`Hot debate: "${controversial[0].title}" has ${controversial[0].numComments} comments — quote both sides and add your take.`);
  }

  // Check for comparison threads
  const comparison = discussions.filter(d => /vs|better|compare|best|which/i.test(d.title));
  if (comparison.length > 0) {
    tips.push(`Comparison thread: "${comparison[0].title}" on ${comparison[0].source} — synthesize what people are saying.`);
  }

  // Check for complaint/advocacy threads
  const complaint = discussions.filter(d => /problem|issue|sucks|broken|love|amazing|game.?changer/i.test(d.title));
  if (complaint.length > 0) {
    tips.push(`Strong sentiment: "${complaint[0].title}" — people have opinions, use them as evidence.`);
  }

  if (tips.length === 0 && top.length > 0) {
    tips.push(`Latest: "${top[0].title}" from ${top[0].source} — write an opinionated analysis.`);
  }

  return tips;
}

main().catch(e => {
  process.stderr.write(`Error: ${e.message}\n`);
  process.exit(1);
});
