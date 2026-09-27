# Reddit Post for r/ClaudeAI (cross-post to r/programming, r/agenticcoding)

## Title
**"We're collectively saying 'fuck it' to understanding our own code" — 130+ HN comments expose the cognitive debt crisis in agentic coding**

## Body
A Show HN post for Whiteboard (YC W26) — an open-source IDE for "thoughtful software design" — struck a nerve. 134 comments, 403 points. The thread didn't just discuss a product; it exposed a crisis developers are living through daily.

**The term: "cognitive debt"** — the gap between what your codebase *does* and what you *understand* about it.

> "As more PRs were merged without our understanding, we felt a 'cognitive debt' begin to seep in, until it became difficult for us to even contribute to the system." — Whiteboard founders

Three distinct camps emerged from the discussion:

---

### Camp 1: "Review Everything" (Safety-First)
- Human reviews every AI-generated line
- Semantic diffs, decision logs, architectural diagrams are *necessary*
- Cognitive debt is real and dangerous
- Tools: Whiteboard, revue (TUI for narrative reviews), Simon Willison's "linear walkthroughs"

### Camp 2: "Trust the Implementation, Own the Plan" (Velocity)
- Implementation phase is solved; agents don't silently fail plan items
- Human value = defining *what* and *why*, not *how*
- Plan-mode + automated code review = sufficient
- Tools should focus on planning/spec phase

### Camp 3: "This Is All a Nightmare" (Skeptics)
- "Wake me up from this nightmare"
- AI code is bloated, hallucinated, unmaintainable
- Industry is collectively lowering standards
- No tool fixes the fundamental misalignment

---

**Key insights from the thread:**

**The "Plan → Approve → Agent Codes → Review" loop is breaking**
A game developer shared their actual workflow — they tried skipping code review, only plan review. Result: "ended up having to reset weeks of work and knocked out like 50K loc for the exact same features and zero bugs instead of constant bug cleanup."

**Implementation *is* where the spec gets tested.** Tradeoffs only surface when code hits reality.

**The "I Don't Edit" problem** — Whiteboard initially had no file editing. Commenters: "Seems more like IDE is 'I Don't Edit' in this case." Founders renamed "IDE" to "canvas" mid-thread.

**Windows support was the #1 requested feature** — "90% of software engineers I know are on Windows." Mac/Linux only at launch alienated a massive chunk.

**Corporate adoption blockers** — "If you make it hosted only, my guess is you will lose out on users who cannot convince corporate overlords to authorize yet another GitHub app." Local-first = easier approval.

**The memory problem nobody solved** — Buried in a parallel thread (Jevmem): automatic project memory is the missing layer. Developers building their own: DECISIONS.md logs, "Tribunal of 3 agents" for conflict resolution, strict separation of *active* vs *historical* memory.

> "Keeping history and using history are two different things... memory systems need a pretty strict separation between active memory and historical memory."

**The uncomfortable truth:** Go's design drafts are *human-written*. The cognitive load is the point — it forces clarity. Agentic coding *removes* that load. Whiteboard tries to add it back *visually*. But as one commenter noted: "The code writing process is just a cheap effort which makes the spec better and more thorough?" If implementation is cheap, do we lose the discipline that made specs rigorous?

---

**Bottom line: Cognitive debt is the new technical debt.** Technical debt you can measure (cyclomatic complexity, test coverage). Cognitive debt is invisible until you try to change something and realize *nobody knows how it works*.

The tools are early (Whiteboard, revue, Jevmem, deciduous, Canary). None are mature. But developers aren't waiting — they're building workflows, adopting tools, creating rules. Because the alternative — "collectively, 'fuck it'" — ships broken software.

**What's your cognitive debt strategy?** Reviewing every line? Trusting plan-mode? Building your own memory layer?

Full analysis with quotes: https://terminalblog.com/blog/what-developers-think-about-cognitive-debt-from-agentic-coding-hn/

---

*Discussion source: [HN #49833867](https://news.ycombinator.com/item?id=49833867)*