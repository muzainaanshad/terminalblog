// JSON API for the terminalblog CLI
// Endpoint: /api/latest — returns latest articles as JSON

import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async () => {
  const posts = (await getCollection('blog'))
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf())
    .slice(0, 10)
    .map(p => ({
      title: p.data.title,
      url: `https://terminalblog.com/blog/${p.id}/`,
      date: p.data.pubDate.toISOString().slice(0, 10),
      tags: p.data.tags || [],
    }));

  return new Response(JSON.stringify({
    site: 'terminalblog',
    updated: new Date().toISOString(),
    total: posts.length,
    articles: posts,
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=900',
      'Access-Control-Allow-Origin': '*',
    },
  });
};
