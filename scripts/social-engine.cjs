#!/usr/bin/env node
/**
 * Social Media Engine v2 — S.G.T.M.S. Framework
 * Volume-first, feed-first algorithm strategy.
 * 
 * Modes:
 *   --batch N         Generate N posts using S.G.T.M.S. variations
 *   --linkedin        Generate LinkedIn "nobody tells you" post
 *   --hot-take        Generate quick hot take for Twitter
 *   --publish ID      Publish a scheduled post immediately
 *   --dry             Preview only
 * 
 * Usage:
 *   node scripts/social-engine.cjs --batch 6
 *   node scripts/social-engine.cjs --linkedin
 *   node scripts/social-engine.cjs --hot-take
 *   node scripts/social-engine.cjs --publish <post-id>
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const BIZ_ID = '598a98f9-9ff9-4fa5-90a2-2ad0e313417e';
const KEY = 'mk_live_w61K61zmWDi-I-pviWXoYQX7UmU2mJ-xOAVyNdsKVpY';
const API = 'https://api.mymarky.ai/api';

// ── S.G.T.M.S. Repeatable Formats ──
// These are PROVEN formats that consistently perform.
// We rotate through them instead of generating new concepts daily.

const FORMATS = {
  // Top of Funnel — Discovery (60% of posts)
  hot_take: {
    funnel: 'discovery',
    platforms: ['twitter', 'linkedin'],
    templates: [
      'Hot take: {opinion}\n\nNo {common_assumption}.\n\nThe reality is {counter_intuitive_truth}',
      'Unpopular opinion: {opinion}\n\nHere is why nobody talks about this:',
      '{bold_claim}.\n\nFight me in the replies.',
    ],
  },
  stop_paying: {
    funnel: 'discovery',
    platforms: ['twitter', 'linkedin', 'instagram'],
    templates: [
      'Stop paying for {paid_thing}.\n\nHere is a free alternative that does the same job:',
      'Why are you still paying for {paid_thing}?\n\n{free_alternative} does it for free.',
      '{paid_thing} costs ${price}/mo.\n\n{free_alternative} costs $0.\n\nSame features. Sometimes better.',
    ],
  },
  nobody_tells_you: {
    funnel: 'discovery',
    platforms: ['linkedin', 'twitter'],
    templates: [
      'I have been {doing_x} for {time_period}.\n\nHere is what nobody tells you:\n\n1. {insight_1}\n2. {insight_2}\n3. {insight_3}\n4. {insight_4}\n5. {insight_5}',
      '{time_period} of {doing_x}. The honest truth:\n\n• {insight_1}\n• {insight_2}\n• {insight_3}\n• {insight_4}\n• {insight_5}',
    ],
  },
  cant_believe: {
    funnel: 'discovery',
    platforms: ['twitter', 'facebook'],
    templates: [
      'I cannot believe this is free.\n\n{tool_name} just {what_it_does}.\n\nNo catch. No freemium. Just free.',
      'Wait — {tool_name} is free?\n\n{what_it_does}.\n\nI have been paying for this?',
    ],
  },
  why_nobody: {
    funnel: 'discovery',
    platforms: ['twitter', 'linkedin'],
    templates: [
      'Why is nobody talking about {tool_name}?\n\n{what_it_does}.\n\nI switched last week and {result}.',
      'The most underrated {category} tool in 2026:\n\n{tool_name}\n\n{why_its_good}',
    ],
  },
  git_history: {
    funnel: 'discovery',
    platforms: ['twitter'],
    templates: [
      'My git history looks like a crime scene:\n\n"fix"\n"fix fix"\n"actually fix"\n"please work"\n"it works on my machine"\n"final fix" <- this one broke prod',
      'Commit messages at 3 AM:\n\n"stuff"\n"why"\n"help"\n"it works now leave me alone"\n"this should not work but it does"',
    ],
  },

  // Mid-Funnel — Nurture (30% of posts)
  deep_dive: {
    funnel: 'nurture',
    platforms: ['linkedin'],
    templates: [
      'I spent {time} researching {topic}.\n\nHere are {number} things I learned:\n\n{findings}',
      '{topic} — the complete breakdown:\n\n{findings}',
    ],
  },
  before_after: {
    funnel: 'nurture',
    platforms: ['linkedin', 'twitter'],
    templates: [
      'Before I discovered {tool}:\n{before_state}\n\nAfter:\n{after_state}\n\nThe difference is real.',
    ],
  },
  mistake_list: {
    funnel: 'nurture',
    platforms: ['twitter', 'linkedin', 'instagram'],
    templates: [
      '{number} {topic} mistakes I see every day:\n\n{mistakes}',
      'Stop making these {number} {topic} mistakes:\n\n{mistakes}',
    ],
  },

  // Bottom of Funnel — Conversion (10% of posts)
  recommendation: {
    funnel: 'conversion',
    platforms: ['twitter', 'linkedin', 'instagram', 'facebook'],
    templates: [
      'If you are building with {technology}, you need to read this:\n\n{article_title}\n\n{url}',
      'New post: {article_title}\n\n{key_insight}\n\n{url}',
    ],
  },
};

// ── Pre-written content (no AI needed for volume) ──
const PRE_WRITTEN = {
  hot_take: [
    { text: 'Hot take: the best code review feedback is silence.\n\nNo comments = clean code.\n\nA code review with 47 comments is not a review — it is a rewrite request in disguise.', platforms: ['twitter', 'linkedin'] },
    { text: 'Hot take: the best debugging tool is sleep.\n\nYou will stare at a bug for 3 hours, go to bed, and solve it in 5 minutes the next morning.\n\nYour brain processes code while you sleep.', platforms: ['twitter', 'linkedin'] },
    { text: 'Hot take: most "senior" developers are just junior developers who learned to say "it depends" with confidence.', platforms: ['twitter'] },
    { text: 'Hot take: the best documentation is a well-named variable.\n\nIf your code needs a README to understand, your variable names are too clever.', platforms: ['twitter', 'linkedin'] },
    { text: 'Hot take: AI coding agents are not replacing developers.\n\nThey are replacing the 80% of development time spent figuring out what to type.', platforms: ['twitter', 'linkedin'] },
    { text: 'Hot take: code that needs comments to explain what it does is badly written code.\n\nCode that needs comments to explain WHY — that is good documentation.', platforms: ['twitter'] },
    { text: 'Hot take: the hardest part of programming is not writing code.\n\nIt is deciding what NOT to build.', platforms: ['twitter', 'linkedin'] },
  ],
  stop_paying: [
    { text: 'Stop paying for ChatGPT Plus.\n\nClaude Code with the free tier does the same thing.\n\nI saved $20/mo and the code quality is better.', platforms: ['twitter', 'linkedin'] },
    { text: 'Stop paying for Grammarly.\n\nHemingway Editor does it for free.\n\nSimpler. Faster. No browser extension needed.', platforms: ['twitter', 'linkedin', 'instagram'] },
    { text: 'Stop paying for Notion.\n\nObsidian does everything Notion does.\n\nAnd your data stays on your machine.', platforms: ['twitter', 'linkedin'] },
    { text: 'Stop paying for a VPN.\n\nWireGuard + a $5/mo VPS gives you a personal VPN.\n\nFaster than any commercial VPN. You own the server.', platforms: ['twitter'] },
    { text: 'Stop paying for Slack.\n\nMatrix + Element gives you the same thing.\n\nSelf-hosted. E2E encrypted. Free forever.', platforms: ['twitter', 'linkedin'] },
  ],
  nobody_tells_you: [
    { text: 'I have been building AI coding agents for 6 months.\n\nHere is what nobody tells you:\n\n1. The hardest part is not the AI — it is the tool integration\n2. Most agents fail at multi-file edits\n3. The ones that work feel like magic\n4. You will spend 80% of your time debugging tool calls\n5. When it works, you will never go back to manual coding', platforms: ['linkedin'] },
    { text: '6 months of running a tech blog with AI agents. The honest truth:\n\n• AI writes 90% of drafts. I edit 10%.\n• SEO still matters more than content quality\n• Consistency beats virality every time\n• The algorithm rewards speed, not perfection\n• Most "viral" posts are just relatable observations', platforms: ['linkedin'] },
    { text: '2 years of remote work. Here is what nobody tells you:\n\n• The hardest part is not distractions — it is loneliness\n• A standing desk changed my life more than any productivity app\n• You need to "leave work" even when work is 10 steps away\n• Async communication is a skill, not a preference\n• The best remote workers are the best writers', platforms: ['linkedin'] },
    { text: 'I have been using terminal tools for 3 years.\n\nWhat nobody tells you:\n\n• The learning curve is worth it\n• You will type faster than any GUI user\n• Tab completion is addictive\n• Once you go CLI, you never go back\n• Your productivity doubles in 2 weeks', platforms: ['linkedin', 'twitter'] },
    { text: '1 year of open source contribution. The real truth:\n\n• Most maintainers are overwhelmed, not unfriendly\n• Documentation PRs are the fastest way to get accepted\n• Your first PR will have 47 review comments\n• That is normal. That is how you learn.\n• The community is smaller than you think', platforms: ['linkedin'] },
  ],
  cant_believe: [
    { text: 'I cannot believe this is free.\n\nOllama runs LLMs on your laptop.\n\nNo API keys. No monthly fee. Just install and run.\n\nI have been paying for Claude API when this exists?', platforms: ['twitter', 'facebook'] },
    { text: 'Wait — Cursor has a free tier?\n\nAI code completion inside VS Code.\n\nI have been paying for GitHub Copilot when this exists?', platforms: ['twitter'] },
    { text: 'I cannot believe this is free.\n\nVercel deploys your site in 30 seconds.\n\nSSL. CDN. Preview deployments. All free.\n\nI was paying $20/mo for a VPS that did less.', platforms: ['twitter', 'linkedin', 'facebook'] },
    { text: 'Wait — Linear is free for small teams?\n\nIssue tracking that does not make you want to quit.\n\nI have been using Jira when this exists?', platforms: ['twitter', 'linkedin'] },
  ],
  why_nobody: [
    { text: 'Why is nobody talking about ripgrep?\n\nIt is 10x faster than grep.\n\nI switched last week and my search times dropped from seconds to milliseconds.', platforms: ['twitter'] },
    { text: 'The most underrated terminal tool in 2026:\n\nbat — a better cat.\n\nSyntax highlighting. Line numbers. Git integration.\n\nWhy was I using cat this whole time?', platforms: ['twitter', 'instagram'] },
    { text: 'Why is nobody talking about Neovim?\n\nFull IDE experience in the terminal.\n\nOnce you learn the basics, you will never touch a mouse again.', platforms: ['twitter'] },
    { text: 'The most underrated AI tool in 2026:\n\nClaude Code Skills.\n\nCustom instructions that make your coding agent 10x smarter.\n\nMost people do not even know they exist.', platforms: ['twitter', 'linkedin'] },
  ],
  git_history: [
    { text: 'My git history looks like a crime scene:\n\n"fix"\n"fix fix"\n"actually fix"\n"please work"\n"it works on my machine"\n"final fix" <- this one broke prod', platforms: ['twitter'] },
    { text: 'Commit messages at 3 AM:\n\n"stuff"\n"why"\n"help"\n"it works now leave me alone"\n"this should not work but it does"', platforms: ['twitter'] },
    { text: 'My terminal history after a debugging session:\n\nnpm start\nnpm run dev\nnode index.js\nnode --inspect index.js\ncurl localhost:3000\ncurl -v localhost:3000\nnpm test\nrm -rf node_modules\nnpm install\nnpm start', platforms: ['twitter'] },
  ],
  mistake_list: [
    { text: '5 terminal mistakes I see every day:\n\n1. Using `ls` when `ls -la` exists\n2. Not using `&&` to chain commands\n3. Forgetting `cd -` to go back\n4. Not setting up aliases\n5. Typing full paths instead of using `~`', platforms: ['twitter', 'instagram'] },
    { text: '5 git mistakes that waste hours:\n\n1. Not using `git stash` before switching branches\n2. Committing directly to main\n3. Not using `git bisect` to find bugs\n4. Forgetting `git pull --rebase`\n5. Not setting up `.gitignore` properly', platforms: ['twitter', 'linkedin'] },
    { text: '5 coding habits that slow you down:\n\n1. Not using a linter\n2. Manually formatting code\n3. Not using keyboard shortcuts\n4. Reading docs instead of examples\n5. Over-engineering before validating', platforms: ['twitter', 'linkedin', 'instagram'] },
  ],
  recommendation: [
    { text: 'If you are building a SaaS, you need to read this:\n\nBest Coding Agents 2026 — Decision Guide\n\nThe honest comparison nobody else is doing.\n\nhttps://terminalblog.com/blog/best-coding-agents-2026-decision-guide/', platforms: ['twitter', 'linkedin', 'facebook'] },
    { text: 'New post: AGENTS.md Complete Guide\n\nMake every coding agent follow your repo rules.\n\nThis one file changes how AI writes code in your project.\n\nhttps://terminalblog.com/blog/agents-md-complete-guide/', platforms: ['twitter', 'linkedin'] },
    { text: 'New post: Coding Agent Security Checklist 2026\n\nThe operator hardening guide.\n\nIf you run Claude Code, Codex, or any agent — read this.\n\nhttps://terminalblog.com/blog/coding-agent-security-checklist-2026/', platforms: ['twitter', 'linkedin'] },
  ],
};

// ── API helpers ──
function apiCall(method, apiPath, body = null) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const opts = {
      hostname: 'api.mymarky.ai',
      path: `/api${apiPath}`,
      method,
      headers: {
        'Authorization': `Bearer ${KEY}`,
        'Content-Type': 'application/json',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
      },
    };
    const req = https.request(opts, (res) => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(body) }); }
        catch { resolve({ status: res.statusCode, data: body }); }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

function getTodaySlots(count) {
  const now = new Date();
  const slots = [];
  // Post at: 8 AM, 12 PM, 4 PM, 8 PM Saudi (5, 9, 13, 17 UTC)
  const hours = [5, 9, 13, 17];
  for (const h of hours) {
    const d = new Date(now);
    d.setUTCHours(h, 0, 0, 0);
    if (d > now) slots.push(d.toISOString());
  }
  if (slots.length < count) {
    for (const h of hours) {
      const d = new Date(now);
      d.setDate(d.getDate() + 1);
      d.setUTCHours(h, 0, 0, 0);
      slots.push(d.toISOString());
      if (slots.length >= count) break;
    }
  }
  return slots.slice(0, count);
}

// ── Main ──
async function main() {
  const args = process.argv.slice(2);
  const dry = args.includes('--dry');
  const batch = args.includes('--batch');
  const linkedin = args.includes('--linkedin');
  const hotTake = args.includes('--hot-take');
  const publish = args.includes('--publish');
  const count = batch ? parseInt(args[args.indexOf('--batch') + 1] || '6') : 0;

  console.log('=== Social Engine v2 (S.G.T.M.S.) ===');

  if (batch) {
    console.log(`\nGenerating ${count} posts with S.G.T.M.S. variations...`);
    const slots = getTodaySlots(count);
    const allPosts = Object.values(PRE_WRITTEN).flat();
    const shuffled = [...allPosts].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, count);

    for (let i = 0; i < selected.length; i++) {
      const post = selected[i];
      const slot = slots[i] || new Date(Date.now() + (i * 3600000)).toISOString();
      const platforms = post.platforms || ['twitter', 'linkedin', 'facebook', 'instagram'];

      console.log(`\n[${i + 1}/${count}] ${post.text.slice(0, 60)}...`);
      console.log(`  Platforms: ${platforms.join(', ')}`);
      console.log(`  Scheduled: ${slot}`);

      if (dry) {
        console.log('  [DRY RUN] Would create post');
        continue;
      }

      const body = {
        caption: post.text,
        restrict_publish_to: platforms,
        scheduled_publish_time: slot,
      };

      const result = await apiCall('POST', `/businesses/${BIZ_ID}/posts`, body);
      if (result.data?.id) {
        console.log(`  ✅ Created: ${result.data.id}`);
      } else {
        console.log(`  ❌ Error: ${JSON.stringify(result.data).slice(0, 200)}`);
      }

      await new Promise(r => setTimeout(r, 1000)); // Rate limit
    }
    console.log(`\nDone. ${count} posts scheduled.`);
  }

  if (linkedin) {
    console.log('\nGenerating LinkedIn "nobody tells you" post...');
    const posts = PRE_WRITTEN.nobody_tells_you;
    const post = posts[Math.floor(Math.random() * posts.length)];

    if (dry) {
      console.log(`\n[DRY RUN]\n${post.text}`);
      return;
    }

    const body = {
      caption: post.text,
      restrict_publish_to: ['linkedin'],
    };

    const result = await apiCall('POST', `/businesses/${BIZ_ID}/posts`, body);
    if (result.data?.id) {
      console.log(`✅ Created: ${result.data.id}`);
      // Publish immediately
      const pub = await apiCall('POST', `/businesses/${BIZ_ID}/posts/${result.data.id}/publish`);
      if (pub.data?.status === 'PUBLISHED') {
        console.log('📤 Published to LinkedIn');
      }
    } else {
      console.log(`❌ Error: ${JSON.stringify(result.data).slice(0, 200)}`);
    }
  }

  if (hotTake) {
    console.log('\nGenerating hot take for Twitter...');
    const posts = PRE_WRITTEN.hot_take;
    const post = posts[Math.floor(Math.random() * posts.length)];

    if (dry) {
      console.log(`\n[DRY RUN]\n${post.text}`);
      return;
    }

    const body = {
      caption: post.text,
      restrict_publish_to: ['twitter'],
    };

    const result = await apiCall('POST', `/businesses/${BIZ_ID}/posts`, body);
    if (result.data?.id) {
      console.log(`✅ Created: ${result.data.id}`);
      const pub = await apiCall('POST', `/businesses/${BIZ_ID}/posts/${result.data.id}/publish`);
      if (pub.data?.status === 'PUBLISHED') {
        console.log('📤 Published to Twitter');
      }
    } else {
      console.log(`❌ Error: ${JSON.stringify(result.data).slice(0, 200)}`);
    }
  }

  if (publish) {
    const postId = args[args.indexOf('--publish') + 1];
    if (!postId) {
      console.error('Usage: --publish <post-id>');
      process.exit(1);
    }
    console.log(`\nPublishing post ${postId}...`);
    const pub = await apiCall('POST', `/businesses/${BIZ_ID}/posts/${postId}/publish`);
    console.log(JSON.stringify(pub.data, null, 2));
  }

  if (!batch && !linkedin && !hotTake && !publish) {
    console.log('\nUsage:');
    console.log('  --batch N          Generate N posts (S.G.T.M.S. variations)');
    console.log('  --linkedin         Publish LinkedIn "nobody tells you" post');
    console.log('  --hot-take         Publish hot take to Twitter');
    console.log('  --publish ID       Publish a scheduled post immediately');
    console.log('  --dry              Preview only');
    console.log('\nFormats: hot_take, stop_paying, nobody_tells_you, cant_believe, why_nobody, git_history, mistake_list, recommendation');
    console.log('\nFunnel stages:');
    console.log('  Discovery (60%): hot_take, stop_paying, cant_believe, why_nobody, git_history');
    console.log('  Nurture (30%): nobody_tells_you, deep_dive, before_after, mistake_list');
    console.log('  Conversion (10%): recommendation');
  }
}

main().catch(e => { console.error('Error:', e.message); process.exit(1); });
