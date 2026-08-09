// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import { defineConfig, fontProviders } from 'astro/config';
import astroRelatedContent from '@philnash/astro-related-content';
import seoGraph from '@jdevalk/astro-seo-graph/integration';

import tailwindcss from '@tailwindcss/vite';

/** Near-duplicate posts redirected in vercel.json — omit from sitemap. */
const SITEMAP_EXCLUDE = new Set([
  'https://terminalblog.com/admin/',
  'https://terminalblog.com/admin/affiliates/',
  'https://terminalblog.com/admin/flow/',
  'https://terminalblog.com/admin/login/',
  'https://terminalblog.com/admin/stats/',
  'https://terminalblog.com/blog/genlayer-internet-court-ai-agents-2026-07-12/',
  'https://terminalblog.com/blog/genlayer-internet-court-ai-agents-27-firms-2026-07-13/',
  'https://terminalblog.com/blog/cursor-sand-ai-office-agent-anthropic-2026-07-13/',
  'https://terminalblog.com/blog/cursor-sand-ai-office-agent-challenge-anthropic/',
  'https://terminalblog.com/blog/gpt-5-6-claude-fable-code-arena-2026-07-13/',
  'https://terminalblog.com/blog/gpt-5-6-sol-ultra-64-subagents-conjecture-r4/',
  'https://terminalblog.com/blog/kraken-agentic-trading-bots-2026-07-13/',
  'https://terminalblog.com/blog/microsoft-365-copilot-gpt-5-6-default-2026-07-13/',
  'https://terminalblog.com/blog/perplexity-orchestrator-grok-45-benchmark-2026-07-13/',
  'https://terminalblog.com/blog/perplexity-grok-45-wandr-opus-r4/',
  'https://terminalblog.com/blog/tencent-hy3-coding-model-014-tokens-2026-07-12/',
  'https://terminalblog.com/blog/terence-tao-vibe-coding-agents-applets/',
  'https://terminalblog.com/blog/claude-code-steganography-trust-betrayal/',
  'https://terminalblog.com/tool/industry/',
  'https://terminalblog.com/tool/launches/',
  'https://terminalblog.com/tool/security/',
  'https://terminalblog.com/tool/research/',
  'https://terminalblog.com/tool/Guide/',
  'https://terminalblog.com/tool/dev/',
  'https://terminalblog.com/tool/meta/',
  'https://terminalblog.com/tool/seedream/',
  'https://terminalblog.com/tool/genlayer/',
  'https://terminalblog.com/tool/openai/',
  'https://terminalblog.com/tool/tencent-hy3/',
  'https://terminalblog.com/tool/unsloth/',
]);

// https://astro.build/config
export default defineConfig({
  output: 'static',
  adapter: vercel(),
  site: 'https://terminalblog.com',
  integrations: [
    mdx(),
    sitemap({
      filter: (page) => !SITEMAP_EXCLUDE.has(page),
    }),
    astroRelatedContent({
      artifactDir: '.astro-related-content',
      collections: [{ collection: 'blog' }],
      embeddings: {
        model: 'Xenova/all-MiniLM-L6-v2',
        device: 'cpu',
        dtype: 'fp32',
        pooling: 'mean',
        batchSize: 1,
      },
    }),
    seoGraph({
      indexNow: {
        key: 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6',
        host: 'terminalblog.com',
        siteUrl: 'https://terminalblog.com',
      },
    }),
  ],

  fonts: [
      {
          provider: fontProviders.local(),
          name: 'Atkinson',
          cssVariable: '--font-atkinson',
          fallbacks: ['sans-serif'],
          options: {
              variants: [
                  {
                      src: ['./src/assets/fonts/atkinson-regular.woff'],
                      weight: 400,
                      style: 'normal',
                      display: 'swap',
                  },
                  {
                      src: ['./src/assets/fonts/atkinson-bold.woff'],
                      weight: 700,
                      style: 'normal',
                      display: 'swap',
                  },
              ],
          },
      },
	],

  vite: {
    plugins: [tailwindcss()],
  },
});