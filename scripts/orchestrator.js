#!/usr/bin/env node
// Orchestrator: runs commit fetcher + discussion fetcher, outputs combined context

import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

function runScript(name) {
  const result = spawnSync('node', [join(__dirname, name)], {
    encoding: 'utf-8',
    timeout: 30000,
  });
  if (result.status !== 0) {
    return { error: result.stderr?.slice(0, 500) || 'unknown error' };
  }
  try {
    return JSON.parse(result.stdout);
  } catch {
    return { error: 'failed to parse output', raw: result.stdout.slice(0, 500) };
  }
}

const commits = runScript('fetch-commits.js');
const discussions = runScript('fetch-discussions.js');

const output = {
  timestamp: new Date().toISOString(),
  summary: '',
  commits: commits.error ? null : commits,
  discussions: discussions.error ? null : discussions,
};

// Craft a human-readable summary for the agent
const lines = [];
if (commits.repos && commits.repos.length > 0) {
  lines.push(`📦 ${commits.repos.length} repos have recent changes:`);
  for (const r of commits.repos.slice(0, 5)) {
    for (const c of r.recentChanges) {
      lines.push(`  ${r.tool}: ${c.what}`);
    }
  }
}

if (discussions && discussions.discussions && discussions.discussions.length > 0) {
  lines.push(`\n💬 ${discussions.discussions.length} active community discussions found:`);
  for (const d of discussions.discussions.slice(0, 8)) {
    const score = d.points || d.ups || 0;
    const comments = d.numComments || 0;
    lines.push(`  [${score}↑ ${comments}💬] ${d.title.substring(0, 120)}`);
    lines.push(`         ${d.url}`);
  }
  if (discussions.tips && discussions.tips.length > 0) {
    lines.push(`\n🎯 Writing tip: ${discussions.tips[0]}`);
  }
}

if (!commits.error && commits.repos?.length === 0 && (!discussions.discussions || discussions.discussions.length === 0)) {
  lines.push('\nNo new data. Write a general educational article or a comparison guide.');
}

output.summary = lines.join('\n');
process.stdout.write(JSON.stringify(output, null, 2));
