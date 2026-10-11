# Distribution Package: Build Model Router Role-Based Assignment Guide

**Article:** Your AI Agent Keeps Burning $200 on Simple Tasks — Here's How to Fix It
**Canonical URL:** https://terminalblog.com/blog/build-model-router-role-based-assignment-guide/
**Published:** 2026-10-12
**Target Platforms:** Reddit (r/ClaudeAI, r/cursor), Hacker News, Medium, X/Twitter

---

## REDDIT POST — r/ClaudeAI

**Title:** Your AI agent burns $200 on simple tasks because it never says "wait, this is simple, let me use a cheaper model" — here's the fix

**Body:**

Hacker News thread last week (200+ comments) exposed the same frustration:
> "The agent never stops and says, 'Wait, this is something another model could do cheaper and faster.' It just plows on with the slow, expensive model."
> "Conversely, the agent never says, 'This model is too dumb for this task. Let me tag in a smarter one.'"

The solution isn't waiting for Anthropic/OpenAI. It's building a **role-based model router** into your harness.

**The core insight from HN:** Don't guess task difficulty. Assign models to **roles** — we know the roles in advance.

| Role | What It Does | Model Tier | Why |
|------|--------------|------------|-----|
| **Planner** | Architecture, task breakdown, specs | Frontier (Opus 5.5, GPT-6 Sol) | Reasoning quality determines everything downstream |
| **Implementer** | Writing code, edits, tests | Mid-tier (Sonnet 5.5, GPT-6 Astra) | Speed + quality |
| **Reviewer** | Code review, security, style | Cheap/Fast (Haiku 5.5, Flash) | High volume, pattern-matching |
| **Researcher** | Codebase exploration, docs, deps | Cheap/Fast (Haiku, Flash, local) | Read-only, high token volume |
| **Boilerplate** | Tests, configs, migrations, docs | Cheapest (Flash, mini, local) | Repetitive, verifiable |

**Cost comparison (100 sessions/month):**
- Everything on Opus 5.5: ~$2,400
- Everything on Sonnet 5.5: ~$480
- **Role-based router: ~$180 (92% savings)**
- Role-based + local fallback: ~$40 (98% savings)

**Implementation options included:**
1. **Claude Code** — Hook-based routing (15 min setup)
2. **OpenCode** — Native agent definitions (10 min setup)
3. **Custom harness** — Python/TypeScript router class

Plus: Multi-agent pipeline pattern (teaching hospital from Cockroach Labs — 1M+ lines, 7 reverts in 5 months), dynamic escalation triggers, verification/logging.

**The trap to avoid:** Don't build a "smart router" that guesses difficulty. Explicit role assignment beats dynamic guessing every time — predictable, auditable, optimizable.

Full guide with copy-paste code: https://terminalblog.com/blog/build-model-router-role-based-assignment-guide/

---

## REDDIT POST — r/cursor

**Title:** Stop sending boilerplate to Opus: role-based model router cuts costs 92% (Claude Code + OpenCode implementations included)

**Body:**

Cursor/Claude Code users — your agent doesn't know the difference between "rename this variable" and "refactor the auth system." It treats both like they need Opus.

Built a role-based router that sits between your agent and the provider. Five roles, five models, explicit mapping. Router is dumb and deterministic — intelligence lives in your role definitions.

**Results:** 100 sessions/month dropped from $2,400 (Opus-only) to $180 (routed). With local fallback: $40.

**Three wiring options:**
1. **Claude Code hooks** — `.claude/hooks/model-router.ts` + settings.json
2. **OpenCode agents** — `.opencode/agents/planner.md`, `implementer.md`, etc. (native support!)
3. **Custom harness** — Python `ModelRouter` class

**Advanced:** Teaching hospital pipeline (Triage→Fellow→Attending→Discharge), escalation triggers (reviewer repeats → escalate to planner, implementer hits token limit → escalate), JSONL logging for verification.

**Key warning from HN:** Don't build a "smart router" that guesses difficulty. Explicit roles win — predictable, auditable, optimizable.

Code ready to drop in: https://terminalblog.com/blog/build-model-router-role-based-assignment-guide/

---

## HACKER NEWS COMMENT DRAFT

