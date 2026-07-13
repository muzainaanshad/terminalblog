/**
 * Pure scoring helpers for the OSS coding-agent leaderboard.
 * Used by fetch-adoption-data.cjs and unit tests.
 */

function maxOf(agents, key) {
  let m = 0;
  for (const a of agents) {
    const v = metric(a, key);
    if (typeof v === 'number' && v > m) m = v;
  }
  return m || 1;
}

function metric(agent, key) {
  if (agent?.metrics && agent.metrics[key] != null) return agent.metrics[key];
  if (agent && agent[key] != null) return agent[key];
  return null;
}

function norm(value, max) {
  if (value == null || max <= 0) return 0;
  return Math.min(100, (Number(value) / max) * 100);
}

/**
 * Weights for multi-signal adoption (must sum to 1).
 * Emphasizes real usage + repo health over pure stars.
 */
const WEIGHTS = {
  package_downloads: 0.28, // npm + pypi combined
  github_stars: 0.18,
  github_forks: 0.1,
  commits_30d: 0.16,
  issues_signal: 0.1, // open issues + issues opened 30d
  social: 0.08, // reddit + x followers
  data_coverage: 0.1, // reward agents with more real signals
};

/**
 * @param {object[]} agents - snapshot agent entries with metrics
 * @returns {object[]} agents with adoption_score, value_score, price_tier, rank
 */
function scoreAgents(agents) {
  const list = agents.map((a) => ({ ...a, metrics: { ...(a.metrics || {}) } }));

  for (const a of list) {
    const npm = metric(a, 'npm_downloads') || 0;
    const pypi = metric(a, 'pypi_downloads') || 0;
    a.metrics.package_downloads = npm + pypi;
    const openIss = metric(a, 'github_open_issues') || 0;
    const opened = metric(a, 'issues_opened_30d') || 0;
    a.metrics.issues_signal = openIss + opened * 2;
    const reddit = metric(a, 'reddit_subscribers') || 0;
    const x = metric(a, 'x_followers') || 0;
    a.metrics.social = reddit + x;
  }

  const maxPkg = maxOf(list, 'package_downloads');
  const maxStars = maxOf(list, 'github_stars');
  const maxForks = maxOf(list, 'github_forks');
  const maxCommits = maxOf(list, 'commits_30d');
  const maxIssues = maxOf(list, 'issues_signal');
  const maxSocial = maxOf(list, 'social');

  for (const a of list) {
    const coverageKeys = [
      'package_downloads',
      'github_stars',
      'github_forks',
      'commits_30d',
      'issues_signal',
      'social',
    ];
    let covered = 0;
    for (const k of coverageKeys) {
      const v = metric(a, k);
      if (v != null && v > 0) covered++;
    }
    const coverageScore = (covered / coverageKeys.length) * 100;

    const adoption =
      norm(metric(a, 'package_downloads'), maxPkg) * WEIGHTS.package_downloads +
      norm(metric(a, 'github_stars'), maxStars) * WEIGHTS.github_stars +
      norm(metric(a, 'github_forks'), maxForks) * WEIGHTS.github_forks +
      norm(metric(a, 'commits_30d'), maxCommits) * WEIGHTS.commits_30d +
      norm(metric(a, 'issues_signal'), maxIssues) * WEIGHTS.issues_signal +
      norm(metric(a, 'social'), maxSocial) * WEIGHTS.social +
      coverageScore * WEIGHTS.data_coverage;

    a.adoption_score = Math.round(adoption * 10) / 10;
    a.data_sources = covered;

    const price = Math.max(1, Number(a.price_index) || 1);
    // Higher = more adoption per unit cost
    a.value_score = Math.round((a.adoption_score / price) * 10) / 10;
    a.price_tier =
      price <= 1 ? 'low' : price === 2 ? 'mid' : price >= 4 ? 'high' : 'mid-high';
  }

  list.sort((x, y) => y.adoption_score - x.adoption_score);
  list.forEach((a, i) => {
    a.rank = i + 1;
  });
  return list;
}

function hasEnoughData(agent, minSignals = 2) {
  const keys = [
    'npm_downloads',
    'pypi_downloads',
    'github_stars',
    'commits_30d',
    'github_forks',
  ];
  let n = 0;
  for (const k of keys) {
    const v = metric(agent, k);
    if (v != null && Number(v) > 0) n++;
  }
  return n >= minSignals;
}

module.exports = {
  WEIGHTS,
  scoreAgents,
  hasEnoughData,
  metric,
  maxOf,
  norm,
};
