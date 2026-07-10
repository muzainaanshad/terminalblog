#!/usr/bin/env node
// Fetches recent blog posts from official coding agent blogs (last 3h)
// Checks RSS feeds and official blog pages

const BLOGS = [
  { name: 'Anthropic', feed: 'https://www.anthropic.com/rss.xml', agent: 'claude-code' },
  { name: 'OpenAI Blog', feed: 'https://openai.com/blog/rss.xml', agent: 'codex' },
  { name: 'Sourcegraph', feed: 'https://sourcegraph.com/blog/rss.xml', agent: 'ampcode' },
  { name: 'GitHub Blog', feed: 'https://github.blog/feed/', agent: 'copilot-cli' },
  { name: 'Cursor Blog', feed: 'https://www.cursor.com/blog/rss.xml', agent: 'cursor' },
];

const THREE_HOURS_AGO = Date.now() - 3 * 60 * 60 * 1000;

async function fetchFeed(blog) {
  try {
    const res = await fetch(blog.feed, {
      headers: { 'User-Agent': 'terminalblog/1.0' },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return { blog: blog.name, error: res.status };
    const xml = await res.text();

    // Simple XML parsing for RSS/Atom
    const items = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    const atomRegex = /<entry>([\s\S]*?)<\/entry>/g;
    const regex = xml.includes('<item>') ? itemRegex : atomRegex;

    let match;
    while ((match = regex.exec(xml)) !== null) {
      const block = match[1];
      const title = block.match(/<title[^>]*>([^<]+)<\/title>/)?.[1] || '';
      const link = block.match(/<link[^>]*>([^<]+)<\/link>/)?.[1] ||
                   block.match(/<link[^>]*href="([^"]+)"/)?.[1] || '';
      const pubDate = block.match(/<pubDate[^>]*>([^<]+)<\/pubDate>/)?.[1] ||
                      block.match(/<updated[^>]*>([^<]+)<\/updated>/)?.[1] || '';
      const desc = block.match(/<description[^>]*>([\s\S]*?)<\/description>/)?.[1] ||
                   block.match(/<summary[^>]*>([\s\S]*?)<\/summary>/)?.[1] || '';

      const publishTime = new Date(pubDate).getTime();
      if (publishTime > THREE_HOURS_AGO) {
        items.push({
          title: title.replace(/<!\[CDATA\[|\]\]>/g, '').trim(),
          url: link.trim(),
          published: pubDate,
          description: desc.replace(/<!\[CDATA\[|\]\]>/g, '').replace(/<[^>]+>/g, '').trim().slice(0, 200),
        });
      }
    }

    return { blog: blog.name, agent: blog.agent, newPosts: items.length, items };
  } catch (e) {
    return { blog: blog.name, error: e.message?.slice(0, 100) };
  }
}

const results = await Promise.all(BLOGS.map(fetchFeed));
const withPosts = results.filter(r => r.newPosts > 0);
const total = withPosts.reduce((s, r) => s + r.newPosts, 0);

console.log(JSON.stringify({
  window: '3h',
  totalNewPosts: total,
  blogsChecked: BLOGS.length,
  blogsWithUpdates: withPosts.length,
  results: withPosts,
}, null, 2));
