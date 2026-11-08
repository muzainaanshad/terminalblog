# Reddit Post for r/ClaudeAI / r/LocalLLaMA / r/Agents

## Title
**Dify 1.19 Finally Ships Nested Workflow Tracing — You Can Now See Inside Every Agent Call, All the Way Down**

## Body
Dify 1.19.0 dropped November 4th and it's the observability upgrade agent builders have been waiting for: **nested workflow tracing** now works across Langfuse, LangSmith, Opik, Weave, Arize, Phoenix, Aliyun, MLflow, Databricks, and Tencent.

### The Problem
You run a workflow. It calls a Workflow Tool. That tool calls another Workflow Tool. In your tracing backend, you saw... the outer workflow. The inner calls were a black box. You couldn't see *which* LLM calls happened inside the nested tool, what prompts were sent, or where tokens burned.

### The Fix
External traces now include the persisted execution steps inside called Workflow Tools. Child steps appear beneath the Tool span that invoked them, preserving the hierarchy across nested and repeated calls.

```
Before:  [Outer Workflow] → [Workflow Tool: "research-agent"] → ??? (black box)
After:   [Outer Workflow]
           └─ [Workflow Tool: "research-agent"]
               ├─ [LLM Call: planner] → prompt, response, tokens
               ├─ [Workflow Tool: "web-search"]
               │    └─ [LLM Call: summarizer] → prompt, response, tokens
               └─ [LLM Call: synthesizer] → prompt, response, tokens
```

**Why it matters:** You can now debug *why* a nested agent hallucinated, trace token costs per sub-workflow, and see the full execution tree — not just the top level.

---

### Two Other Big Features in 1.19

**1. Portable App Packages (format v2)** — Your app + its Workflow Tools now export as a single `.ifpkg` file. Import recreates missing tools, publishes them, and remaps references. No more "it works on my Dify but not yours."

**2. Batch Agent File Uploads + Inline Preview** — Multi-file drop, parallel uploads, atomic binding. Inline PDF preview (read research briefs directly in the Agent), syntax-highlighted source files, truncation notices, stale save protection.

---

### Migration Notes
- Docker Compose 2.35+ required
- Python 3.13 / Node 24.22.1+ / pnpm 12.16.1 for source deploys
- New trace queue: `OPS_TRACE_QUEUE=ops_trace_v2` (defaults to this)
- Historical traces are **not backfilled** — only new executions get the richer hierarchy

---

**Full article:** https://terminalblog.com/blog/dify-1-19-0-nested-workflow-tracing-agent-files/

*What's your current observability stack for agent workflows? Langfuse? LangSmith? Something else?*