# HN Comment Draft for Cursor 3.27 Article

## Article: Cursor 3.27 Just Made Projects Feel Like a Real IDE

### Option 1 - Technical/Architecture Focus (Top-level comment):

Cursor 3.27 (Oct 22) is the first release where the Agents Window feels like infrastructure rather than a chat panel with extra steps.

Key changes that matter for agent workflows:

1. **Persistent split panes with focus memory** — The pane you focused stays focused across reloads. Editor follows focus. Chats from other Projects reopen in their original splits. This sounds minor but it preserves your mental workspace model — the thing that breaks every time you reload in 3.26.

2. **Project Notes → Task Tracker (List/Board)** — The coordinator maintains a task list with status, assigned agents, linked PRs. Filter chips for status/PR/tags/owner. Multiple PRs collapse to a single pill. This moves task tracking from "external tool" to "built into the agent loop."

3. **Calmer Project startup** — Single "Setting up project" row until first output. Apps panel closed by default. You describe the goal; Cursor handles the choreography.

4. **Send button locks during coordinator execution** — The classic disaster: 20-step migration running, you type a clarification, Send swaps to Stop, you hit Enter, coordinator dies. 3.27 keeps Send as Send while coordinator works. Stop moved elsewhere.

What's still missing (honest):
- Windows Remote Control parity (macOS-first "keep awake")
- Fully offline Projects (cloud compute only)
- Marketplace reviews for 20+ apps
- Rollouts/Security Review on Pro only
- Canvas export (link only, no Notion/Confluence)

The bigger shift: October 2026 wasn't a feature drop — it was a repositioning. The AI coding wars aren't about completions anymore. They're about **what happens after the code is written** — task tracking, context persistence, guardrails that don't require custom pipelines.

Full breakdown: https://terminalblog.com/blog/cursor-3-27-agents-window-projects-split-panes-task-tracking/

---

### Option 2 - Practitioner/Workflow Focus:

Been using Cursor Projects daily. 3.27 is the first release where I don't have to fight the UI to keep my workflow intact.

The split pane persistence alone is worth the update. Before: arrange panes perfectly → reload → everything resets, editor follows wrong pane, chats from Project B bleed into Project A's tab strip. After: focus persists, editor follows focus, cross-Project chats reopen in their splits.

The task tracker in Notes is surprisingly useful. The coordinator actually maintains it — tasks with status, IDs, assigned agents, PRs. Filter by "in-progress" and you see only active work. Click "3 PRs" pill → see all linked PRs. It replaces the external Kanban board for agent-driven work.

Calmer startup matters more than it sounds. New Project used to spin up → conversation reflows through env setup → apps panel open → visual chaos. Now: one "Setting up" row → first output. Apps panel opens when there's something to show.

The Send/Stop fix is the one that saves hours. Anyone who's run a long coordinator task knows the pain: you want to send a quick "also add tests" but the button swapped to Stop. Muscle memory hits Enter. Work lost. 3.27 keeps Send as Send. Simple, critical.

Project picker is now search-first with everything (local, cloud, GitHub) in one list. Paste a clone URL → clone from picker. No more tab switching.

Article has comparison table (Old Cursor vs 3.27) and quick-start commands: https://terminalblog.com/blog/cursor-3-27-agents-window-projects-split-panes-task-tracking/

---

### Option 3 - Short/Punchy (for threading):

The Send button lock in 3.27 is the feature I didn't know I needed until I lost a 20-step migration to an accidental Stop click. 

While coordinator works, Send stays Send. Stop moves elsewhere. You can keep sending clarifications without killing the agent.

Combined with persistent split panes (focus survives reload) and the built-in task tracker (List/Board with filter chips), the Agents Window finally feels like infrastructure.

Missing: offline mode, Windows Remote Control parity, marketplace reviews. But the trajectory is clear — Cursor is building the IDE layer for agent workflows, not just a chat panel.

Details: https://terminalblog.com/blog/cursor-3-27-agents-window-projects-split-panes-task-tracking/