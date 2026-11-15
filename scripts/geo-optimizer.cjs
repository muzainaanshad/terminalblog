#!/usr/bin/env node
/**
 * GEO Optimizer — Analyze terminalblog content for AI search engines (ChatGPT, Perplexity, Claude, etc.)
 * 
 * This version only ANALYZES - does NOT modify files.
 * The site already serves structured data via @jdevalk/astro-seo-graph schema endpoint.
 */

const fs = require('fs');
const path = require('path');

const BLOG = path.join(__dirname, '..', 'src', 'content', 'blog');
const ANALYZE_ONLY = process.argv.includes('--analyze-only');

const PILLAR_TAGS = ['pillar', 'guide', 'checklist', 'comparison', 'pricing', 'security', 'beware', 'decision', 'complete-guide', 'features-comparison', 'evergreen'];
const MIN_WORDS_PILLAR = 1000;
const MIN_WORDS_ANY = 600;

function parse(file) {
  const raw = fs.readFileSync(file, 'utf8');
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return null;
  const fm = {};
  for (const line of m[1].split(/\r?\n/)) {
    const mm = line.match(/^(\w+):\s*(.*)$/);
    if (!mm) continue;
    let v = mm[2].trim().replace(/^["']|["']$/g, '');
    fm[mm[1]] = v;
  }
  const body = raw.slice(m[0].length);
  const words = body.split(/\s+/).filter(Boolean).length;
  const slug = path.basename(file, '.mdx');
  const updated = fm.updatedDate || fm.pubDate;
  const ts = updated ? new Date(updated).getTime() : 0;
  const ageDays = ts ? Math.floor((Date.now() - ts) / 864e5) : 999;
  const tags = String(fm.tags || '').split(',').map(t => t.trim().replace(/[\[\]\"']/g, ''));
  const evergreen = PILLAR_TAGS.some(t => tags.includes(t)) || PILLAR_TAGS.some(t => slug.includes(t)) || PILLAR_TAGS.some(t => (fm.title || '').toLowerCase().includes(t));
  
  // Check for FAQ section
  const hasFaqSection = /^## FAQ\s*$/m.test(body) || /^## FAQ\s*$/im.test(body);
  
  // Check for FAQPage JSON-LD (the schema endpoint handles this)
  const hasFaqSchema = /FAQPage|application\/ld\+json/i.test(body) || /buildFaqSchema/i.test(body);
  
  // Check for clear definition at start
  const bodyAfterScripts = body.replace(/<script[^>]*>[\s\S]*?<\/script>\s*/g, '').replace(/<script[^>]*set:html=\{JSON\.stringify\([\s\S]*?\)\}\s*\/\>\s*/g, '');
  const firstSection = bodyAfterScripts.slice(0, 2000);
  const hasDefinition = /^(\*{0,2})(What is|What are|A (coding agent|agent) is|An (agent|agent) is|is a|refers to|means)/im.test(firstSection.trim());

  // Check for canonical URL in frontmatter
  const hasCanonical = !!fm.canonical;
  
  // Check for image
  const hasImage = !!fm.image && !fm.image.includes('api/og?title=Article');
  
  // Check for meta description
  const hasDescription = !!fm.description && fm.description.length >= 120 && fm.description.length <= 160;
  
  // Check for structured data (Article, BlogPosting) - the schema endpoint handles this
  const hasArticleSchema = /@type.*BlogPosting|@type.*Article|buildPostGraph/i.test(raw);

  return {
    file,
    raw,
    body,
    fm,
    slug,
    title: fm.title || slug,
    words,
    ageDays,
    updated: updated || 'unknown',
    evergreen,
    isJustShipped: /just-shipped/.test(slug),
    tags,
    hasFaqSection,
    hasFaqSchema,
    hasDefinition,
    hasCanonical,
    hasImage,
    hasDescription,
    hasArticleSchema,
    firstSection,
  };
}

function extractFaq(body) {
  const normalizedBody = body.replace(/\r\n/g, '\n');
  
  let faqMatch = normalizedBody.match(/(?:^|\n)## FAQ\s*\n([\s\S]*?)(?:\n## |\n---|$)/);
  if (!faqMatch) {
    faqMatch = normalizedBody.match(/(?:^|\n)### FAQ\s*\n([\s\S]*?)(?:\n### |\n## |\n---|$)/);
  }
  if (!faqMatch) return [];

  const faqContent = faqMatch[1];
  const faqs = [];

  // Pattern 1: **Q1: Question?** ...
  const pattern1 = /\*\*Q\d*:\s*([^*]+?)\*\*\s*\n\s*\n?([\s\S]*?)(?=\n\s*\*\*Q\d*:|$)/gi;
  let match;
  while ((match = pattern1.exec(faqContent)) !== null) {
    const q = match[1].trim().replace(/^["']|["']$/g, '');
    const a = match[2].trim().replace(/^["']|["']$/g, '');
    if (q && a && q.length > 3) faqs.push({ q, a });
  }

  // Pattern 2: **Question?** ...
  if (faqs.length === 0) {
    const pattern2 = /\*\*([^*?]+(?:\?|:))\*\*\s*\n\s*\n?([\s\S]*?)(?=\n\*\*[^*?]+(?:\?|:)\*\*|$)/gi;
    while ((match = pattern2.exec(faqContent)) !== null) {
      const q = match[1].trim().replace(/^["']|["']$/g, '');
      const a = match[2].trim().replace(/^["']|["']$/g, '');
      if (q && a && q.length > 3) faqs.push({ q, a });
    }
  }

  return faqs;
}

function analyze() {
  const posts = fs
    .readdirSync(BLOG)
    .filter(f => f.endsWith('.mdx'))
    .map(f => parse(path.join(BLOG, f)))
    .filter(Boolean);
  
  const pillarPosts = posts.filter(p => p.evergreen);
  const allPosts = posts;
  
  console.log('='.repeat(80));
  console.log('GEO OPTIMIZER ANALYSIS — terminalblog.com');
  console.log('='.repeat(80));
  console.log(`Total posts: ${allPosts.length}`);
  console.log(`Pillar/evergreen posts: ${pillarPosts.length}`);
  console.log('');
  
  // Analyze pillar posts for GEO readiness
  console.log('--- PILLAR POSTS GEO READINESS ---');
  for (const p of pillarPosts) {
    const faqs = extractFaq(p.body);
    const issues = [];
    
    if (!p.hasFaqSection) issues.push('Missing FAQ section');
    else if (faqs.length === 0) issues.push('FAQ section exists but no parseable Q&A pairs');
    else if (!p.hasFaqSchema) issues.push('Has FAQ but missing FAQPage JSON-LD schema (handled by schema endpoint)');
    
    if (!p.hasDefinition) issues.push('No clear definition in first section');
    if (!p.hasDescription) issues.push('Meta description missing or wrong length (need 120-160 chars)');
    if (!p.hasImage) issues.push('Missing custom hero image (using generic OG)');
    if (!p.hasArticleSchema) issues.push('Missing Article/BlogPosting schema (handled by schema endpoint)');
    if (p.words < MIN_WORDS_PILLAR) issues.push(`Thin pillar (${p.words}w < ${MIN_WORDS_PILLAR}w)`);
    
    const status = issues.length === 0 ? '✅ READY' : `⚠️ ${issues.length} issue(s)`;
    console.log(`\n${status} | ${p.slug}`);
    console.log(`  Title: ${p.title}`);
    console.log(`  Words: ${p.words} | Age: ${p.ageDays}d | Tags: ${p.tags.join(', ')}`);
    console.log(`  FAQ: ${p.hasFaqSection ? 'Yes' : 'No'} | FAQ Schema: ${p.hasFaqSchema ? 'Yes' : 'No'} | FAQs found: ${faqs.length}`);
    console.log(`  Definition: ${p.hasDefinition ? 'Yes' : 'No'} | Description: ${p.hasDescription ? 'OK' : 'Fix'} | Image: ${p.hasImage ? 'Custom' : 'Generic'} | Schema: ${p.hasArticleSchema ? 'Yes' : 'No'} | Canonical: ${p.hasCanonical ? 'Yes' : 'No'}`);
    if (issues.length) {
      issues.forEach(i => console.log(`  - ${i}`));
    }
  }
  
  // Summary stats
  const withFaq = pillarPosts.filter(p => p.hasFaqSection).length;
  const withFaqSchema = pillarPosts.filter(p => p.hasFaqSchema).length;
  const withDefinition = pillarPosts.filter(p => p.hasDefinition).length;
  const withDescription = pillarPosts.filter(p => p.hasDescription).length;
  const withImage = pillarPosts.filter(p => p.hasImage).length;
  const withSchema = pillarPosts.filter(p => p.hasArticleSchema).length;
  const thinPillars = pillarPosts.filter(p => p.words < MIN_WORDS_PILLAR).length;
  const withCanonical = pillarPosts.filter(p => p.hasCanonical).length;
  
  console.log('\n' + '='.repeat(80));
  console.log('SUMMARY');
  console.log('='.repeat(80));
  console.log(`Pillar posts with FAQ section: ${withFaq}/${pillarPosts.length}`);
  console.log(`Pillar posts with FAQ schema: ${withFaqSchema}/${pillarPosts.length} (schema endpoint handles this)`);
  console.log(`Pillar posts with clear definition: ${withDefinition}/${pillarPosts.length}`);
  console.log(`Pillar posts with good meta description: ${withDescription}/${pillarPosts.length}`);
  console.log(`Pillar posts with custom image: ${withImage}/${pillarPosts.length}`);
  console.log(`Pillar posts with Article schema: ${withSchema}/${pillarPosts.length} (schema endpoint handles this)`);
  console.log(`Pillar posts with canonical URL: ${withCanonical}/${pillarPosts.length}`);
  console.log(`Thin pillars (<${MIN_WORDS_PILLAR}w): ${thinPillars}/${pillarPosts.length}`);
  
  // AI Search visibility check (simulated based on content quality)
  console.log('\n' + '='.repeat(80));
  console.log('AI SEARCH VISIBILITY ESTIMATE (based on content structure)');
  console.log('='.repeat(80));
  
  const topPillars = pillarPosts
    .filter(p => p.words >= MIN_WORDS_PILLAR)
    .sort((a, b) => b.words - a.words)
    .slice(0, 10);
  
  console.log('\nTop 10 pillars by word count (best candidates for AI citations):');
  topPillars.forEach((p, i) => {
    const score = (p.hasFaqSection ? 25 : 0) + (p.hasFaqSchema ? 25 : 0) + (p.hasDefinition ? 15 : 0) + 
                  (p.hasDescription ? 15 : 0) + (p.hasImage ? 10 : 0) + (p.hasArticleSchema ? 10 : 0);
    const rating = score >= 80 ? 'HIGH' : score >= 60 ? 'MEDIUM' : 'LOW';
    console.log(`  ${i+1}. ${p.slug} — ${p.words}w — ${rating} (${score}/100)`);
    console.log(`     ${p.title}`);
  });
  
  return { posts: allPosts, pillarPosts, topPillars };
}

function main() {
  console.log(ANALYZE_ONLY ? '[ANALYZE ONLY MODE]\n' : '');
  
  const { posts, pillarPosts } = analyze();
  
  console.log('\nDone.');
}

main();