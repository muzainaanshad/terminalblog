#!/usr/bin/env node
/**
 * Agent Adoption Tracker — Data Fetcher
 * Fetches npm downloads, GitHub stars, PyPI downloads for all agents
 * Saves daily snapshots to src/data/adoption/snapshots/
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const CONFIG_PATH = path.join(__dirname, '..', 'src', 'data', 'adoption', 'config.json');
const SNAPSHOTS_DIR = path.join(__dirname, '..', 'src', 'data', 'adoption', 'snapshots');

// Ensure snapshots directory exists
if (!fs.existsSync(SNAPSHOTS_DIR)) {
  fs.mkdirSync(SNAPSHOTS_DIR, { recursive: true });
}

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    const headers = { 'User-Agent': 'terminalblog-adoption-tracker' };
    // Use GitHub token if available
    if (url.includes('api.github.com') && process.env.GITHUB_TOKEN) {
      headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
    }
    const req = https.get(url, { headers }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`Parse error for ${url}: ${e.message}`));
        }
      });
    });
    req.on('error', reject);
    req.setTimeout(10000, () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

async function getNpmDownloads(pkg) {
  if (!pkg) return null;
  try {
    const data = await fetchJSON(`https://api.npmjs.org/downloads/point/last-week/${pkg}`);
    return data.downloads || 0;
  } catch (e) {
    console.error(`  npm error for ${pkg}: ${e.message}`);
    return 0;
  }
}

async function getGitHubStars(repo) {
  if (!repo) return { stars: 0, forks: 0 };
  try {
    const data = await fetchJSON(`https://api.github.com/repos/${repo}`);
    return { stars: data.stargazers_count || 0, forks: data.forks_count || 0 };
  } catch (e) {
    console.error(`  GitHub error for ${repo}: ${e.message}`);
    return { stars: 0, forks: 0 };
  }
}

async function getPyPIDownloads(pkg) {
  if (!pkg) return null;
  try {
    const data = await fetchJSON(`https://pypistats.org/api/packages/${pkg}/recent`);
    return data.data?.last_week || 0;
  } catch (e) {
    console.error(`  PyPI error for ${pkg}: ${e.message}`);
    return 0;
  }
}

function computeGrowthScore(agent) {
  const npm = agent.npm_downloads || 0;
  const stars = agent.github_stars || 0;
  const pypi = agent.pypi_downloads || 0;
  
  // Normalize each metric to 0-100 scale
  const maxNpm = 10000000; // 10M
  const maxStars = 400000; // 400K
  const maxPyPI = 100000; // 100K
  
  const npmScore = Math.min(100, (npm / maxNpm) * 100);
  const starScore = Math.min(100, (stars / maxStars) * 100);
  const pypiScore = Math.min(100, (pypi / maxPyPI) * 100);
  
  // Weighted composite
  const score = (npmScore * 0.4) + (starScore * 0.3) + (pypiScore * 0.2) + 
                ((starScore > 0 && npmScore > 0) ? Math.min(10, (starScore / npmScore) * 2) : 0);
  
  // Star/download ratio (hype vs reality)
  const totalDownloads = npm + pypi;
  const starDownloadRatio = totalDownloads > 0 ? (stars / totalDownloads * 1000).toFixed(2) : 'N/A';
  
  return {
    growth_score: Math.round(score * 10) / 10,
    star_download_ratio: starDownloadRatio
  };
}

async function main() {
  console.log('Agent Adoption Tracker — Fetching data...');
  console.log(`Time: ${new Date().toISOString()}`);
  
  const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
  const agents = [];
  
  for (const agent of config.agents) {
    console.log(`\nFetching: ${agent.name}`);
    
    const [npm, github, pypi] = await Promise.all([
      getNpmDownloads(agent.npm),
      getGitHubStars(agent.github),
      getPyPIDownloads(agent.pypi)
    ]);
    
    const computed = computeGrowthScore({
      npm_downloads: npm,
      github_stars: github.stars,
      pypi_downloads: pypi
    });
    
    const entry = {
      id: agent.id,
      name: agent.name,
      npm_downloads: npm,
      github_stars: github.stars,
      github_forks: github.forks,
      pypi_downloads: pypi,
      ...computed
    };
    
    agents.push(entry);
    console.log(`  npm: ${npm?.toLocaleString() || 'N/A'} | GitHub: ${github.stars.toLocaleString()} stars | PyPI: ${pypi?.toLocaleString() || 'N/A'} | Score: ${computed.growth_score}`);
    
    // Rate limiting - GitHub API
    await new Promise(r => setTimeout(r, 1000));
  }
  
  // Sort by growth score
  agents.sort((a, b) => b.growth_score - a.growth_score);
  
  // Add ranks
  agents.forEach((a, i) => { a.rank = i + 1; });
  
  const snapshot = {
    date: new Date().toISOString().split('T')[0],
    fetched_at: new Date().toISOString(),
    agents: agents
  };
  
  // Save snapshot
  const filename = `${snapshot.date}.json`;
  const filepath = path.join(SNAPSHOTS_DIR, filename);
  fs.writeFileSync(filepath, JSON.stringify(snapshot, null, 2));
  
  console.log(`\nSnapshot saved: ${filepath}`);
  console.log(`Total agents: ${agents.length}`);
  console.log(`Top 3:`);
  agents.slice(0, 3).forEach(a => {
    console.log(`  ${a.rank}. ${a.name} — Score: ${a.growth_score} | npm: ${a.npm_downloads?.toLocaleString() || 'N/A'} | Stars: ${a.github_stars.toLocaleString()}`);
  });
}

main().catch(console.error);
