# Medium Cross-Post: Mistral Just Open-Sourced the Best Coding Model — And It's Called Le Chonk

## Canonical URL
**https://terminalblog.com/blog/mistral-large-4-le-chonk-open-weight-coding-king/**

---

## Medium Title Options:
1. **Mistral Le Chonk: The Open-Weight Coding Model That Finally Catches Up to Closed Source**
2. **1 Trillion Parameters, 47% Fewer Tokens, Beats GLM-5.3 — Mistral Large 4 Review**
3. **Why Mistral's New Open-Weight Model Changes the Coding Agent Game**

---

## Medium Article (with canonical link at top):

**Originally published at: [https://terminalblog.com/blog/mistral-large-4-le-chonk-open-weight-coding-king/](https://terminalblog.com/blog/mistral-large-4-le-chonk-open-weight-coding-king/)**

---

Mistral **October 29** did something the open-source world has been waiting for: they **released the weights** of a 1-trillion-parameter model that **leads every major open-weight coding benchmark**.

Not a preview. Not a distillation. The actual 1T-parameter beast — codenamed **Le Chonk** — is now on Hugging Face, free to download, fine-tune, and deploy on your own infrastructure.

---

## The One-Line Summary

**Mistral Large 4 (Le Chonk) is now the best open-weight model for coding agents.** It tops FrontierCode 2.0 (19.7%), leads Terminal-Bench 4.0 (41%), matches GLM-5.3 on Coding Agent Index with 47% fewer tokens, and scores 51% on Cyber Index — all while refusing 96.6% of malicious requests. Weights are on Hugging Face. License is modified MIT. Start building.

---

## Why This Isn't Just Another Model Release

Every week brings a "new best open model." Most are 7B-32B parameter fine-tunes that shine on one benchmark and collapse on real work.

**Le Chonk is different in three ways:**

### 1. It's a 1 Trillion Parameter MoE — Not a Fine-Tune

Trained from scratch on European infrastructure. Native multimodal. Hybrid instruct-and-reasoning architecture. Three reasoning modes (Low/Medium/High) built into the model itself, not bolted on via prompting.

This is **frontier-scale**, not community-scale.

### 2. The Benchmark Gains Are Real and Sustained

| Benchmark | Le Chonk | Previous Open-Weight Leader | Delta |
|-----------|----------|----------------------------|-------|
| **FrontierCode 2.0** (Cognition) | **19.7%** | GLM-5.3 (17.8%) | +1.9 pts |
| **Terminal-Bench 4.0** | **41%** | DeepSeek V4.1 Flash (31%) | +10 pts |
| **Coding Agent Index** (Artificial Analysis) | **48%** | GLM-5.3 (48%) | Tied |
| **Token Efficiency** (Coding Agent Index) | **47% fewer tokens** | GLM-5.3 | **Massive win** |
| **Cyber Index** (Artificial Analysis) | **51%** | Beam 1.0 (34%) | +17 pts |

The token efficiency is the sleeper story. **Le Chonk delivers frontier coding performance while spending half the tokens.** For agentic workflows where you pay per token, this directly translates to lower costs and longer context windows.

### 3. Human Preference Validates the Benchmarks

Surge Code's blind pairwise evaluations: Le Chonk **beats GLM-5.3 (64%), Kimi K3 (36%), DeepSeek V4.1 Flash (56%)** — and only loses to **Claude Opus 5.5 (22% win rate for Le Chonk)**.

That's not benchmark overfitting. That's human graders preferring its code.

---

## The Three Reasoning Modes: Built-In Cost Control

This is the feature that makes Le Chonk **practical for coding agents**, not just impressive on leaderboards.

| Mode | Use Case | Token Behavior |
|------|----------|----------------|
| **Low** | Simple edits, boilerplate, formatting | Minimal reasoning, fastest/cheapest |
| **Medium** | Everyday tasks, feature implementation, bug fixes | Balanced reasoning |
| **High (default)** | Architecture decisions, complex refactors, security audits | Full reasoning depth |

You don't prompt-engineer this. The model **natively** adjusts its reasoning depth. Your agent orchestrator just sets the mode per task — same philosophy as AmpCode's Dial, but baked into the model weights.

---

## Cybersecurity: The Defender's Model

Le Chonk isn't just "good at coding." It's **built for defensive security work**:

- **51% on Cyber Index** — discovers vulnerabilities, reproduces them, patches them without breaking functionality
- **96.6% refusal rate on malicious cyber requests** — highest among open models (JailbreakBench, StrongREJECT, AgentHarm)
- **Validated by Booz Allen, Cisco, Cloudflare, CrowdStrike, Elastic, ENISA, Fortinet, Microsoft** — not academic evals, production security teams

For coding agents: your agent can now **safely analyze security issues in your codebase** without being tricked into generating exploits. The guardrails distinguish defensive from offensive intent.

---

## How to Actually Use It

### Option 1: Mistral API (Easiest)
```bash
# $0.70/M input, $0.07/M cached input, $2.10/M output
curl -X POST https://api.mistral.ai/v1/chat/completions \
  -H "Authorization: Bearer ***" \
  -d '{"model": "mistral-large-4-0", "messages": [...]}'
```

### Option 2: OpenRouter (Multi-Model Access)
```bash
# Same pricing, unified interface with 200+ other models
# Model ID: mistralai/mistral-large-4-0
```

### Option 3: Self-Host (Full Control)
```bash
# Download weights (huge — plan your storage)
huggingface-cli download mistralai/Mistral-Large-4-1T-A52B

# Serve with vLLM (needs multi-GPU)
vllm serve mistralai/Mistral-Large-4-1T-A52B --tensor-parallel-size 8

# Or NVIDIA NIM (optimized container)
docker run -d --gpus all nvcr.io/nim/mistralai/mistral-large-4-1t-a52b
```

### Option 4: Vibe Code (Mistral's Agentic IDE)
```bash
# Try it free in browser — point at your repo
https://chat.mistral.ai/code?model=mistral-large-4-0
```

---

## What This Means for Your Coding Agent Stack

### If You Run Hermes / OpenCode / Oh My Pi / Goose
**Add Le Chonk as a routing target for High-effort tasks.** Your multi-provider router can now send the hardest coding work to the best open-weight model — at API prices, or free if you self-host.

```yaml
# Example routing config concept
routing:
  high_effort: "mistral:mistral-large-4-0"
  medium_effort: "anthropic:claude-sonnet-5-5"
  low_effort: "local:qwen2.5-coder-32b"
```

### If You're Evaluating Coding Agents
**Le Chonk raises the floor for what "open-weight agent" means.** Any agent that can route to Le Chonk (via API or self-hosted) now has access to **frontier coding capability without vendor lock-in**.

### If You Care About Data Sovereignty
**European-trained, European-hosted option now exists at the frontier.** Mistral's infrastructure is in Europe. For EU companies, government, defense — this matters.

---

## The Honest Limitations

- **Too big for local inference** — 1T parameters needs 8x H100 (or 4x H100 with quantization). Not a laptop model.
- **API latency** — Large MoE models are slower than dense 7B-32B models. For interactive coding, you may prefer smaller models.
- **No native tool calling in weights** — Function calling works via Mistral API/OpenRouter, but the raw weights need an orchestrator (Hermes, OpenCode, etc.) to handle tools.
- **License restriction for MaaS** — If you *sell* model access as a service, you need a commercial license. Normal commercial use (internal tools, products, SaaS) is fine.

---

## The Bigger Picture: Open Weight Just Caught Up

For two years, the narrative was: **"Closed models lead coding; open weights trail by 6-12 months."**

Le Chonk **closes that gap**. It matches or beats the best open weights on every coding benchmark, competes with Claude Opus 5.5 on human preference, and does it with **better token efficiency**.

The implications:
1. **You no longer need Anthropic/OpenAI API keys for frontier coding** — Mistral API or self-host works
2. **Agent orchestrators become the differentiator** — The model is commoditized; how you route, prompt, and manage context wins
3. **European AI sovereignty is real** — Not a policy paper, a 1T parameter model you can download today

---

## Quick Start: Try It in 5 Minutes

```bash
# 1. Get Mistral API key (free tier available)
# https://console.mistral.ai/

# 2. Test with a coding task
export MISTRAL_API_KEY="your-key"
curl -s -X POST https://api.mistral.ai/v1/chat/completions \
  -H "Authorization: Bearer ***" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "mistral-large-4-0",
    "messages": [
      {"role": "user", "content": "Write a Python FastAPI endpoint that validates JWT tokens from a JWKS endpoint, handles key rotation, and returns user claims. Include tests."}
    ],
    "temperature": 0.1
  }' | jq -r '.choices[0].message.content'

# 3. If you like it, integrate into your agent config
# Hermes: add to model routing
# OpenCode: add to provider list
# Custom: use the API directly
```

---

## Bottom Line

**Mistral just gave the open-source community a 1T parameter model that wins at coding.** Not "competitive." **Wins.**

Le Chonk is the first open-weight model where you can credibly say: *"I'll route my hardest agent tasks to this, and it'll cost less than the closed alternatives."*

The weights are on Hugging Face. The API is live. The license lets you build businesses on it.

**The open-weight coding crown has a new king — and it's a very large French cat.**

---

## Related Reading

- [State of Open-Source Coding Agents 2026](https://terminalblog.com/blog/state-of-open-source-coding-agents-2026/)
- [Best Coding Agents 2026 Decision Guide](https://terminalblog.com/blog/best-coding-agents-2026-decision-guide/)
- [Coding Agent Pricing Guide 2026](https://terminalblog.com/blog/coding-agent-pricing-guide-2026/)
- [Why Your Coding Agent Still Forgets Everything](https://terminalblog.com/blog/why-your-coding-agent-still-forgets-everything/)

---

## FAQ

**What is Le Chonk and why the name?**
Le Chonk is the codename for Mistral Large 4 — a 1-trillion-parameter multimodal MoE model. The name signals its scale (it's 'chonk' = huge) and European origin (Le = French). It's Mistral's flagship open-weight release.

**How does it compare to GLM-5.3 and DeepSeek V4.1?**
On Artificial Analysis Coding Agent Index, Le Chonk scores 48% — effectively tied with GLM-5.3 — while using 47% fewer tokens per task. On Terminal-Bench 4.0, it leads open-weight models at 41% (up 13 points from preview) with 30% fewer output tokens.

**Is it actually open weight?**
Yes. Weights available on Hugging Face (mistralai/Mistral-Large-4-1T-A52B) under the Mistral Ecosystem Open-Weight license — a modified MIT that allows free use, modification, fine-tuning, and commercialization. Only Model-as-a-Service providers need a separate commercial license.

**What are the three reasoning modes?**
Low (simple tasks), Medium (everyday), High/default (hardest use cases requiring precision). You pick the effort level; the model adjusts token spend accordingly. This is the same Dial philosophy AmpCode popularized, but baked into the model weights.

**Can I run this locally?**
1 trillion parameters is too big for consumer hardware. You'll need vLLM/SGLang on multi-GPU servers (H100s, A100s) or use Mistral's API ($0.70/M input, $2.10/M output), OpenRouter, or NVIDIA NIM containers. For local coding agents, consider smaller open models like Codestral Mamba or Qwen.

**Why does cybersecurity matter for a coding model?**
Le Chonk scores 51% on Artificial Analysis Cyber Index — highest among open weights — for vulnerability discovery, reproduction, and patching. It refuses 96.6% of malicious cyber requests. For agentic coding, this means your agent can securely analyze and fix security issues without being tricked into offensive tasks.

---

*Mistral Large 4 (Le Chonk) released October 29, 2026. Source: [mistral.ai/news/mistral-large-4-oss](https://mistral.ai/news/mistral-large-4-oss) · Weights: [Hugging Face](https://huggingface.co/mistralai/Mistral-Large-4-1T-A52B) · API: [Mistral Console](https://console.mistral.ai/)*

---

**Canonical URL:** https://terminalblog.com/blog/mistral-large-4-le-chonk-open-weight-coding-king/