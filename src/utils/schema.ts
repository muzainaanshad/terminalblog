/**
 * Schema graph builder for terminalblog.
 * Uses @jdevalk/seo-graph-core to produce linked JSON-LD entities.
 */
import { buildWebSite, buildWebPage, buildBreadcrumbList, buildArticle, makeIds } from '@jdevalk/seo-graph-core';

export const SITE_URL = 'https://terminalblog.com';
export const SITE_NAME = 'terminalblog';
export const EDITOR_NAME = 'Anshad';
export const EDITOR_URL = 'https://github.com/Anshad2u';

export const ids = makeIds({ siteUrl: SITE_URL });

/** Person entity (not provided by seo-graph-core). */
function buildPersonEntity() {
  return {
    '@type': 'Person',
    '@id': ids.person,
    name: EDITOR_NAME,
    url: EDITOR_URL,
  };
}

/** Build the site-wide JSON-LD graph for non-article pages. */
export function buildHomeGraph() {
  const website = buildWebSite(
    {
      url: SITE_URL,
      name: SITE_NAME,
      description: 'Honest coding agent ecosystem coverage',
      publisher: { '@id': ids.person },
    },
    ids,
  );

  return {
    '@context': 'https://schema.org',
    '@graph': [website, buildPersonEntity()],
  };
}

/** Default OG image for articles without a custom image. */
const DEFAULT_ARTICLE_IMAGE = `${SITE_URL}/api/og`;

/** Build FAQPage JSON-LD from array of {q, a} pairs. */
export function buildFaqSchema(faq: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  };
}

/** Build JSON-LD graph for a blog post. */
export function buildPostGraph(opts: {
  url: string;
  title: string;
  description: string;
  publishDate: Date;
  updateDate?: Date;
  tags?: string[];
  image?: string;
  faq?: { q: string; a: string }[];
}) {
  const { url, title, description, publishDate, updateDate, tags, image, faq } = opts;

  const articleImage = image || `${DEFAULT_ARTICLE_IMAGE}?title=${encodeURIComponent(title)}`;

  const article = buildArticle(
    {
      url,
      isPartOf: { '@id': ids.webPage(url) },
      author: { '@id': ids.person },
      publisher: { '@id': ids.person },
      headline: title,
      description,
      datePublished: publishDate,
      dateModified: updateDate || publishDate,
      keywords: tags?.join(', '),
      image: articleImage,
    },
    ids,
    'BlogPosting',
  );

  const webPage = buildWebPage(
    {
      url,
      name: title,
      isPartOf: { '@id': ids.website },
      breadcrumb: { '@id': ids.breadcrumb(url) },
      datePublished: publishDate,
    },
    ids,
  );

  const breadcrumb = buildBreadcrumbList(
      {
        url,
        items: [
          { name: 'Home', url: SITE_URL },
          { name: 'Articles', url: `${SITE_URL}/blog/` },
          { name: title, url },
        ],
      },
      ids,
    );

    const graph: any = {
      '@context': 'https://schema.org',
      '@graph': [webPage, article, breadcrumb, buildPersonEntity()],
    };

    // Add FAQ schema if provided
    if (faq && faq.length > 0) {
      graph['@graph'].push(buildFaqSchema(faq));
    }

    return graph;
}
