#!/usr/bin/env node
/**
 * Agent Adoption Tracker — Data Fetcher v2
 * Fetches npm, GitHub, PyPI, Homebrew data for all agents
 * Shows "n/a" with reasons instead of 0
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const CONFIG_PATH = path.join(__dirname, '..', 'src', 'data', 'adoption', 'config.json');
const SNAPSHOTS_DIR = path.join(__dirname, '..', 'src', 'data', 'adoption', 'snapshots');

if (!fs.existsSync(SNAPSHOTS_DIR)) {
  fs.mkdirSync(SNAPSHOTS_DIR, { recursive: true });
}

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    const headers = { 'User-Agent': 'terminalblog-adoption-tracker' };
    if (url.includes('api.github.com') && process.env.GITHUB_TOKEN) {
      headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
    }
    const req = https.get(url, { headers }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error(`Parse error: ${e.message}`)); }
      });
    });
    req.on('error', reject);
    req.setTimeout(10000, () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

async function getNpmDownloads(pkg) {
  if (!pkg) return { value: null, reason: 'No npm package' };
  try {
    const data = await fetchJSON(`https://api.npmjs.org/downloads/point/last-week/${pkg}`);
    return { value: data.downloads || 0, reason: null };
  } catch (e) {
    return { value: null, reason: `Fetch failed: ${e.message}` };
  }
}

async function getGitHubData(repo) {
  if (!repo) return { stars: null, forks: null, openIssues: null, reason: 'No public repo (closed source)' };
  try {
    const data = await fetchJSON(`https://api.github.com/repos/${repo}`);
    if (data.message === 'Not Found') {
      return { stars: null, forks: null, openIssues: null, reason: 'Repo not found' };
    }
    return {
      stars: data.stargazers_count || 0,
      forks: data.forks_count || 0,
      openIssues: data.open_issues_count || 0,
      reason: null
    };
  } catch (e) {
    return { stars: null, forks: null, openIssues: null, reason: `Fetch failed: ${e.message}` };
  }
}

async function getPyPIDownloads(pkg) {
  if (!pkg) return { value: null, reason: 'No PyPI package' };
  try {
    // Add delay to avoid rate limiting
    await new Promise(r => setTimeout(r, 2000));
    const data = await fetchJSON(`https://pypistats.org/api/packages/${pkg}/recent`);
    if (data.data) {
      return { value: data.data.last_week || 0, reason: null };
    }
    return { value: null, reason: 'No data in response' };
  } catch (e) {
    if (e.message.includes('429') || e.message.includes('RATE LIMIT')) {
      return { value: null, reason: 'Rate limited - try again later' };
    }
    return { value: null, reason: `Fetch failed: ${e.message}` };
  }
}

async function getHomebrewInstalls(cask) {
  if (!cask) return { value: null, reason: 'No Homebrew cask' };
  try {
    const data = await fetchJSON(`https://formulae.brew.sh/api/cask/${cask}.json`);
    if (data.analytics && data.analytics.install && data.analytics.install['30d']) {
      const installs = data.analytics.install['30d'];
      // Format: {cask_name: count}
      const count = typeof installs === 'object' ? Object.values(installs)[0] : installs;
      return { value: count || 0, reason: null };
    }
    return { value: null, reason: 'No analytics data' };
  } catch (e) {
    return { value: null, reason: `Fetch failed: ${e.message}` };
  }
}

function computeMetrics(agent) {
  const npm = agent.metrics?.npm_downloads;
  const stars = agent.metrics?.github_stars;
  const pypi = agent.metrics?.pypi_downloads;
  const brew = agent.metrics?.homebrew_installs;
  
  // Normalize to 0-100 scale (only for agents with data)
  const hasNpm = npm !== null && npm !== undefined;
  const hasStars = stars !== null && stars !== undefined;
  const hasPyPI = pypi !== null && pypi !== undefined;
  const hasBrew = brew !== null && brew !== undefined;
  
  const maxNpm = 10000000;
  const maxStars = 400000;
  const maxPyPI = 100000;
  const maxBrew = 5000;
  
  const npmScore = hasNpm ? Math.min(100, (npm / maxNpm) * 100) : 0;
  const starScore = hasStars ? Math.min(100, (stars / maxStars) * 100) : 0;
  const pypiScore = hasPyPI ? Math.min(100, (pypi / maxPyPI) * 100) : 0;
  const brewScore = hasBrew ? Math.min(100, (brew / maxBrew) * 100) : 0;
  
  // Weighted composite (only count sources that have data)
  const sources = [hasNpm ? npmScore : null, hasStars ? starScore : null, hasPyPI ? pypiScore : null, hasBrew ? brewScore : null].filter(x => x !== null);
  const score = sources.length > 0 ? sources.reduce((a, b) => a + b, 0) / sources.length : 0;
  
  // Hype ratio
  const totalDownloads = (npm || 0) + (pypi || 0) + (brew || 0);
  const hypeRatio = totalDownloads > 0 ? ((stars || 0) / totalDownloads * 1000).toFixed(2) : null;
  
  // Data coverage
  const coverage = [hasNpm ? 'npm' : null, hasStars ? 'github' : null, hasPyPI ? 'pypi' : null, hasBrew ? 'brew' : null].filter(Boolean);
  
  return {
    growth_score: Math.round(score * 10) / 10,
    hype_ratio: hypeRatio,
    data_coverage: coverage,
    data_sources_count: coverage.length
  };
}

async function main() {
  console.log('Agent Adoption Tracker v2 — Fetching data...');
  console.log(`Time: ${new Date().toISOString()}`);
  
  const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
  const agents = [];
  
  for (const agent of config.agents) {
    console.log(`\nFetching: ${agent.name}`);
    
    const [npm, github, pypi, brew] = await Promise.all([
      getNpmDownloads(agent.npm),
      getGitHubData(agent.github),
      getPyPIDownloads(agent.pypi),
      getHomebrewInstalls(agent.homebrew)
    ]);
    
    const metrics = {
      npm_downloads: npm.value,
      github_stars: github.stars,
      github_forks: github.forks,
      github_open_issues: github.openIssues,
      pypi_downloads: pypi.value,
      homebrew_installs: brew.value
    };
    
    const computed = computeMetrics({ metrics });
    
    const entry = {
      id: agent.id,
      name: agent.name,
      metrics,
      data_reasons: {
        npm: npm.reason,
        github: github.reason,
        pypi: pypi.reason,
        homebrew: brew.reason
      },
      ...computed
    };
    
    agents.push(entry);
    
    const npmStr = npm.value !== null ? npm.value.toLocaleString() : 'n/a';
    const starsStr = github.stars !== null ? github.stars.toLocaleString() : 'n/a';
    const pypiStr = pypi.value !== null ? pypi.value.toLocaleString() : 'n/a';
    const brewStr = brew.value !== null ? brew.value.toLocaleString() : 'n/a';
    
    console.log(`  npm: ${npmStr} | GitHub: ${starsStr} ★ | PyPI: ${pypiStr} | Brew: ${brewStr} | Score: ${computed.growth_score}`);
    
    // Rate limiting
    await new Promise(r => setTimeout(r, 1000));
  }
  
  // Sort by growth score
  agents.sort((a, b) => b.growth_score - a.growth_score);
  agents.forEach((a, i) => { a.rank = i + 1; });
  
  const snapshot = {
    date: new Date().toISOString().split('T')[0],
    fetched_at: new Date().toISOString(),
    methodology_version: 'v2',
    agents: agents
  };
  
  const filename = `${snapshot.date}.json`;
  const filepath = path.join(SNAPSHOTS_DIR, filename);
  
  // Immutability check
  if (fs.existsSync(filepath)) {
    console.log(`\nSnapshot for ${snapshot.date} already exists. Skipping.`);
    return;
  }
  
  fs.writeFileSync(filepath, JSON.stringify(snapshot, null, 2));
  console.log(`\nSnapshot saved: ${filepath}`);
  console.log(`Total agents: ${agents.length}`);
  console.log(`Top 5:`);
  agents.slice(0, 5).forEach(a => {
    const npmStr = a.metrics.npm_downloads !== null ? a.metrics.npm_downloads.toLocaleString() : 'n/a';
    const starsStr = a.metrics.github_stars !== null ? a.metrics.github_stars.toLocaleString() : 'n/a';
    console.log(`  ${a.rank}. ${a.name} — Score: ${a.growth_score} | npm: ${npmStr} | Stars: ${starsStr} | Coverage: ${a.data_coverage.join(', ') || 'none'}`);
  });
}

main().catch(console.error);
