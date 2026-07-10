#!/usr/bin/env node
// Searches YouTube for recent coding agent content (last 3h)
// Uses YouTube's public search (no API key needed)

const QUERIES = [
  'Claude Code', 'Cursor AI coding', 'OpenAI Codex CLI',
  'coding agent', 'AI coding tool', 'Hermes agent',
  'Goose coding agent', 'AmpCode', 'Copilot CLI',
];

async function searchYouTube(query) {
  // Use YouTube's public search page and extract data
  const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}&sp=EgIIAQ%3D%3D`; // Today filter
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: AbortSignal.timeout(10000),
    });
    const html = await res.text();

    // Extract video data from ytInitialData
    const dataMatch = html.match(/var ytInitialData = ({.*?});<\/script>/s);
    if (!dataMatch) return [];

    const data = JSON.parse(dataMatch[1]);
    const contents = data?.contents?.twoColumnSearchResultsRenderer?.primaryContents
      ?.sectionListRenderer?.contents?.[0]?.itemSectionRenderer?.contents || [];

    return contents
      .filter(c => c.videoRenderer)
      .slice(0, 3)
      .map(c => ({
        title: c.videoRenderer.title?.runs?.[0]?.text || '',
        url: `https://youtube.com/watch?v=${c.videoRenderer.videoId}`,
        channel: c.videoRenderer.ownerText?.runs?.[0]?.text || '',
        views: c.videoRenderer.viewCountText?.simpleText || '',
        published: c.videoRenderer.publishedTimeText?.simpleText || '',
      }));
  } catch {
    return [];
  }
}

// Search in parallel but limit concurrency
const allResults = [];
for (const q of QUERIES) {
  const results = await searchYouTube(q);
  allResults.push(...results.map(r => ({ ...r, query: q })));
  // Small delay to avoid rate limiting
  await new Promise(r => setTimeout(r, 200));
}

// Deduplicate by URL
const seen = new Set();
const unique = allResults.filter(r => {
  if (seen.has(r.url)) return false;
  seen.add(r.url);
  return true;
});

console.log(JSON.stringify({
  window: '24h (YouTube has no 3h filter)',
  totalResults: unique.length,
  queries: QUERIES.length,
  results: unique,
}, null, 2));
