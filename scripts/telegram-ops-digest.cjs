#!/usr/bin/env node
/**
 * Telegram ops digest — the report format the operator expects.
 *
 * Articles Management
 *  1- N new articles created (title hyperlinks)
 *  2- N existing articles updated (title + ≤7 word note)
 *  3- N Articles deleted (omit section if 0)
 *  4- N New Interlinks (list only if < 5)
 *
 * Others
 *  1- new seo learning (omit if none new)
 *  2- leaderboard updates (omit if no change)
 *  3- automation errors (omit if none)
 *
 * Usage:
 *   node scripts/telegram-ops-digest.cjs              # since last state / 24h
 *   node scripts/telegram-ops-digest.cjs --days 2
 *   node scripts/telegram-ops-digest.cjs --since HEAD~20
 *   node scripts/telegram-ops-digest.cjs --dry         # print only, no Telegram
 *   node scripts/telegram-ops-digest.cjs --send        # force send if env set
 *   node scripts/telegram-ops-digest.cjs --no-state    # don't update state file
 *
 * Env: TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID (required unless --dry)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const https = require('https');

const ROOT = path.join(__dirname, '..');
const SITE = 'https://terminalblog.com';
const BLOG_GLOB = 'src/content/blog';
const STATE_PATH = path.join(ROOT, 'tmp', 'ops-digest-state.json');
const OUT_PATH = path.join(ROOT, 'tmp', 'ops-digest.html');

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT = process.env.TELEGRAM_CHAT_ID;

function hasFlag(f) {
  return process.argv.includes(f);
}
function argVal(f) {
  const i = process.argv.indexOf(f);
  return i >= 0 ? process.argv[i + 1] : null;
}

function sh(cmd, opts = {}) {
  try {
    let out = execSync(cmd, {
      cwd: ROOT,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
      maxBuffer: 20 * 1024 * 1024,
      ...opts,
    }).trim();
    // Strip ANSI escape codes that leak from git/terminal
    out = out.replace(/\x1b\[[0-9;]*[a-zA-Z]/g, '');
    return out;
  } catch (e) {
    if (opts.allowFail) {
      let out = (e.stdout || '').toString().trim();
      out = out.replace(/\x1b\[[0-9;]*[a-zA-Z]/g, '');
      return out;
    }
    throw e;
  }
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function loadState() {
  try {
    return JSON.parse(fs.readFileSync(STATE_PATH, 'utf8'));
  } catch {
    return {};
  }
}

function saveState(state) {
  fs.mkdirSync(path.dirname(STATE_PATH), { recursive: true });
  fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2));
}

function resolveSince(state) {
  if (argVal('--since')) return argVal('--since');
  const days = argVal('--days');
  if (days) return `${Math.max(1, parseInt(days, 10))} days ago`;
  if (state.lastSha) {
    // Validate sha still exists
    const ok = sh(`git cat-file -t ${state.lastSha}`, { allowFail: true });
    if (ok === 'commit') return state.lastSha;
  }
  return '24 hours ago';
}

function isBlogPath(p) {
  if (!p || !p.startsWith('src/content/blog/')) return false;
  if (!p.endsWith('.mdx')) return false;
  if (p.includes('/_archive/')) return false;
  return true;
}

function slugFromPath(p) {
  return path.basename(p, '.mdx');
}

function urlForSlug(slug) {
  return `${SITE}/blog/${slug}/`;
}

function parseTitle(filePath, fallbackSlug) {
  try {
    const abs = path.isAbsolute(filePath) ? filePath : path.join(ROOT, filePath);
    if (!fs.existsSync(abs)) return titleFromSlug(fallbackSlug);
    const raw = fs.readFileSync(abs, 'utf8');
    const m =
      raw.match(/^title:\s*["'](.+?)["']\s*$/m) ||
      raw.match(/^title:\s*(.+?)\s*$/m);
    if (m) return m[1].replace(/^["']|["']$/g, '').trim();
  } catch {
    /* ignore */
  }
  return titleFromSlug(fallbackSlug);
}

