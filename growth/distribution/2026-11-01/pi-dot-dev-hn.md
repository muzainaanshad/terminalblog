# HN Comment Draft for pi.dev Article

## Article: pi.dev: The Agent That Remembers Everything About Your Codebase

### Option 1 - Technical/Architecture Focus (Top-level comment):

pi.dev takes a different approach to agent memory: instead of stuffing the repo into context or using RAG, it builds a **structured knowledge graph** with three layers:

| Layer | Stores | Query Example |
|-------|--------|---------------|
| Symbolic | Functions, classes, types, imports/exports | "Where is `PaymentProcessor` defined?" |
| Relational | Call graphs, dependency chains, ownership | "What calls `authenticateUser`?" |
| Semantic | Decisions, conventions, patterns, intent | "Why did we choose Redis over Kafka?" |

Indexing pipeline: Tree-sitter parse → cross-file symbol resolution → LLM enrichment (intent/patterns from code+comments+git) → persist to SQLite+vector.

Query pulls relevant subgraph (50-200 nodes) instead of full repo dump. **10-50x cheaper than full-repo context** for large codebases.

Comparison matrix:

| Approach | Cost/Session | Recency | Best For |
|----------|--------------|---------|----------|
| pi.dev (knowledge graph) | ~$0.01 | Perfect | Long-term projects, team conventions |
| Full-repo context | $0.50-5 | Perfect | One-off tasks, small repos |
| RAG (vector) | $0.05-0.20 | Good | Documentation, FAQs |
| Conversation history | Low | Degrades | Chat continuity |
| MemGPT-style | Medium | Good | Very long sessions |

Graph wins on cost at scale + precision (symbol-level vs chunk-level). Tradeoff: first index on 500K LOC monorepo takes 3-8 min.

What changes day to day:
- Code review memory persists (`DeprecatedPattern` nodes linked to symbols)
- Breakage surfaced early via dependency graph tracing (`watch` mode)
- Long tasks survive interruptions (checkpoints every 5 min)
- Onboarding becomes self-serve (agent walks through auth with live refs)

Limits: unusual build systems (Bazel, custom gradle), trust/poisoning risk (mitigated by git attribution + human review), single-repo only.

The agent-that-remembers pairs well with agent-that-executes — let one hold memory, hand edits to terminal agent. Comparisons: pi.dev vs Hermes, vs Gitlawb Zero, vs Amp.

Full breakdown: https://terminalblog.com/blog/pi-dot-dev-remembers-everything-codebase/

---

### Option 2 - Practitioner/Workflow Focus:

Been using agents that forget everything every session. pi.dev's approach — persistent knowledge graph across sessions — changes the daily loop significantly.

The key insight: **amortized context**. Normal agents re-derive your team's conventions, architecture decisions, deprecated patterns every session. pi.dev learns once, persists, and serves relevant slices (50-200 nodes) per query at ~$0.01/session vs $0.50-5 for full-repo context.

Three-layer graph is the differentiator:
- **Symbolic** = precise code navigation (exact symbol locations)
- **Relational** = impact analysis (what breaks if I change X?)
- **Semantic** = intent/why (why did we pick Redis?)

Indexing: Tree-sitter → cross-file resolution → LLM enrichment → SQLite+vector. First pass 3-8 min on 500K LOC, then incremental.

Practical wins:
- Reviewer says "phasing out that pattern" → stored as graph node, persists forever
- Teammate breaks shared util → `watch` mode traces call graph, flags call sites before you hit them
- Long refactor spans days → graph checkpoints every 5 min, survives interruptions
- New hire asks "how does auth work?" → curated walkthrough with live code refs, not stale wiki

Caveats: Bazel/custom build systems may miss generated code. Trust model — continuous learning can absorb adversarial patterns (mitigation: git attribution). Single-repo only currently.

For teams: pair with execution agent (Hermes, OpenCode, terminal agent). Memory layer holds context, execution layer does edits.

Comparisons covered: vs Hermes, vs Gitlawb Zero, vs Amp.

Article: https://terminalblog.com/blog/pi-dot-dev-remembers-everything-codebase/

---

### Option 3 - Short/Punchy (for threading):

The cost difference is the story: pi.dev's knowledge graph serves 50-200 relevant nodes at ~$0.01/session vs $0.50-5 for full-repo context. 10-50x cheaper at scale.

Three layers (symbolic/relational/semantic) means you get precise symbol navigation + impact analysis + intent/why — not just chunk similarity.

First index 3-8 min on 500K LOC, then incremental. Tradeoff: unusual build systems (Bazel) may miss generated code. Trust/poisoning risk mitigated by git attribution.

Pairs with execution agent — memory layer + edit layer separation.

Details: https://terminalblog.com/blog/pi-dot-dev-remembers-everything-codebase/