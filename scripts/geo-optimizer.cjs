#!/usr/bin/env node
/**
 * GEO Optimizer — Analyze and optimize terminalblog content for AI search engines
 * 
 * Modes:
 *   --analyze-only    Only analyze, don't modify (default)
 *   --dry             Show what would be changed without writing
 *   --apply           Apply fixes to files
 *   --help            Show usage
 */

const fs = require('fs');
const path = require('path');

const BLOG = path.join(__dirname, '..', 'src', 'content', 'blog');
const ANALYZE_ONLY = process.argv.includes('--analyze-only');
const DRY_RUN = process.argv.includes('--dry');
const APPLY = process.argv.includes('--apply');

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

  // Extract existing FAQ from frontmatter if present
  let fmFaq = [];
  if (fm.faq) {
    try {
      fmFaq = JSON.parse(fm.faq);
    } catch (e) {
      // ignore parse errors
    }
  }

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
    fmFaq,
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

  // Pattern 3: Q: Question? / A: Answer
  if (faqs.length === 0) {
    const pattern3 = /^\s*Q:\s*(.+?)\s*\n\s*A:\s*(.+?)(?=\n\s*Q:|$)/gim;
    while ((match = pattern3.exec(faqContent)) !== null) {
      const q = match[1].trim().replace(/^["']|["']$/g, '');
      const a = match[2].trim().replace(/^["']|["']$/g, '');
      if (q && a && q.length > 3) faqs.push({ q, a });
    }
  }

  return faqs;
}

function generateFaqSection(faqs) {
  if (!faqs || faqs.length === 0) return '';
  
  let section = '\n## FAQ\n\n';
  faqs.forEach((faq, i) => {
    section += `**Q${i+1}: ${faq.q}**\n\n${faq.a}\n\n`;
  });
  return section.trim() + '\n';
}

function generateFaqSchema(faqs) {
  if (!faqs || faqs.length === 0) return '';
  
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.a
      }
    }))
  };
  
  return `<script type="application/ld+json" set:html={JSON.stringify(${JSON.stringify(schema)})} />\n`;
}

function addDefinition(body, title, tags) {
  // Check if already has definition
  const bodyAfterScripts = body.replace(/<script[^>]*>[\s\S]*?<\/script>\s*/g, '').replace(/<script[^>]*set:html=\{JSON\.stringify\([\s\S]*?\)\}\s*\/\>\s*/g, '');
  const firstSection = bodyAfterScripts.slice(0, 2000);
  if (/^(\*{0,2})(What is|What are|A (coding agent|agent) is|An (agent|agent) is|is a|refers to|means)/im.test(firstSection.trim())) {
    return body; // Already has definition
  }
  
  // Generate appropriate definition based on title/tags
  let definition = '';
  const lowerTitle = title.toLowerCase();
  
  if (lowerTitle.includes('coding agent') || lowerTitle.includes('ai agent') || tags.some(t => t.includes('agent'))) {
    definition = '**What is a coding agent?** A coding agent is an AI-powered tool that can autonomously write, edit, and reason about code across multiple files in a codebase. Unlike simple autocomplete (GitHub Copilot), agents can execute terminal commands, navigate project structure, run tests, and complete multi-step tasks from a high-level prompt.\n\n';
  } else if (lowerTitle.includes('security') || lowerTitle.includes('beware') || lowerTitle.includes('vulnerab') || lowerTitle.includes('exploit')) {
    definition = '**What this covers:** This article documents a verified security issue affecting AI coding agents — including reproduction steps, impact assessment, and recommended mitigations. We only publish security findings with confirmed repro and responsible disclosure.\n\n';
  } else if (lowerTitle.includes('comparison') || lowerTitle.includes(' vs ') || lowerTitle.includes('alternative')) {
    definition = '**What this comparison covers:** We evaluate tools on real workflows — not feature checklists. Tests run on actual codebases with real token costs measured. No vendor demos.\n\n';
  } else if (lowerTitle.includes('guide') || lowerTitle.includes('how to') || lowerTitle.includes('tutorial')) {
    definition = '**What you will learn:** This guide walks through the complete setup and workflow — from installation to production-ready configuration — with copy-paste examples and common pitfalls marked.\n\n';
  } else if (lowerTitle.includes('pricing') || lowerTitle.includes('cost')) {
    definition = '**What this cost analysis covers:** We break down real monthly spend by usage tier — light, moderate, heavy — including hidden token overhead that vendors don\'t advertise. All numbers from actual usage logs.\n\n';
  } else {
    definition = `**What this article covers:** ${title} — a practical breakdown with real data, not marketing claims.\n\n`;
  }
  
  // Insert after frontmatter (after the ---)
  const parts = body.split(/^---$/m);
  if (parts.length >= 2) {
    // Find the first content after frontmatter
    const frontmatterEnd = body.indexOf('---', 4) + 3;
    const afterFrontmatter = body.slice(frontmatterEnd);
    return body.slice(0, frontmatterEnd) + '\n' + definition + afterFrontmatter;
  }
  
  return definition + body;
}

