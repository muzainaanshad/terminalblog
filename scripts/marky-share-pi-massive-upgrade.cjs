#!/usr/bin/env node
// Share Pi Coding Agent massive upgrade via MyMarky (X + LinkedIn)
const BIZ_ID = '598a98f9-9ff9-4fa5-90a2-2ad0e313417e';
const KEY = 'mk_live_2HrW1PDCF5i4rMu809NIDtvxtu0-rdnZOGURht6RWmE';
const API = 'https://api.mymarky.ai/api/businesses/' + BIZ_ID + '/posts';
const HEADERS = { Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' };
const ARTICLE = 'https://terminalblog.com/blog/pi-coding-agent-just-got-massive-upgrade-fullscreen-breaking-changes/';

const POSTS = [
  {
    // X/Twitter: key takeaways + link
    caption:
'Pi Coding Agent just got its biggest upgrade ever — 0.84.0/0.84.2 🚀\n\n' +
'✨ Fullscreen TUI mode: sticky editor, independent scroll, draggable bars\n' +
'💥 Breaking: lane-based session model rewrite (SDK users read notes)\n' +
'📁 Per-directory AGENTS.override.md — different rules per folder\n' +
'🔧 Configurable defaultTools — load only what you need\n' +
'🔍 Fullscreen transcript search (Ctrl+Shift+F) — find anything instantly\n' +
'🧪 Strict JSON-schema constrained sampling (experimental)\n' +
'🪟 Windows/SSH fixes: Shift+Enter, truecolor, latency, clipboard\n' +
'☁️ Baseten provider, Kimi K3, GPT-5.6 pricing, Qwen updates\n\n' +
'First release that feels complete out of the box. Full breakdown:\n' +
ARTICLE + '\n\n' +
'#PiCodingAgent #AICodingAgent #TerminalIDE #OpenSource #Developers',
    link: ARTICLE,
    metadata: { format: 'release-update', tool: 'pi-dot-dev', version: '0.84.2' },
  },
  {
    // LinkedIn: personal take, no links in body
    caption:
'I\'ve been watching Pi (earendil-works) evolve from a promising CLI agent into something that genuinely competes with the big names — and 0.84.x is the inflection point.\n\n' +
'The headline isn\'t any single feature. It\'s that the *terminal experience* finally matches what you\'d expect from a modern IDE:\n\n' +
'**Fullscreen TUI mode** with a sticky editor pane means your prompt never jumps while the agent works. **Transcript search** (Ctrl+Shift+F) lets you find that error from 200 turns ago in seconds. **Per-directory context overrides** (AGENTS.override.md) solve the monorepo context problem elegantly.\n\n' +
'Under the hood, the lane-based session model rewrite (breaking for SDK users) replaces the inherited architecture with durable operation records, global facts, and tree-scoped lane views. That\'s the kind of foundation that enables reliable long-running agents.\n\n' +
'Windows and SSH users: the Shift+Enter detection, truecolor support, and clipboard fixes alone make this worth upgrading.\n\n' +
'If you\'ve been curious about provider-agnostic terminal agents but held back by rough edges — 0.84.2 is the release where the rough edges mostly disappear.\n\n' +
'#AICoding #TerminalTools #DeveloperExperience #OpenSource #PiAgent',
    metadata: { format: 'personal-take', platform: 'linkedin', tool: 'pi-dot-dev', version: '0.84.2' },
  },
];

async function post() {
  for (const p of POSTS) {
    const body = {
      caption: p.caption,
      ...(p.link && { link: p.link }),
      metadata: p.metadata,
    };
    const res = await fetch(API, { method: 'POST', headers: HEADERS, body: JSON.stringify(body) });
    const data = await res.json();
    console.log(res.status, data);
  }
}

post().catch(console.error);