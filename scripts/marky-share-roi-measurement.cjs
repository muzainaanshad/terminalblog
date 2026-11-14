#!/usr/bin/env node
// Share "Your Team Uses AI Coding Agents — Here's How to Prove They're Actually Worth It" via MyMarky (X + LinkedIn)
const BIZ_ID = '598a98f9-9ff9-4fa5-90a2-2ad0e313417e';
const KEY = 'mk_live_2HrW1PDCF5i4rMu809NIDtvxtu0-rdnZOGURht6RWmE';
const API = 'https://api.mymarky.ai/api/businesses/' + BIZ_ID + '/posts';
const HEADERS = { Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' };
const ARTICLE = 'https://terminalblog.com/blog/measure-ai-coding-agent-roi-team-impact/';

const POSTS = [
  {
    // X/Twitter: key takeaways + link in tweet
    caption:
      'Your team uses AI coding agents. Leadership asks for ROI. You have vibes. 🧵\n\n' +
      'Most teams measure the wrong things: lines of code, PR count, "time saved" estimates.\n\n' +
      'The only metric that matters: Verified working value per dollar spent.\n\n' +
      'My new guide gives you a 4-metric framework that takes 15 min/week:\n\n' +
      '1️⃣ Verified Throughput — Tickets/week that reach Done with tests + review\n' +
      '2️⃣ Cycle Time Delta — Median ticket→done with agent vs without\n' +
      '3️⃣ Rework Rate — % of agent PRs needing fixes within 2 weeks\n' +
      '4️⃣ Cost per Verified Ticket — (Sub + API + review hours) / tickets\n\n' +
      'Includes: 90-day protocol, trap avoidance, leadership dashboard template, Google Sheets copy.\n\n' +
      'Full guide: ' + ARTICLE + '\n\n' +
      '#AICoding #DeveloperProductivity #EngineeringManagement #ROI #SoftwareEngineering #DevTools #TeamLeadership',
    link: ARTICLE,
    metadata: { format: 'guide', tool: 'industry', topic: 'roi-measurement' },
  },
  {
    // LinkedIn: personal take, no links in body (link goes in first comment)
    caption:
      "I've watched three engineering teams adopt AI coding agents this year. The pattern is always the same:\n\n" +
      "Month 1: \"Wow, we're shipping so much faster!\"\n" +
      "Month 2: \"Wait, why are we reverting so many PRs?\"\n" +
      "Month 3: \"Leadership wants ROI numbers. What do we show them?\"\n\n" +
      "The problem isn't that agents don't work. It's that nobody measures what actually matters.\n\n" +
      "Lines of code generated? AI writes verbose code — more LOC ≠ more value.\n" +
      "PRs merged? Could mean smaller PRs, not more output.\n" +
      "\"Time saved\" estimates? Humans are terrible at counterfactuals.\n\n" +
      "What actually works: A four-metric framework using data you already have (Git, CI, ticketing, API bills).\n\n" +
      "1. Verified Throughput — Tickets reaching Done with passing tests and human review\n" +
      "2. Cycle Time Delta — Same-complexity tickets, agent vs human\n" +
      "3. Rework Rate — Follow-up fixes within 14 days (catches the \"fast but breaks things\" trap)\n" +
      "4. Cost per Verified Ticket — Including the hidden cost of reviewing AI output\n\n" +
      "The sweet spot from 2026 data: 40-60% agent-assisted tickets, same rework rate, 30% cycle time improvement, 25% cost reduction.\n\n" +
      "I built a Google Sheets template, a 90-day rollout protocol, and a one-page dashboard leadership actually reads.\n\n" +
      "Read the full guide on terminalblog.com\n\n" +
      "#AI #CodingAgents #EngineeringManagement #DeveloperProductivity #ROI #SoftwareEngineering #TeamLeadership #DevTools #PlatformEngineering #EngineeringMetrics",
    metadata: { format: 'personal-take', platform: 'linkedin', tool: 'industry', topic: 'roi-measurement' },
  },
];

(async () => {
  const now = Date.now();
  const results = [];
  for (let i = 0; i < POSTS.length; i++) {
    const p = POSTS[i];
    const scheduled = new Date(now + (5 + i * 60) * 60000).toISOString();
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