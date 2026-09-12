#!/usr/bin/env node
// Rebuild .astro-related-content artifacts (vectors.json + data.json) the same way
// `astro build` does: generateRelatedContent() with the project's options, reusing the
// existing vector cache so only changed articles are re-embedded.
// Usage: node scripts/rebuild-related-content.mjs
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const codegenDir = path.join(root, '.astro', 'integrations', 'astro-related-content');

// The integration's astro:config:setup hook resolves options + runs the generator.
// We call the internals directly for a standalone rebuild.
const { generateRelatedContent } = await import(
  new URL('file:///' + path.join(root, 'node_modules', '@philnash', 'astro-related-content', 'src', 'generator.ts').replace(/\\/g, '/'))
);
const { resolveIntegrationOptions } = await import(
  new URL('file:///' + path.join(root, 'node_modules', '@philnash', 'astro-related-content', 'src', 'options.ts').replace(/\\/g, '/'))
);

await mkdir(codegenDir, { recursive: true });
const options = resolveIntegrationOptions(
  {
    artifactDir: '.astro-related-content',
    collections: [{ collection: 'blog' }],
    embeddings: {
      model: 'Xenova/all-MiniLM-L6-v2',
      device: 'cpu',
      dtype: 'fp32',
      pooling: 'mean',
      batchSize: 1,
    },
  },
  {
    codegenDirUrl: new URL(
      'file://' + codegenDir.replace(/\\/g, '/') + '/',
    ),
    root: new URL('file://' + root.replace(/\\/g, '/') + '/'),
  },
);

const result = await generateRelatedContent(options, {
  logger(m) {
    console.log('[related-content]', m);
  },
});
console.log('DONE:', JSON.stringify(result));