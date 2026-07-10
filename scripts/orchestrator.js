#!/usr/bin/env node
// Combined data fetcher for terminalblog cron
// All sources use 3h window (except YouTube which uses 24h)
// Runs all fetchers and outputs unified context for article generation

import { execSync } from 'child_process';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

function run(script) {
  try {
    return execSync(`node ${__dirname}/${script}`, {
      encoding: 'utf8', timeout: 45000,
      env: { ...process.env }
    });
  } catch (e) {
    return JSON.stringify({ error: e.message?.slice(0, 200) });
  }
}

const [commits, discussions, issues, blogs, youtube] = await Promise.all([
  Promise.resolve(run('fetch-commits.js')),
  Promise.resolve(run('fetch-discussions.js')),
  Promise.resolve(run('fetch-issues.js')),
  Promise.resolve(run('fetch-blogs.js')),
  Promise.resolve(run('fetch-youtube.js')),
]);

console.log('=== RECENT COMMITS (3h) ===');
console.log(commits);
console.log('\n=== COMMUNITY DISCUSSIONS (3h) ===');
console.log(discussions);
console.log('\n=== GITHUB ISSUES (3h) ===');
console.log(issues);
console.log('\n=== OFFICIAL BLOGS (3h) ===');
console.log(blogs);
console.log('\n=== YOUTUBE (24h) ===');
console.log(youtube);
