import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
  loader: glob({
    base: './src/content/blog',
    // _archive holds retired thin posts (historical debt cleanup)
    pattern: '**/[^_]*.{md,mdx}',
  }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      heroImage: image().optional(),
      tags: z.array(z.string()).default([]),
      tool: z.string().optional(),
      author: z.string().default('kira'),
      /** Optional OG/path image (string URL or image()) */
      image: z.string().optional(),
      /** When true, strengthens affiliate UI (site-wide disclosure always shown) */
      hasAffiliate: z.boolean().optional(),
    }),
});

export const collections = { blog };
