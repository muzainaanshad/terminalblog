# HN Comment Draft

## Context
Dify 1.19.0 (Nov 4) ships nested workflow tracing — the observability feature agent builders have been blocked on.

## Comment
Been waiting for this. The "black box" problem with nested Workflow Tools was the main reason I couldn't fully trust Dify for production multi-agent workflows. You'd see the outer span in Langfuse/LangSmith, but the actual LLM calls inside the called workflow were invisible.

The hierarchy preservation is the key detail here — child steps appear *beneath* the Tool span that invoked them, across nested and repeated calls. That means you can actually trace:
- Which sub-workflow hallucinated
- Token costs per sub-workflow (not just aggregate)
- Full execution tree for debugging

Also notable: portable App packages (`.ifpkg` format v2) now bundle Workflow Tools with their bound versions + transitive deps. Import reuses existing tools, recreates missing ones, remaps references. Finally solves "works on my Dify, not yours."

Migration note: Docker Compose 2.35+, Python 3.13, Node 24.22.1+, pnpm 12.16.1 for source deploys. Historical traces NOT backfilled — only new executions get richer hierarchy. New trace queue `OPS_TRACE_QUEUE=ops_trace_v2`.

Full write-up: https://terminalblog.com/blog/dify-1-19-0-nested-workflow-tracing-agent-files/

Curious what observability backend others are using — Langfuse? LangSmith? Self-hosted Opik?