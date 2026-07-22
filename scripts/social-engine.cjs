#!/usr/bin/env node
/**
 * social-engine.cjs — S.G.T.M.S. Social Media Engine
 * 
 * Generates and schedules posts via MyMarky API.
 * 
 * Usage:
 *   node scripts/social-engine.cjs --batch N    # Schedule N Twitter posts
 *   node scripts/social-engine.cjs --linkedin   # Schedule 1 LinkedIn post
 *   node scripts/social-engine.cjs --dry-run    # Preview without scheduling
 */

const https = require('https');
const http = require('http');

// ── Config ──────────────────────────────────────────────────────────────
const BIZ_ID = '598a98f9-9ff9-4fa5-90a2-2ad0e313417e';
const API_KEY = 'mk_live_w61K61zmWDi-I-pviWXoYQX7UmU2mJ-xOAVyNdsKVpY';
const API_BASE = 'https://api.mymarky.ai';

// Schedule slots (UTC) — these are Saudi morning slots
// 9 AM SAST = 6 AM UTC, 1 PM SAST = 10 AM UTC, 5 PM SAST = 2 PM UTC
const TWITTER_SLOTS_UTC = [
  'T06:00:00Z',  // 9 AM Saudi
  'T10:00:00Z',  // 1 PM Saudi
  'T14:00:00Z',  // 5 PM Saudi
];

const LINKEDIN_SLOT_UTC = 'T08:00:00Z'; // 11 AM Saudi

// ── Content Library ─────────────────────────────────────────────────────
// Rotate formats: hot_take, stop_paying, nobody_tells_you, cant_believe,
//                 why_nobody, git_history, mistake_list

