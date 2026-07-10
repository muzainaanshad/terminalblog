// JSON API for terminalblog CLI — agent comparison
// Endpoint: /api/compare

import type { APIRoute } from 'astro';
import agents from '../../data/agents.json';

export const GET: APIRoute = async () => {
  const data = agents.map(a => ({
    name: a.name,
    type: a.type,
    pricing: a.pricing,
    sweBench: a.sweBench,
    openSource: a.openSource,
    bestFor: a.bestFor,
  }));

  return new Response(JSON.stringify(data), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=900',
      'Access-Control-Allow-Origin': '*',
    },
  });
};
