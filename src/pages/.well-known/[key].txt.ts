/**
 * IndexNow key verification file.
 * Serves the key at /.well-known/a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6.txt
 */
import type { APIRoute } from 'astro';

const KEY = 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6';

export const GET: APIRoute = () => {
  return new Response(KEY, {
    status: 200,
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};

export function getStaticPaths() {
  return [{ params: { key: KEY } }];
}
