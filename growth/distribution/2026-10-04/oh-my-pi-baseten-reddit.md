# Reddit Distribution Package: Oh My Pi + Baseten Integration

## Target Subreddits
- **r/LocalLLaMA** (primary - open model inference focus)
- **r/MachineLearning** (secondary - inference optimization)
- **r/cursor** (tertiary - coding agent model routing)

---

## r/LocalLLaMA Post

### Title Options
1. **Oh My Pi integrated Baseten — open models (Qwen 2.5 Coder, DeepSeek, Llama 3.1) now match closed-source speed/cost for coding agents** (recommended)
2. **Baseten + Oh My Pi: The first coding agent where open models are a production-ready default, not a fallback**
3. **Open models caught up: Qwen 2.5 Coder 72B at 100+ tok/sec, 80% cheaper than GPT-4o — now natively in Oh My Pi**

### Body
```
Oh My Pi just integrated Baseten as a first-class model provider, and it's a bigger deal than it sounds for anyone running coding agents on open models.

**The short version:** Baseten is the inference platform that bridged the gap between open and closed models. Llama 3.1 70B at 80+ tokens/sec, Qwen 2.5 72B at 100+ tokens/sec — on par with GPT-4o/Claude, but with open weights you can audit, fine-tune, and self-host.

**What Baseten brings to Oh My Pi:**

**Speed — optimized inference, not just hosting:**
- Continuous batching at kernel level
- Speculative decoding (2-3x throughput on code gen)
- Paged attention / KV cache management for 100K+ token contexts
- Swappable TensorRT-LLM / vLLM / SGLang backends

**Scale — zero to hundreds, no cold starts:**
| Scenario | Traditional | Baseten |
|----------|-------------|---------|
| Idle → 50 concurrent | 30-60s cold start | <2s warm pool |
| 50 → 500 requests | Manual/queue | Auto, sub-second |
| Scale to zero | Manual/slow | Automatic, no cost when idle |

**Choice — full open catalog, day zero:**
Qwen 2.5 Coder 32B/72B (Apache 2.0), DeepSeek V3/R1, Mistral Large 2/Nemo, Llama 3.1 8B/70B/405B, Gemma 2, Phi-3.5/4 — all available same week they drop on HF.

**Cost — pay-per-token, often cheaper than closed:**
| Model | Input/1M | Output/1M | vs GPT-4o |
|-------|----------|-----------|-----------|
| Llama 3.1 70B | $0.30 | $0.60 | ~85% cheaper |
| Qwen 2.5 72B | $0.40 | $0.80 | ~80% cheaper |
| DeepSeek V3 | $0.25 | $0.50 | ~90% cheaper |

For high-volume coding agents (10K-100K tokens/session), this cuts inference costs from dollars to cents per task.

**Why not just OpenRouter?**
OpenRouter aggregates Baseten. But native integration unlocks:
- Spec decoding, custom LoRA serving, webhooks (native API only)
- 50-100ms lower latency (no middleware)
- Webhooks for async agent workflows
- Dedicated capacity (reserve GPUs for team)
- HIPAA/SOC2 on dedicated deployments

**Model-agnostic agents are now practical:**
```yaml
# .oh-my-pi/config.yaml
models:
  default: "baseten/qwen-2.5-coder-72b"
  fallback:
    - "openai/gpt-4o"
    - "anthropic/claude-3.5-sonnet"
    - "baseten/deepseek-v3"
  task_overrides:
    code_generation: "baseten/qwen-2.5-coder-72b"
    reasoning: "baseten/deepseek-r1"
    quick_edits: "baseten/llama-3.1-8b"
    architecture: "openai/o1-preview"
