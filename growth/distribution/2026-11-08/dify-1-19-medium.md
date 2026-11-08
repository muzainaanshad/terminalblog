# Medium Cross-Post: Dify 1.19 Just Made Nested Workflow Tracing Real

**Canonical URL:** https://terminalblog.com/blog/dify-1-19-0-nested-workflow-tracing-agent-files/

---

Dify 1.19.0 dropped November 4, 2026 — and it's the release that finally lets you **see inside a Workflow Tool, all the way down to its LLM calls**. Nested workflow tracing lands across Langfuse, LangSmith, Opik, Weave, Arize, Phoenix, Aliyun, MLflow, Databricks, and Tencent. Plus: portable App packages that carry their Workflow Tools with them, batch Agent file uploads with inline PDF preview, and OpenAPI/CLI Skill management.

If you build multi-agent workflows on Dify, this is the observability upgrade you've been waiting for.

---

## The One-Line Summary

**Dify 1.19.0 (Nov 4) → Nested workflow tracing in all major observability backends, portable App packages (format v2) with bundled Workflow Tools, batch Agent file uploads + inline PDF/source preview, difyctl Skill CRUD, Docker Compose 2.35+ required, Python 3.13 / Node 24.22.1+ / pnpm 12.16.1 for source deploys.**

---

## The Headline: Nested Workflow Tracing (Finally)

### What It Was

You run a workflow. It calls a Workflow Tool. That tool calls another Workflow Tool. In your tracing backend (Langfuse, LangSmith, etc.), you saw... the outer workflow. The inner calls were a black box. You couldn't see *which* LLM calls happened inside the nested tool, what prompts were sent, or where tokens burned.

### What It Is Now

**External traces now include the persisted execution steps inside called Workflow Tools.** Child steps appear beneath the Tool span that invoked them, preserving the hierarchy across nested and repeated calls.

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

**Key details:**
- Works with Langfuse, LangSmith, Opik, Weave, Arize, Phoenix, Aliyun, MLflow, Databricks, Tencent
- Independently nested workflow runs remain separate traces linked by parent identifiers
- Historical traces are **not backfilled** — only new executions get the richer hierarchy
- New trace queue: `OPS_TRACE_QUEUE=ops_trace_v2` (defaults to this; API, workers, and Beat must agree)

---

## Portable App Packages: Take Your Workflow Tools With You

### The Problem

You export a Dify app that uses Workflow Tools. You import it elsewhere. The Workflow Tools **don't come with it**. You have to recreate them manually, hope the versions match, and wire them back up.

### The Fix

**`.ifpkg` packages now include the workflows behind called Workflow Tools at their bound versions, including transitive dependencies.** Import reuses tools already in the destination workspace and recreates, publishes, and registers missing ones, remapping their references.

```bash
# Export includes Workflow Tools (up to 20 bundled by default, configurable via APP_PACKAGE_MAX_WORKFLOW_TOOLS)
# Import: missing tools recreated + published, existing tools reused
# All exports now use package format v2 (including apps without Workflow Tools)
```

**Why it matters:** Your app + its agent workflows become a **single deployable unit**. No more "it works on my Dify but not yours."

---

## Batch Agent File Uploads + Inline Preview

### What's New

- **Multi-select / multi-file drop** → parallel uploads → one atomic binding request
- **Inline PDF preview** — read research briefs, specs, PDFs directly in the Agent file preview
- **Syntax-highlighted source files** — Python, JS, TS, etc. with line numbers
- **Truncation notices** — you know when text was cut off
- **Stale save protection** — concurrent Composer saves preserve the latest files

```
Before: Upload one file → wait → upload another → hope order doesn't matter
After:  Drop 5 files → parallel upload → single atomic bind → done
```

---

## Migration Checklist

| Requirement | Version |
|-------------|---------|
| Docker Compose | 2.35+ |
| Python (source) | 3.13 |
| Node (source) | 24.22.1+ |
| pnpm (source) | 12.16.1 |
| Trace queue | `OPS_TRACE_QUEUE=ops_trace_v2` |

---

*Originally published on [TerminalBlog](https://terminalblog.com/blog/dify-1-19-0-nested-workflow-tracing-agent-files/) — the quality-first AI coding agents blog.*