function addFaqToBody(body, faqs) {
  if (!faqs || faqs.length === 0) return body;
  
  // Check if FAQ section already exists
  if (/^## FAQ\s*$/m.test(body) || /^## FAQ\s*$/im.test(body)) {
    return body;
  }
  
  const faqSection = generateFaqSection(faqs);
  const faqSchema = generateFaqSchema(faqs);
  
  // Insert before the last --- or at the end
  const lastSeparator = body.lastIndexOf('\n---');
  if (lastSeparator !== -1) {
    return body.slice(0, lastSeparator) + '\n' + faqSchema + faqSection + '\n' + body.slice(lastSeparator);
  }
  
  return body + '\n' + faqSchema + faqSection + '\n';
}

function ensureCanonical(fm, slug) {
  if (fm.canonical) return fm.canonical;
  return `https://terminalblog.com/blog/${slug}/`;
}

function improveDescription(fm, title, body) {
  if (fm.description && fm.description.length >= 120 && fm.description.length <= 160) {
    return fm.description;
  }
  
  // Extract first meaningful paragraph
  const cleanBody = body.replace(/<script[^>]*>[\s\S]*?<\/script>\s*/g, '').replace(/<script[^>]*set:html=\{JSON\.stringify\([\s\S]*?\)\}\s*\/\>\s*/g, '');
  const paragraphs = cleanBody.split(/\n\s*\n/).filter(p => p.trim().length > 50 && !p.startsWith('#'));
  
  for (const p of paragraphs) {
    const clean = p.replace(/[*_`#]/g, '').trim();
    if (clean.length >= 120 && clean.length <= 160) {
      return clean;
    }
    if (clean.length > 160) {
      return clean.slice(0, 157) + '...';
    }
  }
  
  // Fallback: construct from title
  return title.slice(0, 157);
}

function processPost(post) {
  const changes = [];
  let newBody = post.body;
  let newFm = { ...post.fm };
  
  // 1. Add definition if missing
  if (!post.hasDefinition) {
    newBody = addDefinition(newBody, post.title, post.tags);
    changes.push('Added clear definition at start');
  }
  
  // 2. Add FAQ section if frontmatter has FAQ but body doesn't
  if (post.fmFaq.length > 0 && !post.hasFaqSection) {
    newBody = addFaqToBody(newBody, post.fmFaq);
    changes.push('Added FAQ section from frontmatter');
  }
  
  // 3. Add canonical URL if missing
  if (!post.hasCanonical) {
    newFm.canonical = ensureCanonical(post.fm, post.slug);
    changes.push('Added canonical URL');
  }
  
  // 4. Improve meta description if missing/poor
  if (!post.hasDescription) {
    newFm.description = improveDescription(post.fm, post.title, post.body);
    changes.push('Improved meta description');
  }
  
  // 5. Add Article schema if missing (handled by schema endpoint, but add inline for GEO)
  if (!post.hasArticleSchema && post.evergreen) {
    const schema = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": post.title,
      "description": newFm.description || post.fm.description,
      "datePublished": post.fm.pubDate,
      "dateModified": post.fm.updatedDate || post.fm.pubDate,
      "author": { "@type": "Person", "name": post.fm.author || "Anshad" },
      "publisher": {
        "@type": "Organization",
        "name": "TerminalBlog",
        "logo": { "@type": "ImageObject", "url": "https://terminalblog.com/favicon.ico" }
      },
      "mainEntityOfPage": { "@type": "WebPage", "@id": newFm.canonical }
    };
    
    const schemaScript = `<script type="application/ld+json" set:html={JSON.stringify(${JSON.stringify(schema)})} />\n`;
    
    // Insert after frontmatter
    const frontmatterEnd = newBody.indexOf('---', 4) + 3;
    if (frontmatterEnd > 3) {
      newBody = newBody.slice(0, frontmatterEnd) + '\n' + schemaScript + newBody.slice(frontmatterEnd);
    }
    changes.push('Added Article schema');
  }
  
  // Reconstruct frontmatter
    let newFrontmatter = '---\n';
    const fmOrder = ['title', 'description', 'pubDate', 'updatedDate', 'tags', 'tool', 'author', 'image', 'canonical', 'faq'];
    const processedKeys = new Set();
  
    for (const key of fmOrder) {
      if (newFm[key] !== undefined && newFm[key] !== '') {
        let value = newFm[key];
        if (Array.isArray(value)) {
          // Write as proper YAML array
          newFrontmatter += `${key}:\n`;
          for (const v of value) {
            newFrontmatter += `  - "${v.replace(/"/g, '\\"')}"\n`;
          }
        } else if (typeof value === 'string' && (value.includes(':') || value.includes('"') || value.includes("'"))) {
          newFrontmatter += `${key}: "${value.replace(/"/g, '\\"')}"\n`;
        } else {
          newFrontmatter += `${key}: ${value}\n`;
        }
        processedKeys.add(key);
      }
    }
  
    // Add any remaining keys
    for (const [key, value] of Object.entries(newFm)) {
      if (!processedKeys.has(key) && value !== undefined && value !== '') {
        let v = value;
        if (Array.isArray(v)) {
          newFrontmatter += `${key}:\n`;
          for (const item of v) {
            newFrontmatter += `  - "${item.replace(/"/g, '\\"')}"\n`;
          }
        } else if (typeof v === 'string' && (v.includes(':') || v.includes('"') || v.includes("'"))) {
          newFrontmatter += `${key}: "${v.replace(/"/g, '\\"')}"\n`;
        } else {
          newFrontmatter += `${key}: ${v}\n`;
        }
      }
    }
  
    newFrontmatter += '---';
  
  // Combine
  const newRaw = newFrontmatter + '\n' + newBody;
  
  return { newRaw, changes };
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
  console.log(`Mode: ${ANALYZE_ONLY ? 'ANALYZE ONLY' : DRY_RUN ? 'DRY RUN' : APPLY ? 'APPLY' : 'ANALYZE ONLY'}`);
  console.log('');
  
  let totalChanges = 0;
  const modifiedPosts = [];
  
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
    if (!p.hasCanonical) issues.push('Missing canonical URL');
    
    const status = issues.length === 0 ? '✅ READY' : `⚠️ ${issues.length} issue(s)`;
    console.log(`\n${status} | ${p.slug}`);
    console.log(`  Title: ${p.title}`);
    console.log(`  Words: ${p.words} | Age: ${p.ageDays}d | Tags: ${p.tags.join(', ')}`);
    console.log(`  FAQ: ${p.hasFaqSection ? 'Yes' : 'No'} | FAQ Schema: ${p.hasFaqSchema ? 'Yes' : 'No'} | FAQs found: ${faqs.length}`);
    console.log(`  Definition: ${p.hasDefinition ? 'Yes' : 'No'} | Description: ${p.hasDescription ? 'OK' : 'Fix'} | Image: ${p.hasImage ? 'Custom' : 'Generic'} | Schema: ${p.hasArticleSchema ? 'Yes' : 'No'} | Canonical: ${p.hasCanonical ? 'Yes' : 'No'}`);
    if (issues.length) {
      issues.forEach(i => console.log(`  - ${i}`));
    }
    
    // Process if not analyze-only
    if (!ANALYZE_ONLY) {
      const { newRaw, changes } = processPost(p);
      if (changes.length > 0) {
        modifiedPosts.push({ post: p, changes, newRaw });
        totalChanges += changes.length;
        console.log(`  🔧 Would fix: ${changes.join(', ')}`);
      }
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
  
  if (!ANALYZE_ONLY) {
    console.log(`\nPosts with fixes: ${modifiedPosts.length}/${pillarPosts.length}`);
    console.log(`Total fixes: ${totalChanges}`);
  }
  
  // AI Search visibility check
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
  
  // Apply changes if requested
  if (APPLY && modifiedPosts.length > 0) {
    console.log('\n' + '='.repeat(80));
    console.log('APPLYING CHANGES...');
    console.log('='.repeat(80));
    
    for (const { post, changes, newRaw } of modifiedPosts) {
      fs.writeFileSync(post.file, newRaw, 'utf8');
      console.log(`✅ Updated: ${post.slug} (${changes.join(', ')})`);
    }
    
    console.log(`\nDone. Modified ${modifiedPosts.length} files.`);
  } else if (DRY_RUN && modifiedPosts.length > 0) {
    console.log('\n' + '='.repeat(80));
    console.log('DRY RUN - Changes that would be applied:');
    console.log('='.repeat(80));
    for (const { post, changes } of modifiedPosts) {
      console.log(`  ${post.slug}: ${changes.join(', ')}`);
    }
    console.log(`\nTotal: ${modifiedPosts.length} files would be modified.`);
  }
  
  return { posts: allPosts, pillarPosts, topPillars, modifiedPosts };
}

function main() {
  if (process.argv.includes('--help')) {
    console.log(`
GEO Optimizer — Optimize terminalblog for AI search engines

Usage:
  node scripts/geo-optimizer.cjs [options]

Options:
  --analyze-only    Only analyze, don't modify (default)
  --dry             Show what would be changed without writing
  --apply           Apply fixes to files
  --help            Show this help

The optimizer checks and fixes:
  - Missing FAQ sections (from frontmatter FAQ data)
  - Missing clear definitions at article start
  - Missing canonical URLs
  - Poor meta descriptions (< 120 or > 160 chars)
  - Missing Article/BlogPosting schema
  - Missing FAQPage schema (for posts with FAQ)
`);
    process.exit(0);
  }
  
  console.log(ANALYZE_ONLY ? '[ANALYZE ONLY MODE]\n' : DRY_RUN ? '[DRY RUN MODE]\n' : APPLY ? '[APPLY MODE]\n' : '[ANALYZE ONLY MODE]\n');
  
  const result = analyze();
  
  console.log('\nDone.');
}

main();