#!/usr/bin/env node
/**
 * Agent Commit Watcher — Monitor all coding agent repos for significant changes
 * 
 * Checks:
 * - GitHub releases
 * - Recent commits (last 24h)
 * - Breaking changes, new features, security fixes
 * 
 * Usage:
 *   node scripts/agent-commit-watcher.cjs           # check all agents
 *   node scripts/agent-commit-watcher.cjs --agent claude-code  # check specific agent
 *   node scripts/agent-commit-watcher.cjs --json     # output JSON
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const ROOT = path.join(__dirname, '..');
const STATE_PATH = path.join(ROOT, 'tmp', 'commit-watcher-state.json');

// All tracked agents and their repos
const AGENTS = {
  'claude-code': { repo: 'anthropics/claude-code', name: 'Claude Code' },
  'cursor': { repo: 'cursor-ai/cursor', name: 'Cursor' },
  'codex-cli': { repo: 'openai/codex', name: 'Codex CLI' },
  'opencode': { repo: 'sst/opencode', name: 'OpenCode' },
  'mimo-code': { repo: 'mimo-ai/mimo', name: 'Mimo Code' },
  'kilo-code': { repo: 'kilo-code/kilo', name: 'Kilo Code' },
  'pi-dev': { repo: 'pi-dev/pi', name: 'Pi.dev' },
  'gitlawb-zero': { repo: 'gitlawb/zero', name: 'Gitlawb Zero' },
  'ohmypi': { repo: 'ohmypi/ai', name: 'Oh My Pi' },
  'goose': { repo: 'block/goose', name: 'Goose' },
  'openclaw': { repo: 'openclaw/openclaw', name: 'OpenClaw' },
  'codebuff': { repo: 'codebuff/codebuff', name: 'Codebuff' },
  'ampcode': { repo: 'ampcode/amp', name: 'AmpCode' },
  'copilot-cli': { repo: 'github/copilot-cli', name: 'GitHub Copilot CLI' },
  'gemini-cli': { repo: 'google/gemini-cli', name: 'Gemini CLI' },
  'microsoft-copilot-cli': { repo: 'microsoft/copilot-cli', name: 'Copilot CLI' },
  'hermes-agent': { repo: 'NousResearch/hermes-agent', name: 'Hermes Agent' },
  'qwen-code': { repo: 'QwenLM/qwen-code', name: 'Qwen Code' },
};

function hasFlag(f) { return process.argv.includes(f); }

function loadState() {
  try { return JSON.parse(fs.readFileSync(STATE_PATH, 'utf8')); }
  catch { return { lastCheck: null, seen: {} }; }
}

function saveState(state) {
  fs.mkdirSync(path.dirname(STATE_PATH), { recursive: true });
  fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2));
}

function httpRequest(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const opts = {
      hostname: parsed.hostname,
      path: parsed.pathname + parsed.search,
      headers: {
        'User-Agent': 'terminalblog-commit-watcher/1.0',
        ...headers,
      },
    };
    
    const req = https.request(opts, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch { resolve({ raw: data }); }
      });
    });
    
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
    req.end();
  });
}

async function checkAgent(agentId, agent, state) {
  const results = { releases: [], commits: [] };
  
  try {
    // Check latest release
    const release = await httpRequest(
      `https://api.github.com/repos/${agent.repo}/releases/latest`
    );
    
    if (release.tag_name && !state.seen[`${agentId}:${release.tag_name}`]) {
      results.releases.push({
        tag: release.tag_name,
        name: release.name,
        body: release.body?.slice(0, 500),
        url: release.html_url,
        published: release.published_at,
      });
      state.seen[`${agentId}:${release.tag_name}`] = Date.now();
    }
  } catch (e) {
    // Release might not exist, that's ok
  }
  
  try {
    // Check recent commits (last 24h)
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const commits = await httpRequest(
      `https://api.github.com/repos/${agent.repo}/commits?since=${since}&per_page=10`
    );
    
    if (Array.isArray(commits)) {
      for (const c of commits) {
        const sha = c.sha?.slice(0, 7);
        if (sha && !state.seen[`${agentId}:${sha}`]) {
          const msg = c.commit?.message?.split('\n')[0] || '';
          
          // Check if significant
          const isBreaking = /breaking|BREAKING|major/i.test(msg);
          const isFeature = /feat|feature|add|implement/i.test(msg);
          const isFix = /fix|bug|security|vulnerability/i.test(msg);
          const isRelease = /release|version|tag/i.test(msg);
          
          if (isBreaking || isFeature || isFix || isRelease || results.commits.length < 3) {
            results.commits.push({
              sha,
              message: msg.slice(0, 200),
              url: c.html_url,
              date: c.commit?.author?.date,
              significant: isBreaking || isFeature || isFix,
            });
          }
          
          state.seen[`${agentId}:${sha}`] = Date.now();
        }
      }
    }
  } catch (e) {
    console.log(`  ✗ ${agent.name}: ${e.message}`);
  }
  
  return results;
}

async function main() {
  const agentFilter = process.argv.find(a => a.startsWith('--agent='))?.split('=')[1];
  const jsonOutput = hasFlag('--json');
  
  console.log('=== Agent Commit Watcher ===');
  console.log(`Time: ${new Date().toISOString()}`);
  
  const state = loadState();
  const allResults = {};
  let totalReleases = 0;
  let totalCommits = 0;
  let significantCommits = 0;
  
  const agentsToCheck = agentFilter 
    ? { [agentFilter]: AGENTS[agentFilter] }
    : AGENTS;
  
  for (const [agentId, agent] of Object.entries(agentsToCheck)) {
    if (!agent) {
      console.log(`  ✗ Unknown agent: ${agentId}`);
      continue;
    }
    
    console.log(`  Checking ${agent.name}...`);
    const results = await checkAgent(agentId, agent, state);
    
    if (results.releases.length > 0 || results.commits.length > 0) {
      allResults[agentId] = {
        name: agent.name,
        ...results,
      };
      
      totalReleases += results.releases.length;
      totalCommits += results.commits.length;
      significantCommits += results.commits.filter(c => c.significant).length;
      
      if (results.releases.length > 0) {
        console.log(`    📦 Release: ${results.releases[0].tag}`);
      }
      if (results.commits.length > 0) {
        console.log(`    📝 Commits: ${results.commits.length} (${results.commits.filter(c => c.significant).length} significant)`);
      }
    }
    
    // Rate limit: 1 request per second
    await new Promise(r => setTimeout(r, 1000));
  }
  
  // Save state
  state.lastCheck = new Date().toISOString();
  
  // Clean old entries (>7 days)
  const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
  for (const [key, ts] of Object.entries(state.seen)) {
    if (ts < cutoff) delete state.seen[key];
  }
  
  saveState(state);
  
  // Output
  if (jsonOutput) {
    console.log(JSON.stringify(allResults, null, 2));
  } else {
    console.log('\n=== Summary ===');
    console.log(`Agents checked: ${Object.keys(agentsToCheck).length}`);
    console.log(`Releases found: ${totalReleases}`);
    console.log(`Commits found: ${totalCommits}`);
    console.log(`Significant: ${significantCommits}`);
    
    if (significantCommits > 0) {
      console.log('\n=== Significant Changes ===');
      for (const [agentId, data] of Object.entries(allResults)) {
        const sig = data.commits.filter(c => c.significant);
        if (sig.length > 0) {
          console.log(`\n${data.name}:`);
          sig.forEach(c => console.log(`  - ${c.message} (${c.sha})`));
        }
      }
    }
  }
}

main().catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});