**Context:** Post on "Ask HN: How do you control AI coding costs?" or similar

**Comment:**

We dropped AI coding costs 92% by adding a role-based router between the agent and the model provider. The key insight (from an HN thread last week): **don't guess task difficulty — assign models to roles you know in advance.**

Five roles, explicit model mapping:
- Planner → Opus 5.5 (architecture, specs)
- Implementer → Sonnet 5.5 (code, tests)
- Reviewer → Haiku 5.5 (review, security, style)
- Researcher → Gemini Flash (exploration, docs)
- Boilerplate → GPT-6 Luna / local (tests, configs, migrations)

Router is deliberately dumb — just a deterministic map. The intelligence is in the role definitions.

Wiring options for major harnesses:
- **Claude Code:** pre_tool_call hook detects role from tool (todo_write→planner, read→researcher, write→implementer, review→reviewer, generate→boilerplate)
- **OpenCode:** native agent definitions in `.opencode/agents/` — invoke with `@planner`, `@implementer`, etc.
- **Custom:** Python `ModelRouter` class at agent→provider boundary

Bonus: teaching hospital pipeline (Cockroach Labs pattern — 1M+ LOC, 7 reverts in 5 months), escalation triggers, cost logging.

Trap to avoid: "smart router" that guesses difficulty. Dynamic routing = inconsistent, unmeasurable. Explicit roles = predictable, auditable, optimizable.

Full implementation: https://terminalblog.com/blog/build-model-router-role-based-assignment-guide/

---

## MEDIUM CROSS-POST

**Title:** Your AI Agent Burns $200 on Simple Tasks — Here's the Role-Based Router That Fixes It

**Canonical URL:** https://terminalblog.com/blog/build-model-router-role-based-assignment-guide/

**Tags:** AI Coding, Cost Optimization, Claude Code, OpenCode, Developer Tools, Software Architecture

**Body:**

[Full article content from MDX — see canonical URL for complete version]

**CTA at end:**

*Stop overpaying for AI coding. **[aiFiesta](https://aifiesta.link/muhammed-anshad)** gives you Opus, Sonnet, Haiku, GPT-6, Gemini, and 7 more models in one chat for $12/mo — perfect for testing your router against real providers.*

---

## X/TWITTER THREAD (3-5 tweets)

**Tweet 1:** Your AI agent burns $200 on simple tasks because it never says "wait, this is simple, let me use a cheaper model." HN thread (200+ comments) confirmed: agents just plow ahead with Opus. Fix: role-based model router. 🧵

**Tweet 2:** Core insight: don't guess difficulty — assign models to **roles** you know in advance.
Planner → Opus (architecture)
Implementer → Sonnet (code)
Reviewer → Haiku (review/security)
Researcher → Flash (exploration)
Boilerplate → Luna/local (tests/configs)

**Tweet 3:** 100 sessions/month: Opus-only = $2,400. Role-router = $180 (92% savings). + Local fallback = $40 (98%).
Three implementations: Claude Code hooks, OpenCode native agents, Custom harness Python class. All copy-paste ready.

**Tweet 4:** Teaching hospital pipeline (Cockroach Labs): Triage(Haiku)→Fellow(Sonnet)→Attending(Haiku)→Discharge(Local). 1M+ lines, 7 reverts in 5 months. Escalation triggers auto-correct without human intervention.

**Tweet 5:** Trap: don't build a "smart router" that guesses difficulty. Explicit roles = predictable, auditable, optimizable. Dynamic = inconsistent, unmeasurable.
Full guide + code: https://terminalblog.com/blog/build-model-router-role-based-assignment-guide/

---

## PLATFORM POSTING PRIORITY

1. **Reddit r/ClaudeAI** — High engagement, cost optimization topic resonates
2. **Reddit r/cursor** — Direct implementation for Cursor/Claude Code users
3. **Hacker News** — Technical audience, cost optimization is perennial hot topic
4. **Medium** — SEO, evergreen guide content, canonical URL set
5. **X/Twitter** — Thread format, educational value, 3-5 tweets max per week

**Timing:** Post Reddit + HN same day (morning US), Medium next day, X thread spaced over 2 days.