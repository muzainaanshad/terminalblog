/**
 * Schema endpoint: serves a corpus-wide JSON-LD @graph for all blog posts.
 * AI agents (ChatGPT, Claude, Perplexity) use this to understand the site.
 */
import { getCollection } from 'astro:content';
import { createSchemaEndpoint } from '@jdevalk/astro-seo-graph';
import { buildWebPage, buildArticle, makeIds } from '@jdevalk/seo-graph-core';

const ids = makeIds({ siteUrl: 'https://terminalblog.com' });

export const GET = createSchemaEndpoint({
  entries: () => getCollection('blog'),
  mapper: (post) => {
    const url = `https://terminalblog.com/blog/${post.id}/`;
    return [
      buildWebPage(
        {
          url,
          name: post.data.title,
          isPartOf: { '@id': ids.website },
          breadcrumb: { '@id': ids.breadcrumb(url) },
          datePublished: post.data.pubDate,
        },
        ids,
      ),
      buildArticle(
        {
          url,
          isPartOf: { '@id': ids.webPage(url) },
          author: { '@id': ids.person },
          publisher: { '@id': ids.person },
          headline: post.data.title,
          description: post.data.description ?? '',
          datePublished: post.data.pubDate,
          dateModified: post.data.updatedDate,
        },
        ids,
        'BlogPosting',
      ),
    ];
  },
});
