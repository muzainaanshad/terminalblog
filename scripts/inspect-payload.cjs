const p = require('C:/Users/muzai/seo-ai-blog/scripts/devto-payload-beware.json');
console.log('TAGS:', JSON.stringify(p.article.tags), 'count:', p.article.tags.length);
console.log('has body_markdown:', !!p.article.body_markdown, 'len:', p.article.body_markdown.length);
console.log('title:', p.article.title);
console.log('canonical:', p.article.canonical_url);