```

Your agent routes each subtask to the optimal model — open or closed — without micromanaging.

**Local-first becomes real, not compromise:**
Same model (Qwen 2.5 Coder 32B) runs three ways:
| Mode | Latency | Cost | Privacy | Use Case |
|------|---------|------|---------|----------|
| Local (Ollama) | ~20 tok/s | $0 (your GPU) | Full | Offline, sensitive |
| Baseten shared | ~80 tok/s | $0.40/1M out | Shared | Daily driver |
| Baseten dedicated | ~120 tok/s | $2-5/hr | Isolated | Team/compliance |

Same weights, same prompts, same tool schemas. Only inference backend changes. Devs prototype locally free, deploy to Baseten for speed, dedicate for compliance — zero code changes.

**Fine-tuning enters the agent loop:**
Baseten supports LoRA fine-tuning on your data. Repo-specific adapters (learn your patterns/conventions), task-specific adapters (write tests, refactor to TS, generate GraphQL), hot-swap at inference time. Oh My Pi can already pass `lora_adapter` to Baseten. Automated adapter training ("agent notices your test style → triggers fine-tune → uses new adapter next session") coming 2027.

**The strategic shift:** For two years, narrative was "closed leads, open follows 6-12 months behind." Baseten changed the economics: open models now match closed on speed/cost, lead on flexibility. The "open model penalty" has effectively disappeared for 90% of coding tasks.

Quick start (2 min):
```bash
# 1. Get Baseten API key (free: 1M tokens/mo)
#    https://app.baseten.co/settings/api-keys

# 2. Add to Oh My Pi
omp config set providers.baseten.api_key "YOUR_KEY"

# 3. Pick model
omp model list --provider baseten

# 4. Set default
omp model default baseten/qwen-2.5-coder-72b
```

Full deep-dive with provider landscape map, routing configs, dedicated deployment math, and roadmap: https://terminalblog.com/blog/oh-my-pi-baseten-provider-integration/

What's your current inference setup for coding agents? Still on closed APIs, or experimenting with open models?
```

---

## r/MachineLearning Post

### Title
**Baseten inference optimization (speculative decoding, continuous batching, paged attention) now natively integrated into Oh My Pi coding agent — open models match GPT-4o speed**

### Body
```
Baseten's inference stack optimization is now a first-class provider in Oh My Pi, making open models (Llama 3.1, Qwen 2.5, DeepSeek, Mistral) viable production defaults for coding agents.

Key technical details from the integration:

**Inference optimizations shipped:**
- **Continuous batching** at kernel level — dynamic request batching maximizing GPU utilization
- **Speculative decoding** — small draft model proposes tokens, larger verifies; 2-3x throughput on code generation
- **Paged attention / KV cache management** — efficient memory for 100K+ token contexts (critical for coding agents)
- **Swappable backends** — TensorRT-LLM / vLLM / SGLang tuned per model architecture

**Benchmarks (Oct 2026):**
- Llama 3.1 70B: 80+ tokens/sec
- Qwen 2.5 72B: 100+ tokens/sec
- On par with OpenAI/Anthropic proprietary stacks

**Autoscaling for bursty agent workloads:**
- Idle → 50 concurrent: <2s (warm pool) vs 30-60s cold start
- 50 → 500 requests: automatic, sub-second
- Scale to zero: automatic, no cost when idle

**Cost structure:**
- Llama 3.1 70B: $0.30/$0.60 per 1M in/out (~85% cheaper than GPT-4o)
- Qwen 2.5 72B: $0.40/$0.80 (~80% cheaper)
- DeepSeek V3: $0.25/$0.50 (~90% cheaper)

For coding agents consuming 10K-100K tokens/session, inference costs drop from dollars to cents per task.

**Native vs OpenRouter:**
Native Baseten API unlocks speculative decoding, custom LoRA serving, webhook callbacks, dedicated capacity, HIPAA/SOC2 — unavailable via OpenRouter middleware. Direct connection = 50-100ms lower latency.

**Model routing architecture:**
Oh My Pi's provider abstraction enables task-based routing:
```yaml
task_overrides:
  code_generation: "baseten/qwen-2.5-coder-72b"
  reasoning: "baseten/deepseek-r1"
  quick_edits: "baseten/llama-3.1-8b"
  architecture: "openai/o1-preview"
