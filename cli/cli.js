#!/usr/bin/env node
// terminalblog CLI — get latest articles from terminalblog.com in your terminal
// Usage: npx terminalblog

const API = 'https://terminalblog.com/api/latest';

async function main() {
  const args = process.argv.slice(2);
  const cmd = args[0] || 'latest';

  if (cmd === 'latest' || cmd === 'ls') {
    const res = await fetch(API);
    const data = await res.json();

    console.log(`\n  \x1b[32mterminalblog\x1b[0m — latest ${data.total} articles`);
    console.log(`  \x1b[90m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m\n`);

    for (const article of data.articles) {
      const tags = article.tags?.filter(t => t !== 'viral').slice(0, 3) || [];
      const tagStr = tags.length ? tags.map(t => `\x1b[33m#${t}\x1b[0m`).join(' ') : '';
      console.log(`  \x1b[1m${article.title}\x1b[0m`);
      console.log(`  \x1b[90m${article.date}\x1b[0m  ${tagStr}`);
      console.log(`  \x1b[34m${article.url}\x1b[0m\n`);
    }

    console.log(`  \x1b[90m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m`);
    console.log(`  \x1b[2mterminalblog.com — following the AI coding agent ecosystem\x1b[0m\n`);
  }

  else if (cmd === 'compare' || cmd === 'cmp') {
    const res = await fetch('https://terminalblog.com/api/compare');
    const data = await res.json();
    console.log(`\n  \x1b[32mterminalblog\x1b[0m — agent comparison\n`);
    for (const a of data) {
      console.log(`  \x1b[1m${a.name}\x1b[0m  \x1b[90m${a.type} · ${a.pricing}\x1b[0m`);
      if (a.sweBench && a.sweBench !== '-') console.log(`  SWE-bench: ${a.sweBench}`);
      console.log();
    }
  }

  else if (cmd === 'help' || cmd === '--help' || cmd === '-h') {
    console.log(`\n  \x1b[32mterminalblog\x1b[0m — CLI for terminalblog.com\n`);
    console.log(`  Usage:`);
    console.log(`    \x1b[32mterminalblog\x1b[0m          Show latest articles`);
    console.log(`    \x1b[32mterminalblog ls\x1b[0m       Same as above`);
    console.log(`    \x1b[32mterminalblog compare\x1b[0m  Show agent comparison`);
    console.log(`    \x1b[32mterminalblog help\x1b[0m     Show this help\n`);
    console.log(`  \x1b[90mterminalblog.com — following the AI coding agent ecosystem\x1b[0m\n`);
  }

  else {
    console.log(`Unknown command: ${cmd}. Run \x1b[32mterminalblog help\x1b[0m for usage.`);
    process.exit(1);
  }
}

main().catch(e => {
  console.error(`Error: ${e.message}`);
  process.exit(1);
});
