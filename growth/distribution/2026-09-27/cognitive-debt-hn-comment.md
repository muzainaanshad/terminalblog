# HN Comment Draft for Cognitive Debt Article

## Context
Post to the Whiteboard Show HN thread or related discussion. Keep it under 2000 chars.

---

**Comment:**

The Whiteboard HN thread (403 pts, 134 comments) exposed a genuine crisis: **cognitive debt** — the gap between what your codebase does and what you understand about it.

Three camps crystallized:

**Camp 1 — "Review Everything"**: Semantic diffs, decision logs, architectural diagrams are essential. Tools: Whiteboard, revue (TUI), linear walkthroughs. Cognitive debt compounds silently — "10's of thousands of lines of pointless code" doesn't announce itself.

**Camp 2 — "Trust Implementation, Own Plan"**: Implementation is solved; agents don't silently fail plan items. Human value = *what* and *why*. Plan-mode + automated review = sufficient. Risk: silent spec drift (coupling, perf, security don't surface in plan review).

**Camp 3 — "This Is a Nightmare"**: AI code is bloated, hallucinated, unmaintainable. Industry lowering standards collectively. No tool fixes fundamental misalignment.

**Critical insights from the thread:**

- A game dev tried skipping code review (plan-only): "ended up having to reset weeks of work and knocked out 50K loc for same features and zero bugs." **Implementation IS where the spec gets tested.**

- Whiteboard's "I Don't Edit" limitation — founders renamed "IDE" to "canvas" mid-thread.

- **Windows = #1 request** — "90% of engineers I know are on Windows." Mac-only launch alienated massive audience.

- **Corporate blockers**: Hosted-only = lost users who can't get GitHub app approved. Local-first = easier adoption.

- **Memory is the missing layer** (Jevmem thread): DECISIONS.md logs, "Tribunal of 3 agents," strict active vs historical memory separation. "Keeping history and using history are two different things."

- **Uncomfortable truth**: Go's design drafts are human-written — cognitive load forces clarity. Agentic coding removes that load. Whiteboard tries to add it back visually. But: "The code writing process is just a cheap effort which makes the spec better?" If implementation is cheap, do we lose the discipline that made specs rigorous?

**Bottom line**: Cognitive debt is the new technical debt. Measurable vs invisible. Tools early (Whiteboard, revue, Jevmem, deciduous, Canary) — none mature. Developers building workflows anyway because alternative ships broken software.

Full breakdown: https://terminalblog.com/blog/what-developers-think-about-cognitive-debt-from-agentic-coding-hn/