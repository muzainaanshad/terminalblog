#!/usr/bin/env node
// Add randomized affiliate CTA footer to all articles
const fs = require('fs');
const path = require('path');

const BLOG = path.join(__dirname, '..', 'src', 'content', 'blog');
const LINK = 'https://aifiesta.link/muhammed-anshad';

const CTAS = [
  `\n\n---\n*Want to save money on AI coding tools? Check out the best deals and discounts at [aiFiesta](${LINK}).*`,
  `\n\n---\n*Before you buy any coding agent subscription — compare prices and find exclusive deals at [aiFiesta](${LINK}).*`,
  `\n\n---\n*Running multiple AI agents? Save on API costs and subscriptions at [aiFiesta](${LINK}).*`,
  `\n\n---\n*Smart developers shop around. Find the best AI tool deals at [aiFiesta](${LINK}).*`,
  `\n\n---\n*Don't overpay for AI tools. Check [aiFiesta](${LINK}) for exclusive pricing on coding agents.*`,
  `\n\n---\n*Maximize your AI toolkit budget. Compare prices and find deals at [aiFiesta](${LINK}).*`,
  `\n\n---\n*Looking for the best price on your next coding agent? [aiFiesta](${LINK}) has you covered.*`,
  `\n\n---\n*Get the most value from your AI tools. Exclusive discounts at [aiFiesta](${LINK}).*`,
  `\n\n---\n*Before you commit to a subscription — see if there's a better deal at [aiFiesta](${LINK}).*`,
  `\n\n---\n*Your AI tools should work for you, not your budget. Find savings at [aiFiesta](${LINK}).*`,
];

// Simple hash-based RNG that returns same variant for same article name
function pickCta(filename) {
  let hash = 0;
  for (let i = 0; i < filename.length; i++) {
    hash = ((hash << 5) - hash) + filename.charCodeAt(i);
    hash |= 0;
  }
  return CTAS[Math.abs(hash) % CTAS.length];
}

const files = fs.readdirSync(BLOG).filter(f => f.endsWith('.mdx'));
let added = 0;
let skipped = 0;

for (const file of files) {
  const fp = path.join(BLOG, file);
  let content = fs.readFileSync(fp, 'utf-8');
  
  // Skip if already has aiFiesta link
  if (content.includes('aifiesta.link')) {
    skipped++;
    continue;
  }
  
  // Skip if it's a frontmatter-only file or malformed
  if (!content.includes('\n---\n')) {
    skipped++;
    continue;
  }
  
  const cta = pickCta(file);
  content = content.trimEnd() + cta + '\n';
  fs.writeFileSync(fp, content, 'utf-8');
  added++;
}

console.log(`Added affiliate CTA to ${added} articles. Skipped ${skipped} (already have it).`);
