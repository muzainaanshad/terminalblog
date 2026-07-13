#!/usr/bin/env node
/**
 * OSS Coding Agent Adoption Tracker v3
 *
 * Signals:
 *  - npm weekly downloads
 *  - PyPI weekly downloads (pypistats → pepy.tech fallback)
 *  - GitHub stars, forks, open issues
 *  - GitHub commits (30d) + issues opened (30d) via Search API
 *  - Reddit subscribers (public about.json)
 *  - X/Twitter followers (syndication endpoint; optional)
 *
 * Filters closed-source / sparse-data agents out of the main board.
 * Falls back to previous snapshot values when APIs rate-limit or fail.
 *
 * Usage:
 *   node scripts/fetch-adoption-data.cjs
 *   node scripts/fetch-adoption-data.cjs --force   # overwrite today's snapshot
 *   GITHUB_TOKEN=... node scripts/fetch-adoption-data.cjs
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { scoreAgents, hasEnoughData } = require('./lib/adoption-score.cjs');

const ROOT = path.join(__dirname, '..');
const CONFIG_PATH = path.join(ROOT, 'src', 'data', 'adoption', 'config.json');
const SNAPSHOTS_DIR = path.join(ROOT, 'src', 'data', 'adoption', 'snapshots');
const FORCE = process.argv.includes('--force');

if (!fs.existsSync(SNAPSHOTS_DIR)) {
  fs.mkdirSync(SNAPSHOTS_DIR, { recursive: true });
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function fetchJSON(url, extraHeaders = {}, { useGithubToken = true } = {}) {
  return new Promise((resolve, reject) => {
    const headers = {
      'User-Agent': 'terminalblog-adoption-tracker/3 (+https://terminalblog.com)',
      Accept: 'application/json',
      ...extraHeaders,
    };
    const isGh = url.includes('api.github.com');
    if (isGh && useGithubToken && process.env.GITHUB_TOKEN) {
      headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    }
    const req = https.get(url, { headers }, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        // Bad token → retry once without Authorization
        if (
          isGh &&
          useGithubToken &&
          process.env.GITHUB_TOKEN &&
          res.statusCode === 401
        ) {
          fetchJSON(url, extraHeaders, { useGithubToken: false })
            .then(resolve)
            .catch(reject);
          return;
        }
        if (res.statusCode === 403 || res.statusCode === 429) {
          reject(new Error(`HTTP ${res.statusCode} rate limit`));
          return;
        }
        if (res.statusCode && res.statusCode >= 400) {
          reject(new Error(`HTTP ${res.statusCode}: ${data.slice(0, 120)}`));
          return;
        }
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`Parse error: ${e.message}`));
        }
      });
    });
    req.on('error', reject);
    req.setTimeout(15000, () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
  });
}

function daysAgoISO(days) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
}

async function getNpmDownloads(pkg) {
  if (!pkg) return { value: null, reason: 'No npm package', source: null };
  try {
    const data = await fetchJSON(
      `https://api.npmjs.org/downloads/point/last-week/${encodeURIComponent(pkg)}`
    );
    return { value: data.downloads ?? 0, reason: null, source: 'npmjs' };
  } catch (e) {
    return { value: null, reason: e.message, source: null };
  }
}

async function getPyPIDownloads(pkg) {
  if (!pkg) return { value: null, reason: 'No PyPI package', source: null };
  // Primary: pypistats
  try {
    await sleep(800);
    const data = await fetchJSON(
      `https://pypistats.org/api/packages/${encodeURIComponent(pkg)}/recent`
    );
    if (data?.data?.last_week != null) {
      return {
        value: data.data.last_week,
        reason: null,
        source: 'pypistats',
      };
    }
  } catch (e) {
    // fall through
  }
  // Fallback: pepy.tech
  try {
    await sleep(500);
    const data = await fetchJSON(
      `https://api.pepy.tech/api/v2/projects/${encodeURIComponent(pkg)}`
    );
    // pepy returns downloads per day map; sum last 7
    const downloads = data?.downloads || data?.total_downloads;
    if (typeof downloads === 'number') {
      return {
        value: Math.round(downloads / 52), // rough weekly if total lifetime
        reason: 'pepy total approx weekly',
        source: 'pepy',
      };
    }
    if (downloads && typeof downloads === 'object') {
      const days = Object.keys(downloads).sort().slice(-7);
      let sum = 0;
      for (const d of days) {
        const v = downloads[d];
        if (typeof v === 'number') sum += v;
        else if (v && typeof v === 'object')
          sum += Object.values(v).reduce((a, b) => a + (Number(b) || 0), 0);
      }
      return { value: sum, reason: null, source: 'pepy' };
    }
  } catch (e) {
    return { value: null, reason: e.message, source: null };
  }
  return { value: null, reason: 'No PyPI stats', source: null };
}

async function getGitHubRepo(repo) {
  if (!repo) {
    return {
      stars: null,
      forks: null,
      openIssues: null,
      reason: 'No public repo',
    };
  }
  try {
    const data = await fetchJSON(`https://api.github.com/repos/${repo}`);
    if (data.message === 'Not Found') {
      return {
        stars: null,
        forks: null,
        openIssues: null,
        reason: 'Repo not found',
      };
    }
    return {
      stars: data.stargazers_count ?? 0,
      forks: data.forks_count ?? 0,
      openIssues: data.open_issues_count ?? 0,
      reason: null,
    };
  } catch (e) {
    return {
      stars: null,
      forks: null,
      openIssues: null,
      reason: e.message,
    };
  }
}

async function fetchJSONMaybeEmpty(url, extraHeaders = {}) {
  // stats endpoints often return 202 + {} while computing
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const data = await fetchJSON(url, extraHeaders);
      if (data && (Array.isArray(data) || Object.keys(data).length > 0)) {
        return data;
      }
    } catch (e) {
      if (attempt === 2) throw e;
    }
    await sleep(1200 * (attempt + 1));
  }
  return null;
}

async function countCommitsByList(repo, sinceISO) {
  // Page through commits API (cap pages to avoid abuse)
  let page = 1;
  let total = 0;
  const since = `${sinceISO}T00:00:00Z`;
  while (page <= 5) {
    const url = `https://api.github.com/repos/${repo}/commits?since=${encodeURIComponent(since)}&per_page=100&page=${page}`;
    const data = await fetchJSON(url);
    if (!Array.isArray(data) || data.length === 0) break;
    total += data.length;
    if (data.length < 100) break;
    page++;
    await sleep(250);
  }
  return total;
}

async function getGitHubCommits30d(repo) {
  if (!repo) return { value: null, reason: 'No repo' };
  const since = daysAgoISO(30);
  // 1) commits list (reliable with token)
  try {
    const n = await countCommitsByList(repo, since);
    if (n > 0 || n === 0) {
      return { value: n, reason: null, source: 'github-commits-list' };
    }
  } catch (e) {
    /* try next */
  }
  // 2) participation stats (last 4 weeks)
  try {
    const part = await fetchJSONMaybeEmpty(
      `https://api.github.com/repos/${repo}/stats/participation`
    );
    if (part?.all && Array.isArray(part.all)) {
      const last4 = part.all.slice(-4);
      const sum = last4.reduce((a, b) => a + (Number(b) || 0), 0);
      return { value: sum, reason: null, source: 'github-participation' };
    }
  } catch (e) {
    /* try next */
  }
  // 3) search API last resort
  try {
    const q = encodeURIComponent(`repo:${repo} committer-date:>=${since}`);
    const data = await fetchJSON(
      `https://api.github.com/search/commits?q=${q}&per_page=1`,
      { Accept: 'application/vnd.github+json' }
    );
    if (typeof data.total_count === 'number') {
      return { value: data.total_count, reason: null, source: 'github-search' };
    }
  } catch (e) {
    return { value: null, reason: e.message };
  }
  return { value: null, reason: 'No commit stats' };
}

