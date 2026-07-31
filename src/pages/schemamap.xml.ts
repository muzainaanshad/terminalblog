/**
 * Schema map: sitemap-style XML listing schema endpoints for agent crawlers.
 */
import { createSchemaMap } from '@jdevalk/astro-seo-graph';

export const GET = createSchemaMap({
  siteUrl: 'https://terminalblog.com',
  entries: [
    { path: '/schema/post.json', lastModified: new Date() },
  ],
});
