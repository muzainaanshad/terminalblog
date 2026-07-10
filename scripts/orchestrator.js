#!/usr/bin/env node
// Combined data fetcher for terminalblog cron
// Runs all fetchers and outputs unified context

import { execSync } from 'child_process';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

function run(script) {
  try {
    return execSync(`node ${__dirname}/${script}`, {
      encoding: 'utf8', timeout: 30000,
      env: { ...process.env }
    });
  } catch (e) {
    return JSON.stringify({ error: e.message?.slice(0, 200) });
  }
}

const [commits, discussions, issues] = await Promise.all([
  Promise.resolve(run('fetch-commits.js')),
  Promise.resolve(run('fetch-discussions.js')),
  Promise.resolve(run('fetch-issues.js')),
]);

console.log('=== RECENT COMMITS ===');
console.log(commits);
console.log('\n=== COMMUNITY DISCUSSIONS ===');
console.log(discussions);
console.log('\n=== GITHUB ISSUES ===');
console.log(issues);
