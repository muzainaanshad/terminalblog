import fs from 'fs';
function countWords(file) {
  const content = fs.readFileSync(file, 'utf8');
  const fmEnd = content.indexOf('---', 3);
  const body = fmEnd > 0 ? content.slice(fmEnd + 3) : content;
  const text = body
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]*`/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '')
    .replace(/#+\s/g, '')
    .replace(/[*_~]/g, '')
    .replace(/\n+/g, ' ');
  return text.split(/\s+/).filter(w => w.length > 0).length;
}

console.log('hermes-cron-job-secret-scope-security-fix:', countWords('src/content/blog/hermes-cron-job-secret-scope-security-fix.mdx'));
console.log('hermes-env-file-guard-case-insensitive-security:', countWords('src/content/blog/hermes-env-file-guard-case-insensitive-security.mdx'));