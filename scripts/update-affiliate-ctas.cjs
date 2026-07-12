#!/usr/bin/env node
// Replace ALL affiliate CTAs with new value-driven hooks from aiFiesta launch video
const fs = require('fs');
const path = require('path');

const BLOG = path.join(__dirname, '..', 'src', 'content', 'blog');
const LINK = 'https://aifiesta.link/muhammed-anshad';

const OLD_CTAS = [
  '*Want to save money on AI coding tools? Check out the best deals and discounts at [aiFiesta]',
  '*Before you buy any coding agent subscription — compare prices and find exclusive deals at [aiFiesta]',
  '*Running multiple AI agents? Save on API costs and subscriptions at [aiFiesta]',
  '*Smart developers shop around. Find the best AI tool deals at [aiFiesta]',
  "*Don't overpay for AI tools. Check [aiFiesta]",
  '*Maximize your AI toolkit budget. Compare prices and find deals at [aiFiesta]',
  '*Looking for the best price on your next coding agent? [aiFiesta]',
  '*Get the most value from your AI tools. Exclusive discounts at [aiFiesta]',
  '*Before you commit to a subscription — see if there is a better deal at [aiFiesta]',
  '*Your AI tools should work for you, not your budget. Find savings at [aiFiesta]',
];

const NEW_CTAS = [
  `---\n*Tired of juggling five different AI subscriptions? Get the power of every top-tier AI model in one place with **[aiFiesta](${LINK})** for less than the cost of a single individual sub.*`,
  `---\n*Struggling to write effective prompts? **[aiFiesta](${LINK})** has a built-in Improve Prompt feature that optimizes your queries for the best possible results.*`,
  `---\n*Why pay $9,600+ monthly for different AI tools? Access the world's most powerful models in one dashboard via **[aiFiesta](${LINK})** for under $1,000.*`,
  `---\n*Level up your AI game! Join **[aiFiesta](${LINK})** today and get an exclusive 3,000+ prompt library (worth $5,000) for free.*`,
  `---\n*Not sure which AI is best for your task? Compare answers side-by-side using **[aiFiesta](${LINK})** multi-model chat feature and see the difference.*`,
  `---\n*Maximize your AI toolkit budget without sacrificing quality — **[aiFiesta](${LINK})** gives you every major model in one dashboard.*`,
  `---\n*Stop overpaying for subscriptions you barely use. **[aiFiesta](${LINK})** gives you access to Claude, GPT, Gemini, and more at a fraction of the cost.*`,
  `---\n*The smartest developers don't pick one AI — they use them all. Get every leading model under one roof at **[aiFiesta](${LINK})**.*`,
  `---\n*Built-in prompt engineering tools, multi-model chat, and a 3,000+ prompt library. **[aiFiesta](${LINK})** is the power user's AI dashboard.*`,
  `---\n*Why limit yourself to one model? **[aiFiesta](${LINK})** lets you compare, combine, and pick the best AI for every task — all in one place.*`,
];

function pickCta(filename) {
  let hash = 0;
  for (let i = 0; i < filename.length; i++) {
    hash = ((hash << 5) - hash) + filename.charCodeAt(i);
    hash |= 0;
  }
  return NEW_CTAS[Math.abs(hash) % NEW_CTAS.length];
}

const files = fs.readdirSync(BLOG).filter(f => f.endsWith('.mdx'));
let replaced = 0;

for (const file of files) {
  const fp = path.join(BLOG, file);
  let content = fs.readFileSync(fp, 'utf-8');
  
  // Check if has old CTA
  const hasOld = OLD_CTAS.some(c => content.includes(c));
  const hasNew = content.includes('[aiFiesta](' + LINK);
  
  if (!hasNew && !hasOld) {
    // No affiliate link at all — add one
    const cta = pickCta(file);
    content = content.trimEnd() + '\n\n' + cta + '\n';
    fs.writeFileSync(fp, content, 'utf-8');
    replaced++;
    continue;
  }
  
  if (hasOld) {
    // Replace old CTA with new one
    const cta = pickCta(file);
    for (const old of OLD_CTAS) {
      const idx = content.indexOf(old);
      if (idx !== -1) {
        // Find end of the old CTA (end of line after the closing *)
        const endIdx = content.indexOf(')', idx + 10);
        const lineEnd = content.indexOf('\n', endIdx);
        const oldCtaBlock = content.substring(content.lastIndexOf('\n', idx), lineEnd !== -1 ? lineEnd + 1 : content.length);
        content = content.replace(oldCtaBlock, '\n' + cta);
        break;
      }
    }
    fs.writeFileSync(fp, content, 'utf-8');
    replaced++;
  }
}

console.log(`Updated/replaced affiliate CTAs on ${replaced} articles.`);