const TWITTER_POSTS = [
  // ── hot_take ──
  {
    format: 'hot_take',
    text: 'Hot take: most code reviews are just performance art.\n\nThe reviewer approves everything anyway.\nThe author already knows the issues.\nBoth sides pretend it matters.\n\nThe real review happens in the PR description.',
  },
  {
    format: 'hot_take',
    text: 'Unpopular opinion: your IDE is slowing you down.\n\nMost developers use 5% of VS Code features.\nThe other 95% is bloat.\n\nLearn 10 terminal commands. You will be faster.',
  },
  {
    format: 'hot_take',
    text: 'Hot take: "clean code" is a scam.\n\nNot clean code itself.\nThe obsession with it.\n\nShipping working code beats perfect code every time.\nUsers do not care about your variable names.',
  },
  {
    format: 'hot_take',
    text: 'Hot take: senior devs write less code.\n\nNot because they are lazy.\nBecause they deleted more than they wrote.\n\nThe best code is code that does not exist.',
  },
  {
    format: 'hot_take',
    text: 'The hottest take in 2026:\n\nGit blame is a feature, not a shaming tool.\n\nIt shows who to ask questions to.\nThat is knowledge transfer, not blame assignment.',
  },

  // ── stop_paying ──
  {
    format: 'stop_paying',
    text: 'Stop paying for:\n\n• Grammarly ($12/mo)\n• Notion ($10/mo)\n• Figma ($15/mo)\n\nAlternatives:\n• LanguageTool (free)\n• Obsidian (free)\n• Penpot (free)\n\n$37/mo saved. $444/yr.',
  },
  {
    format: 'stop_paying',
    text: 'Stop paying for a Docker GUI.\n\npodman + podman-compose\n• Rootless by default\n• No daemon needed\n• Drop-in Docker replacement\n\nFree. Faster. More secure.',
  },
  {
    format: 'stop_paying',
    text: 'Stop paying for Postman.\n\nUse httpie or curl.\n\nhttp POST api.example.com name=test\n\ncurl -X POST api.example.com -d name=test\n\nFree. Works in terminal. No account needed.',
  },
  {
    format: 'stop_paying',
    text: 'Stop paying for cloud IDEs.\n\nSSH + tmux + vim = free remote dev.\n\n• No browser lag\n• No subscription\n• Works offline\n• Your terminal, your rules',
  },

  // ── nobody_tells_you ──
  {
    format: 'nobody_tells_you',
    text: 'Nobody tells you about:\n\n• git stash -p (partial stash)\n• git log --diff-filter=D (find deleted files)\n• git blame -L 10,20 file.js (range blame)\n• git reflog (time machine)\n\n90% of devs never touch these.',
  },
  {
    format: 'nobody_tells_you',
    text: 'Nobody tells you:\n\nThe best terminal shortcut is not a shortcut.\n\nIt is muscle memory.\n\nAfter 2 weeks of daily terminal use, your fingers move faster than your brain.\n\nThat is when you get dangerous.',
  },
  {
    format: 'nobody_tells_you',
    text: 'Nobody tells you this about AI coding agents:\n\nThey are bad at your codebase.\nThey are good at patterns.\n\nFeed them examples, not instructions.\nShow, do not tell.',
  },
  {
    format: 'nobody_tells_you',
    text: 'Nobody tells you:\n\ngit commit -m "WIP" is a valid workflow.\n\nCommit early. Commit often.\nCommit before you think you are done.\n\nYou can always rebase later.',
  },

  // ── cant_believe ──
  {
    format: 'cant_believe',
    text: 'I cannot believe this is free:\n\n• Neovim\n• tmux\n• fzf\n• ripgrep\n• bat\n\nAll open source. All faster than paid alternatives.\n\nThe terminal is the best IDE and it costs $0.',
  },
  {
    format: 'cant_believe',
    text: 'I cannot believe developers still:\n\n• Manually resolve merge conflicts\n• Do deployments on Fridays\n• Skip writing tests because "it is fast"\n• Push to main without a PR\n\nSome things never change.',
  },
  {
    format: 'cant_believe',
    text: 'I cannot believe how much time I wasted on:\n\n• Choosing the perfect font\n• Configuring dotfiles\n• Making the perfect color scheme\n\nJust use defaults and ship code.',
  },

  // ── why_nobody ──
  {
    format: 'why_nobody',
    text: 'Why nobody talks about:\n\nThe 30 minutes before you start coding.\n\nReading the issue.\nChecking git log.\nUnderstanding context.\n\nThat is where real debugging happens.',
  },
  {
    format: 'why_nobody',
    text: 'Why nobody talks about how slow code review kills teams:\n\n• PR sits for 3 days\n• Author context-switches\n• Merge conflict appears\n• Another 2 days to fix\n\nAverage PR cycle: 5 days for a 10-line change.',
  },
  {
    format: 'why_nobody',
    text: 'Why nobody talks about tmux:\n\nIt is not exciting.\nIt is not new.\nIt just works.\n\nAnd it saves you 1000+ clicks per year.',
  },

  // ── git_history ──
  {
    format: 'git_history',
    text: 'My git history this week:\n\n"initial setup"\n"it works"\n"actually working"\n"fix typo"\n"please work"\n"it works on my machine"\n"FINAL final fix"\n\nEvery developer. Every week.',
  },
  {
    format: 'git_history',
    text: 'Reading old git commits is therapy:\n\n2024: "fix bug"\n2025: "fix the actual bug this time"\n2026: "add comment explaining why this works"\n\nGrowth is real.',
  },
  {
    format: 'git_history',
    text: 'The best git commit message I ever wrote:\n\n"Revert "Revert "Revert "Fix"""\n\nSometimes you just have to go back.',
  },

  // ── mistake_list ──
  {
    format: 'mistake_list',
    text: '5 mistakes I made so you do not have to:\n\n1. Pushing without pulling first\n2. Not checking the diff before commit\n3. force push on shared branches\n4. Hardcoding API keys\n5. Deploying on Friday at 5 PM\n\nAll preventable. All painful.',
  },
  {
    format: 'mistake_list',
    text: '3 mistakes junior devs always make:\n\n1. Not reading error messages fully\n2. Copying Stack Overflow without understanding\n3. Over-engineering a simple solution\n\nI did all three for 2 years straight.',
  },
  {
    format: 'mistake_list',
    text: 'The mistake every dev makes with AI tools:\n\nPrompting: "write me a function"\n\nInstead of:\n"Given this interface, write a function that handles X edge cases and follows this pattern from our codebase"\n\nSpecificity = quality.',
  },
];

