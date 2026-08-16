#!/usr/bin/env node
// Share the Zed Delta multiplayer AI agents release via MyMarky (X + LinkedIn)
const BIZ_ID = '598a98f9-9ff9-4fa5-90a2-2ad0e313417e';
const KEY = 'mk_live_2HrW1PDCF5i4rMu809NIDtvxtu0-rdnZOGURht6RWmE';
const API = 'https://api.mymarky.ai/api/businesses/' + BIZ_ID + '/posts';
const HEADERS = { Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' };
const ARTICLE = 'https://terminalblog.com/blog/zed-delta-multiplayer-coding-agents-private-beta/';

const POSTS = [
  {
    // X/Twitter: key takeaways + link
    caption:
'Zed just launched Delta — a multiplayer IDE where AI agents are first-class teammates. 🚀\n\n' +
'🧵 Persistent agent threads: context never lost between sessions\n' +
'💬 Living code + conversation: review that stays accurate as code evolves\n' +
'🌐 Browser-based multiplayer: teammates join via link, zero install (WASM/WebGL)\n' +
'🤝 Claude Code sync: terminal sessions bridge to browser with full context\n' +
'🔄 DeltaDB: replicates conversation + worktree together, git-compatible\n' +
'🎯 Private beta invites sent Aug 12 — sign up at zed.dev/deltadb\n\n' +
'First tool built FROM THE GROUND UP for agent-as-teammate reality. Full breakdown: ' + ARTICLE + '\n\n' +
'#Zed #Delta #AICodingAgent #MultiplayerCoding #DeveloperTools #OpenSource #AIEngineering',
    link: ARTICLE,
    metadata: { format: 'release-update', tool: 'zed', version: 'delta-private-beta' },
  },
  {
    // LinkedIn: personal take, no links in body
    caption:
'I\'ve been watching the AI editor space for a while. Most tools treat agents as side features — a chat panel, a completion popup, maybe an inline diff.\n\n' +
'Zed\'s new Delta platform (announced Aug 12, private beta rolling out) is the first thing I\'ve seen that fundamentally rethinks the interface for a world where agents write most of the code.\n\n' +
'The core insight: **the conversation IS the work**. Not a byproduct. Not a log. The thread — human prompts, agent reasoning, code edits, review comments — that thread is the artifact that matters.\n\n' +
'Delta makes that thread persistent, shareable, and multiplayer. You invite a teammate to a thread, they see the full conversation, the living code, the agent\'s reasoning — everything. They can comment on any line, ask the agent to explain a decision, pick up the work mid-stream.\n\n' +
'It runs in the browser via WebAssembly (same Rust binary, compiled to WASM, rendered via WebGL). Zero install for collaborators. And it bridges to Claude Code — your terminal session syncs live into a Delta thread.\n\n' +
'The replication engine (DeltaDB) syncs conversation + worktree together. You still commit to git normally. Teammates who never open Delta see a normal repo.\n\n' +
'This is the infrastructure layer the agent era actually needs. Not another chat wrapper.\n\n' +
'Full writeup on terminalblog.\n\n' +
'#Zed #Delta #AICodingAgent #MultiplayerCoding #DeveloperTools #AIEngineering #OpenSource #FutureOfWork',
    metadata: { format: 'personal-take', platform: 'linkedin', tool: 'zed', version: 'delta-private-beta' },
  },
];

(async () => {
  const now = Date.now();
  const results = [];
  for (let i = 0; i < POSTS.length; i++) {
    const p = POSTS[i];
    const scheduled = new Date(now + (30 + i * 45) * 60000).toISOString();
    const payload = {
      caption: p.caption,
      link: p.link || undefined,
      status: 'SCHEDULED',
      scheduled_publish_time: scheduled,
      metadata: p.metadata,
    };
    try {
      const r = await fetch(API, { method: 'POST', headers: HEADERS, body: JSON.stringify(payload) });
      const data = await r.json();
      results.push({ i: i + 1, http: r.status, id: data.id || (data.data && data.data.id) || 'FAILED', error: data.error || null });
      console.log('Post ' + (i + 1) + ': HTTP ' + r.status + ' | id=' + results[i].id + ' | sched=' + scheduled);
    } catch (e) {
      results.push({ i: i + 1, http: 0, id: 'ERROR', error: String(e) });
      console.log('Post ' + (i + 1) + ': ERROR ' + e);
    }
  }
  console.log('SUMMARY:', JSON.stringify(results, null, 1));
})().catch((e) => { console.error('Fatal:', e); process.exit(1); });