async function getIssuesOpened30d(repo) {
  if (!repo) return { value: null, reason: 'No repo' };
  const since = daysAgoISO(30);
  // Prefer search; fallback open_issues only as weak signal
  try {
    const q = encodeURIComponent(`repo:${repo} is:issue created:>=${since}`);
    const data = await fetchJSON(
      `https://api.github.com/search/issues?q=${q}&per_page=1`
    );
    if (typeof data.total_count === 'number') {
      return { value: data.total_count, reason: null, source: 'github-search' };
    }
  } catch (e) {
    try {
      // Third-party-ish fallback: GH events is noisy; use open issues as proxy
      const repoData = await fetchJSON(`https://api.github.com/repos/${repo}`);
      if (typeof repoData.open_issues_count === 'number') {
        return {
          value: null,
          reason: `issues search failed (${e.message}); open_issues kept separately`,
          source: null,
        };
      }
    } catch {
      /* ignore */
    }
    return { value: null, reason: e.message };
  }
  return { value: null, reason: 'No issue stats' };
}

async function getRedditSubscribers(subreddit) {
  if (!subreddit) return { value: null, reason: 'No subreddit' };
  const name = String(subreddit).replace(/^r\//, '');
  try {
    const data = await fetchJSON(
      `https://www.reddit.com/r/${encodeURIComponent(name)}/about.json`
    );
    const subs = data?.data?.subscribers;
    if (typeof subs === 'number') {
      return { value: subs, reason: null, source: 'reddit' };
    }
  } catch (e) {
    return { value: null, reason: e.message };
  }
  return { value: null, reason: 'No reddit data' };
}

async function getXFollowers(handle) {
  if (!handle) return { value: null, reason: 'No X handle' };
  const screen = String(handle).replace(/^@/, '');
  // Public syndication endpoint (third-party style; may break)
  try {
    const data = await fetchJSON(
      `https://cdn.syndication.twimg.com/widgets/followbutton/info.json?screen_names=${encodeURIComponent(screen)}`
    );
    const row = Array.isArray(data) ? data[0] : data;
    if (row && typeof row.followers_count === 'number') {
      return { value: row.followers_count, reason: null, source: 'twitter-syndication' };
    }
  } catch (e) {
    return { value: null, reason: e.message, source: null };
  }
  return { value: null, reason: 'X count unavailable', source: null };
}

function loadPreviousSnapshot() {
  const files = fs
    .readdirSync(SNAPSHOTS_DIR)
    .filter((f) => f.endsWith('.json'))
    .sort()
    .reverse();
  if (!files.length) return null;
  try {
    return JSON.parse(
      fs.readFileSync(path.join(SNAPSHOTS_DIR, files[0]), 'utf8')
    );
  } catch {
    return null;
  }
}

function prevMetric(prevSnap, id, key) {
  const a = prevSnap?.agents?.find((x) => x.id === id);
  if (!a) return null;
  if (a.metrics && a.metrics[key] != null) return a.metrics[key];
  if (a[key] != null) return a[key];
  return null;
}

function coalesce(primary, fallback, reasonIfFallback) {
  if (primary.value != null) return { ...primary, stale: false };
  if (fallback != null) {
    return {
      value: fallback,
      reason: reasonIfFallback || primary.reason || 'stale snapshot',
      source: 'previous-snapshot',
      stale: true,
    };
  }
  return { ...primary, stale: false };
}

async function fetchAgent(agent, prevSnap) {
  console.log(`\nFetching: ${agent.name} (${agent.id})`);

  const npm = coalesce(
    await getNpmDownloads(agent.npm),
    prevMetric(prevSnap, agent.id, 'npm_downloads'),
    'npm failed; using previous snapshot'
  );
  await sleep(200);

  const gh = await getGitHubRepo(agent.github);
  const stars = coalesce(
    { value: gh.stars, reason: gh.reason },
    prevMetric(prevSnap, agent.id, 'github_stars'),
    'github failed; using previous snapshot'
  );
  const forks = coalesce(
    { value: gh.forks, reason: gh.reason },
    prevMetric(prevSnap, agent.id, 'github_forks'),
    'github failed; using previous snapshot'
  );
  const openIssues = coalesce(
    { value: gh.openIssues, reason: gh.reason },
    prevMetric(prevSnap, agent.id, 'github_open_issues'),
    'github failed; using previous snapshot'
  );
  await sleep(300);

  const commits = coalesce(
    await getGitHubCommits30d(agent.github),
    prevMetric(prevSnap, agent.id, 'commits_30d'),
    'commits failed; using previous snapshot'
  );
  await sleep(400);

  const issuesOpened = coalesce(
    await getIssuesOpened30d(agent.github),
    prevMetric(prevSnap, agent.id, 'issues_opened_30d'),
    'issues search failed; using previous snapshot'
  );
  await sleep(300);

  const pypi = coalesce(
    await getPyPIDownloads(agent.pypi),
    prevMetric(prevSnap, agent.id, 'pypi_downloads'),
    'pypi failed; using previous snapshot'
  );
  await sleep(200);

  const reddit = coalesce(
    await getRedditSubscribers(agent.reddit),
    prevMetric(prevSnap, agent.id, 'reddit_subscribers'),
    'reddit failed; using previous snapshot'
  );
  await sleep(200);

  const x = coalesce(
    await getXFollowers(agent.twitter),
    prevMetric(prevSnap, agent.id, 'x_followers'),
    'x failed; using previous snapshot'
  );

  const metrics = {
    npm_downloads: npm.value,
    pypi_downloads: pypi.value,
    github_stars: stars.value,
    github_forks: forks.value,
    github_open_issues: openIssues.value,
    commits_30d: commits.value,
    issues_opened_30d: issuesOpened.value,
    reddit_subscribers: reddit.value,
    x_followers: x.value,
  };

  const entry = {
    id: agent.id,
    name: agent.name,
    open_source: true,
    pricing_label: agent.pricing_label || null,
    price_index: agent.price_index ?? 1,
    benefit_notes: agent.benefit_notes || null,
    github: agent.github || null,
    metrics,
    data_reasons: {
      npm: npm.reason,
      pypi: pypi.reason,
      github: gh.reason,
      commits: commits.reason,
      issues_opened: issuesOpened.reason,
      reddit: reddit.reason,
      x: x.reason,
    },
    data_sources_detail: {
      npm: npm.source,
      pypi: pypi.source,
      commits: commits.source,
      reddit: reddit.source,
      x: x.source,
    },
    stale_fields: Object.entries({
      npm_downloads: npm.stale,
      pypi_downloads: pypi.stale,
      github_stars: stars.stale,
      commits_30d: commits.stale,
      issues_opened_30d: issuesOpened.stale,
      reddit_subscribers: reddit.stale,
      x_followers: x.stale,
    })
      .filter(([, v]) => v)
      .map(([k]) => k),
  };

  console.log(
    `  ★ ${metrics.github_stars ?? '—'} | forks ${metrics.github_forks ?? '—'} | commits30d ${metrics.commits_30d ?? '—'} | issues30d ${metrics.issues_opened_30d ?? '—'} | npm ${metrics.npm_downloads ?? '—'} | pypi ${metrics.pypi_downloads ?? '—'} | reddit ${metrics.reddit_subscribers ?? '—'} | x ${metrics.x_followers ?? '—'}`
  );

  return entry;
}

async function main() {
  console.log('Agent Adoption Tracker v3 — OSS multi-signal');
  console.log(`Time: ${new Date().toISOString()}`);

  const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
  const prevSnap = loadPreviousSnapshot();
  const raw = [];

  for (const agent of config.agents) {
    if (agent.open_source === false) {
      console.log(`Skip closed-source: ${agent.id}`);
      continue;
    }
    try {
      raw.push(await fetchAgent(agent, prevSnap));
    } catch (e) {
      console.error(`Failed ${agent.id}:`, e.message);
    }
    await sleep(500);
  }

  // Filter sparse data
  const eligible = raw.filter((a) => hasEnoughData(a, 2));
  const dropped = raw
    .filter((a) => !hasEnoughData(a, 2))
    .map((a) => ({ id: a.id, name: a.name, reason: 'fewer than 2 strong signals' }));

  const scored = scoreAgents(eligible);

  const snapshot = {
    date: new Date().toISOString().split('T')[0],
    fetched_at: new Date().toISOString(),
    methodology_version: 'v3-oss-multisignal',
    weights: require('./lib/adoption-score.cjs').WEIGHTS,
    excluded_config: config.excluded || [],
    dropped_sparse: dropped,
    agents: scored,
  };

  // Flatten common fields for page compatibility
  for (const a of snapshot.agents) {
    a.npm_downloads = a.metrics.npm_downloads;
    a.github_stars = a.metrics.github_stars;
    a.github_forks = a.metrics.github_forks;
    a.pypi_downloads = a.metrics.pypi_downloads;
    a.commits_30d = a.metrics.commits_30d;
    a.issues_opened_30d = a.metrics.issues_opened_30d;
    a.github_open_issues = a.metrics.github_open_issues;
    a.reddit_subscribers = a.metrics.reddit_subscribers;
    a.x_followers = a.metrics.x_followers;
    a.growth_score = a.adoption_score;
  }

  const filename = `${snapshot.date}.json`;
  const filepath = path.join(SNAPSHOTS_DIR, filename);

  if (fs.existsSync(filepath) && !FORCE) {
    // Always allow writing a -v3 sidecar if today exists from v2
    const alt = path.join(SNAPSHOTS_DIR, `${snapshot.date}-v3.json`);
    fs.writeFileSync(alt, JSON.stringify(snapshot, null, 2));
    console.log(`\nToday's snapshot exists; wrote ${alt} (use --force to overwrite date file)`);
  } else {
    fs.writeFileSync(filepath, JSON.stringify(snapshot, null, 2));
    console.log(`\nSnapshot saved: ${filepath}`);
  }

  console.log(`Board agents: ${scored.length} (dropped sparse: ${dropped.length})`);
  console.log('Top 8:');
  scored.slice(0, 8).forEach((a) => {
    console.log(
      `  ${a.rank}. ${a.name} — adopt ${a.adoption_score} · value ${a.value_score} (${a.price_tier}) · signals ${a.data_sources}`
    );
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