const LINKEDIN_POSTS = [
  {
    format: 'nobody_tells_you',
    text: `I have been building with AI coding agents for 8 months. Here is what nobody tells you:

1. They are terrible at your specific codebase out of the box. You need to teach them. AGENTS.md files, CLAUDE.md, cursor rules — these are not optional. They are the difference between "wow" and "why did it delete my router."

2. The 30-minute context setup saves 3 hours of debugging. Before letting an agent touch your code, give it the architectural context. Tell it what NOT to change. Show it the patterns it should follow.

3. Code review becomes MORE important, not less. AI writes faster, so you review more code. The skill is not writing — it is reviewing. Know your codebase well enough to spot when an agent hallucinates a function that does not exist.

4. The real productivity gain is not speed. It is the mental bandwidth. When an agent handles boilerplate, tests, and documentation, you spend your energy on the hard problems. That is where the magic happens.

5. You will write worse code if you trust it blindly. The developers who benefit most from AI agents are the ones who already knew how to write good code. The agent amplifies your skill, it does not replace it.

The tool is only as good as the person wielding it.`,
  },
  {
    format: 'nobody_tells_you',
    text: `I switched from GUI tools to terminal-only workflow 2 years ago. Here is what nobody tells you:

1. The first week is painful. You will miss your buttons. You will Google the same command 5 times. That is normal. Muscle memory takes 2 weeks, not 2 months.

2. You will never go back. Once you can navigate your entire dev environment without touching a mouse, everything else feels slow. GUIs have a ceiling. Terminals do not.

3. The productivity boost is not about typing speed. It is about context switching. Terminal = keyboard. GUI = keyboard + mouse + window switching. Every context switch costs 15 minutes of focus.

4. Pair programming changes completely. Screen sharing a terminal session is cleaner than sharing an IDE. Two people can follow the same command flow without UI distractions.

5. Your debugging improves. When you cannot click through a debugger, you learn to read logs, trace code paths, and think about state. That is a stronger skill than any IDE feature.

The terminal is not old school. It is the most modern tool we have.`,
  },
  {
    format: 'nobody_tells_you',
    text: `I have been reviewing code for 6 years. Here is what nobody tells you:

1. The best code review takes 10 minutes. If it takes an hour, the PR is too big. Split it.

2. The most valuable comment is "why?" not "change this." Help the author understand the reasoning, not just the fix.

3. Style nitpicks destroy morale. Reserve reviews for logic, security, and architecture. Use a linter for style.

4. Approving fast is underrated. A PR that sits for 3 days costs the team more than a quick approve with a small follow-up suggestion.

5. The reviewer learns more than the author. Every review teaches you patterns, anti-patterns, and context about parts of the codebase you did not write.

6. The best teams review code synchronously. 15 minutes of talking replaces 3 days of async comments.

Code review is not a gate. It is a conversation.`,
  },
];

// ── API Helpers ─────────────────────────────────────────────────────────

function apiRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${API_BASE}${path}`);
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method,
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });

    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function getScheduledPosts() {
  const resp = await apiRequest('GET', `/api/businesses/${BIZ_ID}/posts?status=SCHEDULED&limit=50`);
  if (resp.status !== 200) return [];
  return resp.body.data || [];
}

function isDuplicate(newText, existingPosts) {
  const newFirst60 = newText.slice(0, 60).toLowerCase();
  return existingPosts.some(p => {
    const cap = (p.caption || '').slice(0, 60).toLowerCase();
    return cap === newFirst60;
  });
}

function getNextSlot(slots, index) {
  const now = new Date();
  const slot = slots[index % slots.length];
  const baseDate = new Date(now);
  baseDate.setUTCHours(0, 0, 0, 0);

  // Find next occurrence of this slot
  let candidate = new Date(baseDate.toISOString().slice(0, 10) + slot);
  if (candidate <= now) {
    candidate.setUTCDate(candidate.getUTCDate() + 1);
  }
  return candidate.toISOString();
}

// ── Main ────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run');
  const isLinkedIn = args.includes('--linkedin');
  const batchIdx = args.indexOf('--batch');
  const batchCount = batchIdx >= 0 ? parseInt(args[batchIdx + 1], 10) : (isLinkedIn ? 1 : 0);

  if (!isLinkedIn && batchCount === 0) {
    console.error('Usage: node scripts/social-engine.cjs --batch N | --linkedin [--dry-run]');
    process.exit(1);
  }

  // Fetch existing scheduled posts for dedup
  console.log('Fetching existing scheduled posts for dedup...');
  const existing = await getScheduledPosts();
  console.log(`Found ${existing.length} scheduled posts\n`);

  const results = [];

  if (isLinkedIn) {
    // Pick a LinkedIn post not yet scheduled
    const usedCaptions = existing.map(p => (p.caption || '').slice(0, 60).toLowerCase());
    const available = LINKEDIN_POSTS.filter(p => !usedCaptions.includes(p.text.slice(0, 60).toLowerCase()));

    if (available.length === 0) {
      console.log('All LinkedIn posts already scheduled. Nothing to do.');
      return;
    }

    const post = available[Math.floor(Math.random() * available.length)];
    const schedTime = getNextSlot([LINKEDIN_SLOT_UTC], 0);

    console.log(`[LINKEDIN] format=${post.format}`);
    console.log(`Text preview: ${post.text.slice(0, 120)}...`);
    console.log(`Scheduled: ${schedTime}\n`);

    if (isDryRun) {
      console.log('DRY RUN — would schedule this post.');
      results.push({ platform: 'linkedin', status: 'dry_run', text: post.text.slice(0, 80) });
    } else {
      try {
        const resp = await apiRequest('POST', `/api/businesses/${BIZ_ID}/posts`, {
          caption: post.text,
          restrict_publish_to: ['linkedIn'],
          status: 'SCHEDULED',
          scheduled_publish_time: schedTime,
        });
        if (resp.status === 201) {
          console.log(`✅ LinkedIn post scheduled: ${resp.body.id}`);
          results.push({ platform: 'linkedin', status: 'scheduled', id: resp.body.id });
        } else {
          console.error(`❌ Failed (${resp.status}): ${JSON.stringify(resp.body).slice(0, 200)}`);
          results.push({ platform: 'linkedin', status: 'error', error: resp.body });
        }
      } catch (e) {
        console.error(`❌ Error: ${e.message}`);
        results.push({ platform: 'linkedin', status: 'error', error: e.message });
      }
    }
  }

  if (batchCount > 0) {
    // Select N unique Twitter posts not already scheduled
    const shuffled = [...TWITTER_POSTS].sort(() => Math.random() - 0.5);
    const selected = [];

    for (const post of shuffled) {
      if (selected.length >= batchCount) break;
      if (!isDuplicate(post.text, existing) && !isDuplicate(post.text, selected.map(p => ({ caption: p.text })))) {
        selected.push(post);
      }
    }

    if (selected.length === 0) {
      console.log('All Twitter posts already scheduled. Nothing to do.');
      return;
    }

    console.log(`Selected ${selected.length} Twitter posts:\n`);

    for (let i = 0; i < selected.length; i++) {
      const post = selected[i];
      const schedTime = getNextSlot(TWITTER_SLOTS_UTC, i);

      console.log(`[${i + 1}/${selected.length}] format=${post.format}`);
      console.log(`Text: ${post.text.slice(0, 100)}...`);
      console.log(`Scheduled: ${schedTime}`);

      if (isDryRun) {
        console.log('DRY RUN — would schedule.\n');
        results.push({ platform: 'twitter', status: 'dry_run', text: post.text.slice(0, 80) });
      } else {
        try {
          const resp = await apiRequest('POST', `/api/businesses/${BIZ_ID}/posts`, {
            caption: post.text,
            restrict_publish_to: ['twitter'],
            status: 'SCHEDULED',
            scheduled_publish_time: schedTime,
          });
          if (resp.status === 201) {
            console.log(`✅ Scheduled: ${resp.body.id}\n`);
            results.push({ platform: 'twitter', status: 'scheduled', id: resp.body.id });
          } else {
            console.error(`❌ Failed (${resp.status}): ${JSON.stringify(resp.body).slice(0, 200)}\n`);
            results.push({ platform: 'twitter', status: 'error', error: resp.body });
          }
        } catch (e) {
          console.error(`❌ Error: ${e.message}\n`);
          results.push({ platform: 'twitter', status: 'error', error: e.message });
        }
      }
    }
  }

  // Summary
  console.log('─'.repeat(50));
  console.log('SUMMARY');
  console.log('─'.repeat(50));
  const scheduled = results.filter(r => r.status === 'scheduled').length;
  const errors = results.filter(r => r.status === 'error').length;
  const dryRuns = results.filter(r => r.status === 'dry_run').length;
  console.log(`Scheduled: ${scheduled} | Errors: ${errors} | Dry runs: ${dryRuns}`);
}

main().catch(e => {
  console.error('Fatal:', e);
  process.exit(1);
});