```

**Local-cloud parity:**
Same model weights run three modes with identical prompts/tool schemas:
- Local (Ollama): ~20 tok/s, free, full privacy
- Baseten shared: ~80 tok/s, $0.40/1M out
- Baseten dedicated: ~120 tok/s, $2-5/hr reserved

Zero code changes across environments. Enterprise path: prototype locally → scale to cloud → dedicate for compliance.

**Fine-tuning integration:**
LoRA adapters hot-swappable at inference. Repo-specific adapters learn your codebase patterns. Task-specific adapters for test gen, refactoring, GraphQL. Automated training from agent sessions planned 2027.

Full technical breakdown: https://terminalblog.com/blog/oh-my-pi-baseten-provider-integration/
```

---

## r/cursor Post

### Title
**Oh My Pi + Baseten: Task-based model routing (open + closed) now works natively — route code gen to Qwen 2.5 Coder, reasoning to DeepSeek, quick edits to Llama 8B**

### Body
```
Cursor users: this is the model routing pattern Codebuff/AmpCode pioneered, now available in open-source Oh My Pi with Baseten integration.

**The routing config:**
```yaml
models:
  default: "baseten/qwen-2.5-coder-32b"
  routing:
    - pattern: "*test*"
      model: "baseten/qwen-2.5-coder-72b"  # best for test gen
    - pattern: "*refactor*"
      model: "baseten/deepseek-v3"          # strong reasoning
    - pattern: "*quick*|*fix*"
      model: "baseten/llama-3.1-8b"         # fast, cheap
    - pattern: "*architect*|*design*"
      model: "openai/o1-preview"            # still best for high-level
```

Your agent picks the optimal model per subtask automatically. Open models (Qwen, DeepSeek, Llama) now match closed on speed/cost for 90% of coding tasks.

**Why this matters for Cursor users:** The "model router" pattern is becoming standard. Cursor will likely add similar routing. Understanding how open models fit into the routing matrix (where they win, where closed still leads) helps you evaluate whether Cursor's built-in routing is sufficient or you need BYO model flexibility.

**Open vs closed breakdown for coding:**
| Dimension | Closed (GPT-4o, Claude) | Open on Baseten (Qwen, Llama, DeepSeek) |
|-----------|-------------------------|------------------------------------------|
| Raw coding | Slight edge complex refactors | Catching up fast (Qwen 2.5 Coder ≈ GPT-4o) |
| Speed | Fast | **Faster** (spec decoding, no queue) |
| Cost | $2.50-15/1M out | **$0.50-2.00/1M out** |
| Context | 128K-200K | 128K-1M (Llama 3.1, Qwen 2.5) |
| Fine-tuning | Limited/expensive | **Full LoRA/full-weight, cheap** |
| Privacy | Trust vendor | **Self-host or dedicated** |
| License | Proprietary | **Apache 2.0/MIT — commercial OK** |
| Lock-in | High | **Zero — weights are yours** |

Full analysis with dedicated deployment math (breaks even at ~3 heavy users), roadmap, and quick-start: https://terminalblog.com/blog/oh-my-pi-baseten-provider-integration/

Curious: Does Cursor's model selection feel sufficient, or do you want BYO model routing like this?
```

---

## Cross-Post Notes
- **Canonical URL**: https://terminalblog.com/blog/oh-my-pi-baseten-provider-integration/
- **Post timing**: Stagger by 2-3 hours
- **Engagement**: Technical replies, no self-promotion beyond canonical link
- **r/LocalLLaMA**: Focus on open model parity, local-cloud parity
- **r/MachineLearning**: Focus on inference optimization details
- **r/cursor**: Focus on model routing pattern relevance