function titleFromSlug(slug) {
  return String(slug || 'untitled')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function titleFromDeletedBlob(oldContent, slug) {
  if (!oldContent) return titleFromSlug(slug);
  const m =
    oldContent.match(/^title:\s*["'](.+?)["']\s*$/m) ||
    oldContent.match(/^title:\s*(.+?)\s*$/m);
  if (m) return m[1].replace(/^["']|["']$/g, '').trim();
  return titleFromSlug(slug);
}

/** Git name-status since range */
function gitNameStatus(since) {
  // since can be sha or date expression
  const range = since.match(/^[0-9a-f]{7,40}$/i)
    ? `${since}..HEAD`
    : `--since="${since}"`;
  const out = sh(`git log ${range} --name-status --pretty=format: -- "${BLOG_GLOB}/*.mdx"`, {
    allowFail: true,
  });
  const added = new Map(); // path -> {sha hint}
  const modified = new Map();
  const deleted = new Map();

  for (const line of out.split('\n')) {
    const t = line.trim();
    if (!t) continue;
    // A\tpath | M\tpath | D\tpath | R100\told\tnew
    const parts = t.split('\t');
    const code = parts[0];
    if (!code) continue;
    if (code.startsWith('R') || code.startsWith('C')) {
      const from = parts[1];
      const to = parts[2];
      if (isBlogPath(from)) deleted.set(from, true);
      if (isBlogPath(to)) added.set(to, true);
      continue;
    }
    const p = parts[1];
    if (!isBlogPath(p)) continue;
    if (code.startsWith('A')) {
      added.set(p, true);
      deleted.delete(p);
    } else if (code.startsWith('D')) {
      if (!added.has(p)) deleted.set(p, true);
      modified.delete(p);
    } else if (code.startsWith('M')) {
      if (!added.has(p) && !deleted.has(p)) modified.set(p, true);
    }
  }

  // If a file was added and later modified in range, keep as new only
  for (const p of added.keys()) modified.delete(p);

  return {
    added: [...added.keys()],
    modified: [...modified.keys()],
    deleted: [...deleted.keys()],
  };
}

function wordCountCap(text, maxWords = 7) {
  const words = String(text || '')
    .replace(/[^\w\s\-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
  return words.slice(0, maxWords).join(' ');
}

function rangeArg(since) {
  return since.match(/^[0-9a-f]{7,40}$/i)
    ? `${since}..HEAD`
    : `--since="${since}"`;
}

function updateNoteForFile(filePath, since) {
  const range = rangeArg(since);
  // Prefer commit subjects that touched this file (fast — no patch)
  const log = sh(
    `git log ${range} --pretty=format:%s -- "${filePath}"`,
    { allowFail: true }
  );
  const subjects = log
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);

  // Prefer file-specific subjects; skip noisy monorepo mega-commits
  const skipSubject =
    /newsletter|beehiiv|seo learn|growth backlog|autopilot|telegram|workflow|full Telegram/i;
  for (const s of subjects) {
    if (skipSubject.test(s)) continue;
    let note = s
      .replace(/^(feat|fix|chore|docs|refactor|cron|content)(\(.+?\))?:\s*/i, '')
      .replace(/^just-shipped\s*/i, '')
      .trim();
    note = wordCountCap(note, 7);
    if (note && note.split(/\s+/).length >= 2) return note;
  }

  // Single-file numstat heuristic (still cheap)
  const num = sh(
    `git log ${range} --numstat --pretty=format: -- "${filePath}"`,
    { allowFail: true }
  );
  let plus = 0;
  let minus = 0;
  for (const line of num.split('\n')) {
    const m = line.match(/^(\d+)\s+(\d+)\s+/);
    if (m) {
      plus += parseInt(m[1], 10) || 0;
      minus += parseInt(m[2], 10) || 0;
    }
  }
  if (plus > 120 && minus < 40) return 'expanded body content';
  if (plus > 0 && minus > 0 && Math.abs(plus - minus) < 20) return 'minor edits';
  if (plus > 0) return 'content refreshed';
  return 'metadata update';
}

function extractInterlinks(since, files) {
  const range = rangeArg(since);
  const found = new Set();
  const re = /\/blog\/([a-z0-9][a-z0-9\-]*)\/?/gi;

  // Prefer scanning only changed files; cap to avoid huge history walks
  const targets = (files || []).filter(isBlogPath).slice(0, 40);
  if (!targets.length) return [];

  for (const file of targets) {
    // Use pickaxe for /blog/ only — much faster than full -p on all mdx
    const diff = sh(
      `git log ${range} -G "/blog/" -p --unified=0 --max-count=5 -- "${file}"`,
      { allowFail: true }
    );
    for (const line of diff.split('\n')) {
      if (!line.startsWith('+') || line.startsWith('+++')) continue;
      const text = line.slice(1);
      let m;
      re.lastIndex = 0;
      while ((m = re.exec(text))) {
        found.add(`${SITE}/blog/${m[1]}/`);
      }
    }
  }
  return [...found];
}

function loadSeoPoints(state) {
  const dir = path.join(ROOT, 'docs', 'seo-learnings');
  if (!fs.existsSync(dir)) return { points: [], fingerprint: null };
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .sort()
    .reverse();
  if (!files.length) return { points: [], fingerprint: null };
  const latest = path.join(dir, files[0]);
  const raw = fs.readFileSync(latest, 'utf8');
  const fingerprint = `${files[0]}:${raw.length}:${hashLite(raw)}`;
  if (state.lastSeoFingerprint === fingerprint) {
    return { points: [], fingerprint, isNew: false };
  }
  // Extract action bullets
  const points = [];
  for (const line of raw.split('\n')) {
    const m = line.match(/^\s*-\s+\*\*P[12]\*\*\s+(.+)$/);
    if (m) {
      let p = m[1]
        .replace(/`[^`]+`/g, '')
        .replace(/\s+/g, ' ')
        .trim();
      // shorten
      if (p.length > 120) p = p.slice(0, 117) + '…';
      points.push(p);
    }
  }
  // Also plain action lines under ## Actions
  if (!points.length) {
    let inActions = false;
    for (const line of raw.split('\n')) {
      if (/^##\s+Actions/i.test(line)) {
        inActions = true;
        continue;
      }
      if (/^##\s+/.test(line)) inActions = false;
      if (inActions && /^\s*-\s+/.test(line)) {
        points.push(line.replace(/^\s*-\s+/, '').trim().slice(0, 120));
      }
    }
  }
  return { points: points.slice(0, 8), fingerprint, isNew: true, file: files[0] };
}

function hashLite(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return (h >>> 0).toString(16);
}

function leaderboardDelta(state) {
  const dir = path.join(ROOT, 'src', 'data', 'adoption', 'snapshots');
  if (!fs.existsSync(dir)) return null;
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .sort();
  if (!files.length) return null;
  const latestName = files[files.length - 1];
  if (state.lastLeaderboardFile === latestName && !hasFlag('--force-leaderboard')) {
    return null; // no update since last digest
  }
  const latest = JSON.parse(fs.readFileSync(path.join(dir, latestName), 'utf8'));
  if (files.length < 2) {
    return {
      file: latestName,
      summary: `snapshot ${latestName.replace('.json', '')} recorded`,
    };
  }
  const prev = JSON.parse(
    fs.readFileSync(path.join(dir, files[files.length - 2]), 'utf8')
  );
  const byId = (arr) => {
    const m = new Map();
    for (const a of arr.agents || []) m.set(a.id, a);
    return m;
  };
  const A = byId(latest);
  const B = byId(prev);
  const movers = [];
  for (const [id, a] of A) {
    const b = B.get(id);
    if (!b) continue;
    const dr = (b.rank || 99) - (a.rank || 99);
    if (dr !== 0) {
      movers.push({
        name: a.name || id,
        dr,
        rank: a.rank,
      });
    }
  }
  movers.sort((x, y) => Math.abs(y.dr) - Math.abs(x.dr));
  if (!movers.length) {
    // check stars/downloads material change
    let starDelta = 0;
    for (const [id, a] of A) {
      const b = B.get(id);
      if (b) starDelta += Math.abs((a.github_stars || 0) - (b.github_stars || 0));
    }
    if (starDelta < 50) {
      return null; // effectively no meaningful change
    }
    return {
      file: latestName,
      summary: `stars moved (~${starDelta.toLocaleString()} total Δ)`,
    };
  }
  const top = movers.slice(0, 3).map((m) => {
    const arrow = m.dr > 0 ? '↑' : '↓';
    return `${m.name} ${arrow}${Math.abs(m.dr)} to #${m.rank}`;
  });
  return {
    file: latestName,
    summary: top.join('; '),
  };
}

function collectErrors() {
  const errors = [];

  // Health report
  const health = path.join(ROOT, 'tmp', 'health-report.txt');
  if (fs.existsSync(health)) {
    const t = fs.readFileSync(health, 'utf8');
    if (/\bFAIL\b/.test(t)) {
      const fails = t
        .split('\n')
        .filter((l) => /\bFAIL\b/.test(l))
        .slice(0, 5);
      for (const f of fails) errors.push(`health: ${f.trim().slice(0, 100)}`);
    }
  }

  // Hermes cron jobs (local machine only)
  const jobsPath = path.join(
    process.env.LOCALAPPDATA || '',
    'hermes',
    'cron',
    'jobs.json'
  );
  if (jobsPath && fs.existsSync(jobsPath)) {
    try {
      const jobs = JSON.parse(fs.readFileSync(jobsPath, 'utf8')).jobs || [];
      for (const j of jobs) {
        if (j.enabled === false || j.state === 'paused') continue;
        if (j.last_status === 'error' && j.last_error) {
          const msg = String(j.last_error).split('\n')[0].slice(0, 120);
          // Skip known non-actionable expected blocks
          if (/SEND_API_NOT_ENTERPRISE/i.test(msg)) continue;
          errors.push(`hermes ${j.name}: ${msg}`);
        }
      }
    } catch {
      /* ignore */
    }
  }

  // newsletter log (ignore expected Beehiiv Enterprise 403)
  const news = path.join(ROOT, 'tmp', 'newsletter-run.log');
  if (fs.existsSync(news)) {
    const t = fs.readFileSync(news, 'utf8');
    if (
      /ERROR|failed/i.test(t) &&
      !/SEND_API_NOT_ENTERPRISE|403.*Enterprise|expected/i.test(t)
    ) {
      errors.push('newsletter: send error (see tmp/newsletter-run.log)');
    }
  }

  return [...new Set(errors)].slice(0, 10);
}

/** Cap long lists so Telegram stays readable */
function listOrMore(items, render, cap = 12) {
  const lines = [];
  const show = items.slice(0, cap);
  for (const it of show) lines.push(render(it));
  if (items.length > cap) {
    lines.push(`<i>…and ${items.length - cap} more</i>`);
  }
  return lines;
}

function deletedTitle(filePath, since) {
  const range = since.match(/^[0-9a-f]{7,40}$/i)
    ? `${since}..HEAD`
    : `--since="${since}"`;
  // Try show file before delete
  const slug = slugFromPath(filePath);
  const show = sh(`git log ${range} --diff-filter=D -p -- "${filePath}"`, {
    allowFail: true,
  });
  // content in deleted file appears as -lines in full file delete
  const lines = [];
  for (const line of show.split('\n')) {
    if (line.startsWith('-') && !line.startsWith('---')) lines.push(line.slice(1));
  }
  return titleFromDeletedBlob(lines.join('\n'), slug);
}

function buildHtml(data) {
  const parts = [];
  const ts = new Date().toISOString().replace('T', ' ').slice(0, 16);

  // Summary line
  const summary = [];
  if (data.created.length) summary.push(`${data.created.length} new`);
  if (data.updated.length) summary.push(`${data.updated.length} updated`);
  if (data.deleted.length) summary.push(`${data.deleted.length} deleted`);
  if (data.interlinks.length) summary.push(`${data.interlinks.length} interlinks`);
  const summaryStr = summary.length ? summary.join(', ') : 'No content changes';

  parts.push(`📰 <b>terminalblog</b> · ${escapeHtml(ts)} UTC`);
  parts.push(`<i>${escapeHtml(summaryStr)}</i>`);
  parts.push('─'.repeat(22));
  parts.push('');

  // 1 new
  const nNew = data.created.length;
  if (nNew > 0) {
    parts.push(`<b>1-</b> <b>${nNew}</b> new article${nNew === 1 ? '' : 's'}`);
    parts.push('');
    parts.push(
      ...listOrMore(
        data.created,
        (a) => `• <a href="${escapeHtml(a.url)}">${escapeHtml(a.title)}</a>`
      )
    );
    parts.push('');
  }

  // 2 updated — group by note type
  const nUp = data.updated.length;
  if (nUp > 0) {
    // Group by note similarity
    const groups = {};
    for (const u of data.updated) {
      const key = u.note || 'metadata update';
      if (!groups[key]) groups[key] = [];
      groups[key].push(u);
    }

    // Sort groups by size descending
    const sorted = Object.entries(groups).sort((a, b) => b[1].length - a[1].length);

    parts.push(`<b>2-</b> <b>${nUp}</b> articles updated`);
    parts.push('');

    for (const [note, articles] of sorted) {
      if (articles.length === 1) {
        const a = articles[0];
        parts.push(`• <a href="${escapeHtml(a.url)}">${escapeHtml(a.title)}</a> — ${escapeHtml(note)}`);
      } else if (articles.length <= 3) {
        for (const a of articles) {
          parts.push(`• <a href="${escapeHtml(a.url)}">${escapeHtml(a.title)}</a>`);
        }
        parts.push(`  <i>${escapeHtml(note)}</i>`);
      } else {
        // Show first 2 + count
        for (const a of articles.slice(0, 2)) {
          parts.push(`• <a href="${escapeHtml(a.url)}">${escapeHtml(a.title)}</a>`);
        }
        parts.push(`  <i>+${articles.length - 2} more (${escapeHtml(note)})</i>`);
      }
    }
    parts.push('');
  }

  // 3 deleted — group and show count
  if (data.deleted.length > 0) {
    const nDel = data.deleted.length;
    parts.push(`<b>3-</b> <b>${nDel}</b> article${nDel === 1 ? '' : 's'} deleted`);
    parts.push('');
    // Show first 3 + count
    for (const a of data.deleted.slice(0, 3)) {
      parts.push(`• ${escapeHtml(a.title)}`);
    }
    if (nDel > 3) {
      parts.push(`<i>+${nDel - 3} more</i>`);
    }
    parts.push('');
  }

  // 4 interlinks — only show if < 5, otherwise just count
  const nLink = data.interlinks.length;
  if (nLink > 0 && nLink < 5) {
    parts.push(`<b>4-</b> <b>${nLink}</b> interlink${nLink === 1 ? '' : 's'}`);
    parts.push('');
    for (const u of data.interlinks) {
      const label = u.replace(/^https?:\/\/terminalblog\.com/, '') || u;
      parts.push(`• <a href="${escapeHtml(u)}">${escapeHtml(label)}</a>`);
    }
    parts.push('');
  } else if (nLink >= 5) {
    parts.push(`<b>4-</b> <b>${nLink}</b> interlinks added`);
    parts.push('');
  }

  // Others
  const others = [];
  if (data.seoPoints.length) {
    let block = `<b>1-</b> new seo learning\n`;
    for (const p of data.seoPoints) {
      block += `• ${escapeHtml(p)}\n`;
    }
    others.push(block.trimEnd());
  }
  if (data.leaderboard) {
    others.push(
      `<b>${others.length + 1}-</b> leaderboard updates\n${escapeHtml(data.leaderboard.summary)}`
    );
  }
  if (data.errors.length) {
    let block = `<b>${others.length + 1}-</b> automation errors\n`;
    for (const e of data.errors) {
      block += `• ${escapeHtml(e)}\n`;
    }
    others.push(block.trimEnd());
  }

  if (others.length) {
    parts.push('');
    parts.push('─'.repeat(22));
    parts.push(`<b>Others</b>`);
    parts.push('');
    parts.push(others.join('\n\n'));
  }

  return parts.join('\n');
}

function sendTelegram(html) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      chat_id: CHAT,
      text: html,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    });
    const req = https.request(
      {
        hostname: 'api.telegram.org',
        path: `/bot${TOKEN}/sendMessage`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
        },
      },
      (res) => {
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(JSON.parse(data || '{}'));
          } else {
            reject(new Error(`Telegram ${res.statusCode}: ${data}`));
          }
        });
      }
    );
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function main() {
  const dry = hasFlag('--dry') || (!(TOKEN && CHAT) && !hasFlag('--send'));
  const state = loadState();
  const since = resolveSince(state);

  process.stderr.write(`ops-digest since: ${since}\n`);

  const ns = gitNameStatus(since);

  const NOTE_CAP = 15; // only resolve notes for rows we might list

  const created = ns.added.map((p) => {
    const slug = slugFromPath(p);
    return {
      path: p,
      slug,
      title: parseTitle(p, slug),
      url: urlForSlug(slug),
    };
  });

  const updated = ns.modified.map((p, i) => {
    const slug = slugFromPath(p);
    return {
      path: p,
      slug,
      title: parseTitle(p, slug),
      url: urlForSlug(slug),
      note: i < NOTE_CAP ? updateNoteForFile(p, since) : 'content refreshed',
    };
  });

  const deleted = ns.deleted.map((p, i) => {
    const slug = slugFromPath(p);
    return {
      path: p,
      slug,
      title: i < NOTE_CAP ? deletedTitle(p, since) : titleFromSlug(slug),
    };
  });

  const interlinks = extractInterlinks(since, [
    ...ns.added,
    ...ns.modified,
  ]);
  const seo = loadSeoPoints(state);
  const lb = leaderboardDelta(state);
  const errors = collectErrors();

  const data = {
    created,
    updated,
    deleted,
    interlinks,
    seoPoints: seo.isNew === false ? [] : seo.points,
    leaderboard: lb,
    errors,
    since,
  };

  // Empty digest? still send a short "quiet day" unless --skip-empty
  const html = buildHtml(data);

  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, html, 'utf8');
  // also plain log for Actions artifacts
  fs.writeFileSync(
    path.join(ROOT, 'tmp', 'ops-digest-meta.json'),
    JSON.stringify(
      {
        since,
        created: created.length,
        updated: updated.length,
        deleted: deleted.length,
        interlinks: interlinks.length,
        seo: data.seoPoints.length,
        leaderboard: !!lb,
        errors: errors.length,
      },
      null,
      2
    )
  );

  console.log(html);

  const shouldSend =
    hasFlag('--send') || (!hasFlag('--dry') && TOKEN && CHAT);
  if (shouldSend && TOKEN && CHAT) {
    // Telegram max ~4096; chunk if needed
    const chunks = [];
    let s = html;
    const size = 3500;
    while (s.length > size) {
      let cut = s.lastIndexOf('\n', size);
      if (cut < size * 0.4) cut = size;
      chunks.push(s.slice(0, cut));
      s = s.slice(cut).trimStart();
    }
    if (s) chunks.push(s);
    for (let i = 0; i < chunks.length; i++) {
      const body =
        chunks.length > 1
          ? `<i>Part ${i + 1}/${chunks.length}</i>\n` + chunks[i]
          : chunks[i];
      const r = await sendTelegram(body);
      console.error('sent', r?.result?.message_id || 'ok');
    }
  } else {
    console.error('(dry — not sent to Telegram)');
  }

  if (!hasFlag('--no-state')) {
    const head = sh('git rev-parse HEAD', { allowFail: true }) || state.lastSha;
    saveState({
      ...state,
      lastSha: head,
      lastRunAt: new Date().toISOString(),
      lastSeoFingerprint: seo.fingerprint || state.lastSeoFingerprint,
      lastLeaderboardFile: lb ? lb.file : state.lastLeaderboardFile,
    });
  }
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
