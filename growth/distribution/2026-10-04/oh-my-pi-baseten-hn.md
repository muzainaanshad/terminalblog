# Hacker News Comment Draft: Oh My Pi + Baseten Integration

## Article URL
https://terminalblog.com/blog/oh-my-pi-baseten-provider-integration/

## Primary Comment (top-level)

**Title**: Oh My Pi integrated Baseten — open models now match closed-source speed/cost for coding agents

**Comment**:
```
Oh My Pi just added Baseten as a native model provider. This is significant because Baseten is the inference platform that actually closed the gap between open and closed models for coding workloads.

**The technical core:**
- Continuous batching at kernel level
- Speculative decoding (2-3x throughput on code gen)
- Paged attention / KV cache management for 100K+ token contexts
- Swappable TensorRT-LLM / vLLM / SGLang backends per model

**Benchmarks (Oct 2026):**
- Llama 3.1 70B: 80+ tokens/sec
- Qwen 2.5 72B: 100+ tokens/sec
- On par with GPT-4o/Claude proprietary stacks

**Autoscaling for bursty agent workloads:**
- Idle → 50 concurrent: <2s warm pool vs 30-60s cold start
- 50 → 500: automatic, sub-second
- Scale to zero: automatic, no cost when idle

**Cost:**
- Llama 3.1 70B: $0.30/$0.60 per 1M in/out (~85% cheaper than GPT-4o)
- Qwen 2.5 72B: $0.40/$0.80 (~80% cheaper)
- DeepSeek V3: $0.25/$0.50 (~90% cheaper)

For coding agents (10K-100K tokens/session), inference costs drop from dollars to cents per task.

**Why native Baseten vs OpenRouter?**
OpenRouter aggregates Baseten but native API unlocks:
- Speculative decoding, custom LoRA serving, webhook callbacks
- 50-100ms lower latency (no middleware)
- Dedicated capacity (reserve GPUs for team)
- HIPAA/SOC2 on dedicated deployments

**Model routing is now practical:**
```yaml
task_overrides:
  code_generation: "baseten/qwen-2.5-coder-72b"
  reasoning: "baseten/deepseek-r1"
  quick_edits: "baseten/llama-3.1-8b"
  architecture: "openai/o1-preview"
```

**Local-cloud parity (same model, three modes):**
| Mode | Latency | Cost | Privacy |
|------|---------|------|---------|
| Local (Ollama) | ~20 tok/s | Free | Full |
| Baseten shared | ~80 tok/s | $0.40/1M out | Shared |
| Baseten dedicated | ~120 tok/s | $2-5/hr | Isolated |

Same weights, prompts, tool schemas. Zero code changes. Enterprise path: prototype locally → scale to cloud → dedicate for compliance.

**Fine-tuning enters the loop:**
LoRA adapters hot-swappable at inference. Repo-specific adapters learn your patterns. Task-specific adapters for tests, refactoring, GraphQL. Automated training from agent sessions planned 2027.

The "open model penalty" has effectively disappeared for 90% of coding tasks. The remaining 10% (extreme long-horizon reasoning, novel algorithms) still favors o1-class, but DeepSeek R1 and Qwen QwQ are closing that gap.

Full breakdown with provider landscape map, dedicated deployment math (breaks even at ~3 heavy users), and roadmap in article.
```

---

## Follow-up Comments

### Reply to "How does this compare to Together AI / Fireworks?"
```
Together and Fireworks are great but have different model catalogs, APIs, pricing. Baseten has arguably the broadest open-model catalog + best inference optimization + most generous free tier (1M tokens/mo free). It becomes the default for "I want open models without managing GPUs."

The article includes a provider landscape map showing where Baseten fits vs Together, Fireworks, Replicate, Lepton, HF TGI. Key differentiator: spec decoding + custom LoRA + webhooks + dedicated capacity all native.
```

### Reply to "Speculative decoding details?"
```
Baseten's spec decoding: a small draft model (e.g., Llama 3.1 8B) proposes tokens, the target model (e.g., Qwen 2.5 72B) verifies in parallel. 2-3x throughput gains on code generation specifically because code has high token predictability (boilerplate, patterns, syntax).

This is kernel-level optimization, not just model serving. Combined with continuous batching and paged attention, it's why they hit 100+ tok/sec on 72B models. The swappable backend (TensorRT-LLM/vLLM/SGLang) means they tune per model architecture.
```

### Reply to "What about local-first / Ollama?"
```
Article explicitly covers local-cloud parity: same model (Qwen 2.5 Coder 32B) runs three ways with identical prompts/tool schemas:
- Local (Ollama): ~20 tok/s, free, full privacy
- Baseten shared: ~80 tok/s, $0.40/1M out
- Baseten dedicated: ~120 tok/s, $2-5/hr reserved

Zero code changes across environments. Devs prototype locally free, deploy to Baseten for speed, dedicate for compliance. This is huge for enterprise adoption.

Fine-tuning: LoRA adapters hot-swappable at inference. Repo-specific adapters learn your codebase. Task-specific for test gen, refactoring, GraphQL. Automated training from agent sessions planned 2027.
```

### Reply to "Dedicated deployment math?"
```
~$4-6/hr for 4xH100. For 5-person team running agents 8hrs/day: ~$1,000/mo vs $15-50/seat for closed-source subscriptions. Breaks even at ~3 heavy users.

The article has the full baseten deployment create command and cost breakdown.
```

---

## Submission Notes
- **Submit as**: Link post to article URL
- **Title**: "Oh My Pi integrated Baseten — open models (Qwen 2.5 Coder, DeepSeek, Llama 3.1) now match closed-source speed/cost for coding agents"
- **Timing**: Weekday 8-10 AM EST
- **Engage technically** on inference optimization, model routing, local-cloud parity
- **No self-promotion** beyond technical discussion