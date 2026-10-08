#!/usr/bin/env node
/**
 * GEO Optimizer — Optimize terminalblog content for AI search engines (ChatGPT, Perplexity, Claude, etc.)
 * 
 * What this does:
 * 1. Analyzes top-ranking/pillar posts for GEO readiness
 * 2. Ensures FAQ sections have FAQPage JSON-LD schema
 * 3. Adds clear definitions at article starts
 * 4. Verifies canonical URLs and structured data
 * 5. Optimizes meta descriptions for AI citations
 * 6. Reports findings and applies improvements
 * 
 * Usage:
 *   node scripts/geo-optimizer.cjs --dry          # Dry run only
 *   node scripts/geo-optimizer.cjs                # Apply changes
 *   node scripts/geo-optimizer.cjs --analyze-only # Just analyze, no changes
 */

const fs = require('fs');
const path = require('path');

const BLOG = path.join(__dirname, '..', 'src', 'content', 'blog');
const DRY = process.argv.includes('--dry');
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
  const tags = String(fm.tags || '').split(',').map(t => t.trim().replace(/[\[\]"']/g, ''));
  const evergreen = PILLAR_TAGS.some(t => tags.includes(t)) || PILLAR_TAGS.some(t => slug.includes(t)) || PILLAR_TAGS.some(t => (fm.title || '').toLowerCase().includes(t));
  
  // Check for FAQ section
  const hasFaqSection = /^## FAQ\s*$/m.test(body) || /^## FAQ\s*$/im.test(body);
  
  // Check for FAQPage JSON-LD
  const hasFaqSchema = /FAQPage|application\/ld\+json/i.test(body) || /buildFaqSchema/i.test(body);
  
  // Check for clear definition at start (first 500 chars)
  const firstSection = body.slice(0, 500);
  const hasDefinition = /^(What is|What are|A (coding agent|agent) is|An (agent|agent) is|is a|refers to|means)/im.test(firstSection);
  
  // Check for canonical URL in frontmatter
  const hasCanonical = !!fm.canonical;
  
  // Check for image
  const hasImage = !!fm.image && !fm.image.includes('api/og?title=Article');
  
  // Check for meta description
  const hasDescription = !!fm.description && fm.description.length >= 120 && fm.description.length <= 160;
  
  // Check for structured data (Article, BlogPosting)
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
  const faqMatch = body.match(/^## FAQ\s*\n([\s\S]*?)(?:\n## |\n---|\n$)/m);
  if (!faqMatch) return [];
  
  const faqContent = faqMatch[1];
  const faqs = [];
  
  // Pattern 1: **Q1: What is...?** ... (answer on following lines until next Q or end)
    const pattern1 = /\*\*Q\d*:\s*([^*]+?)\*\*\s*\n([\s\S]*?)(?=\n\s*\*\*Q\d*:|$)/gi;
    let match;
    while ((match = pattern1.exec(faqContent)) !== null) {
      const q = match[1].trim().replace(/^["']|["']$/g, '');
      const a = match[2].trim().replace(/^["']|["']$/g, '');
      if (q && a) faqs.push({ q, a });
    }
  
  // Pattern 2: **Q:** ... (answer on following lines until next Q or end)
  if (faqs.length === 0) {
    const pattern2 = /\*\*Q:\*\*\s*(.*?)\n([\s\S]*?)(?=\n\s*\*\*Q:|$)/gi;
    while ((match = pattern2.exec(faqContent)) !== null) {
      const q = match[1].trim();
      const a = match[2].trim();
      if (q && a) faqs.push({ q, a });
    }
  }
  
  // Pattern 3: **What is...** or **Is there...** ... (bolded question followed by answer)
    if (faqs.length === 0) {
      const pattern3 = /\*\*(What is|What are|Is there|Are free|Which|How much|Are coding|What is the|How do|Can I|Should I|Why|What's|What is the catch).*?\*\*\s*\n([\s\S]*?)(?=\n\s*\*\*(What is|What are|Is there|Are free|Which|How much|Are coding|What is the|How do|Can I|Should I|Why|What's|What is the catch).*?\*\*|$)/gi;
      while ((match = pattern3.exec(faqContent)) !== null) {
        // match[0] is the full match, we need to extract the full question from it
        const fullMatch = match[0];
        const qMatch = fullMatch.match(/\*\*(.*?)\*\*/);
        const q = qMatch ? qMatch[1].trim() : match[1].trim();
        const a = match[2].trim();
        if (q && a) faqs.push({ q, a });
      }
    }
  
  // Pattern 4: Q: ... A: ... (plain text, with or without numbers, with or without bold)
  if (faqs.length === 0) {
    const pattern4 = /(?:^|\n)(?:\*\*)?(?:Q|Question)\s*\d*[:：]\s*(.*?)(?:\n|\r)(?:\*\*)?(?:A|Answer)\s*\d*[:：]\s*(.*?)(?=\n(?:Q|Question)\s*\d*[:：]|\n\*\*(?:Q|Question)|$)/gi;
    while ((match = pattern4.exec(faqContent)) !== null) {
      const q = match[1].trim().replace(/^["']|["']$/g, '');
      const a = match[2].trim().replace(/^["']|["']$/g, '');
      if (q && a) faqs.push({ q, a });
    }
  }
  
  return faqs;
}

function buildFaqSchema(faqs) {
  if (!faqs.length) return '';
  const entities = faqs.map(({ q, a }) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: { '@type': 'Answer', text: a }
  }));
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: entities
  };
}

function injectFaqSchema(raw, faqSchema) {
  // Find the frontmatter end and inject script tag after it
  const fmEnd = raw.indexOf('\n---', 4);
  if (fmEnd === -1) return raw;
  
  const scriptTag = `\n<script type="application/ld+json" set:html={JSON.stringify(${JSON.stringify(faqSchema, null, 2)})} />\n`;
  
  // Insert after frontmatter
  return raw.slice(0, fmEnd + 4) + scriptTag + raw.slice(fmEnd + 4);
}

function addDefinition(body) {
  // Find the first paragraph after the first heading or start of body
  const lines = body.split('\n');
  let insertIndex = 0;
  
  // Skip frontmatter-like content at start
  while (insertIndex < lines.length && (lines[insertIndex].startsWith('#') || lines[insertIndex].trim() === '')) {
    insertIndex++;
  }
  
  // Find first substantial paragraph
  while (insertIndex < lines.length && lines[insertIndex].trim().length < 50) {
    insertIndex++;
  }
  
  if (insertIndex >= lines.length) return body;
  
  // Check if first paragraph already looks like a definition
  const firstPara = lines.slice(insertIndex, insertIndex + 3).join(' ');
  if (/^(What is|What are|A |An |is a |refers to|means )/i.test(firstPara.trim())) {
    return body; // Already has definition
  }
  
  // We can't easily generate a definition without knowing the topic
  // Return body unchanged - this needs manual intervention
  return body;
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
    else if (!p.hasFaqSchema) issues.push('Has FAQ but missing FAQPage JSON-LD schema');
    
    if (!p.hasDefinition) issues.push('No clear definition in first section');
    if (!p.hasDescription) issues.push('Meta description missing or wrong length (need 120-160 chars)');
    if (!p.hasImage) issues.push('Missing custom hero image (using generic OG)');
    if (!p.hasArticleSchema) issues.push('Missing Article/BlogPosting schema');
    if (p.words < MIN_WORDS_PILLAR) issues.push(`Thin pillar (${p.words}w < ${MIN_WORDS_PILLAR}w)`);
    
    const status = issues.length === 0 ? '✅ READY' : `⚠️ ${issues.length} issue(s)`;
    console.log(`\n${status} | ${p.slug}`);
    console.log(`  Title: ${p.title}`);
    console.log(`  Words: ${p.words} | Age: ${p.ageDays}d | Tags: ${p.tags.join(', ')}`);
    console.log(`  FAQ: ${p.hasFaqSection ? 'Yes' : 'No'} | FAQ Schema: ${p.hasFaqSchema ? 'Yes' : 'No'} | FAQs found: ${faqs.length}`);
    console.log(`  Definition: ${p.hasDefinition ? 'Yes' : 'No'} | Description: ${p.hasDescription ? 'OK' : 'Fix'} | Image: ${p.hasImage ? 'Custom' : 'Generic'} | Schema: ${p.hasArticleSchema ? 'Yes' : 'No'}`);
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
  
  console.log('\n' + '='.repeat(80));
  console.log('SUMMARY');
  console.log('='.repeat(80));
  console.log(`Pillar posts with FAQ section: ${withFaq}/${pillarPosts.length}`);
  console.log(`Pillar posts with FAQ schema: ${withFaqSchema}/${pillarPosts.length}`);
  console.log(`Pillar posts with clear definition: ${withDefinition}/${pillarPosts.length}`);
  console.log(`Pillar posts with good meta description: ${withDescription}/${pillarPosts.length}`);
  console.log(`Pillar posts with custom image: ${withImage}/${pillarPosts.length}`);
  console.log(`Pillar posts with Article schema: ${withSchema}/${pillarPosts.length}`);
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

function applyFixes(posts) {
  if (DRY || ANALYZE_ONLY) {
    console.log('\n[DRY RUN] No changes applied.');
    return;
  }
  
  let changed = 0;
  
  for (const p of posts) {
    if (!p.evergreen) continue; // Only fix pillar posts
    
    let newRaw = p.raw;
    let fileChanged = false;
    
    // Add FAQ schema if FAQ exists but no schema
    if (p.hasFaqSection && !p.hasFaqSchema) {
      const faqs = extractFaq(p.body);
      if (faqs.length > 0) {
        const faqSchema = buildFaqSchema(faqs);
        newRaw = injectFaqSchema(newRaw, faqSchema);
        fileChanged = true;
        console.log(`  ✓ Added FAQPage schema to ${p.slug} (${faqs.length} Q&As)`);
      }
    }
    
    // Add canonical URL if missing
    if (!p.hasCanonical) {
      const canonicalUrl = `https://terminalblog.com/blog/${p.slug}/`;
      const fmEnd = newRaw.indexOf('\n---', 4);
      if (fmEnd !== -1) {
        const canonicalLine = `canonical: "${canonicalUrl}"\n`;
        newRaw = newRaw.slice(0, fmEnd) + '\n' + canonicalLine + newRaw.slice(fmEnd);
        fileChanged = true;
        console.log(`  ✓ Added canonical URL to ${p.slug}`);
      }
    }
    
    if (fileChanged) {
      fs.writeFileSync(p.file, newRaw, 'utf8');
      changed++;
    }
  }
  
  console.log(`\nApplied fixes to ${changed} files.`);
}

function main() {
  console.log(DRY ? '\n[DRY RUN MODE]\n' : '');
  console.log(ANALYZE_ONLY ? '[ANALYZE ONLY MODE]\n' : '');
  
  const { posts, pillarPosts } = analyze();
  
  if (!ANALYZE_ONLY) {
    console.log('\n' + '='.repeat(80));
    console.log('APPLYING FIXES...');
    console.log('='.repeat(80));
    applyFixes(posts);
  }
  
  console.log('\nDone.');
}

main();