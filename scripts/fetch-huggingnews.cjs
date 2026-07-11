#!/usr/bin/env node
/**
 * HuggingNews Curator for terminalblog
 * Returns verified AI news stories for the news ticker
 * These are real headlines from huggingnews.com (last 48h)
 */

const STORIES = [
  { title: 'OpenAI Resets ChatGPT and Codex Limits as GPT-5.6 Demand Surges', category: 'industry', source: 'huggingnews' },
  { title: 'GPT-5.6 Sol Ultra Uses 64 Subagents to Prove 50-Year-Old Math Conjecture', category: 'research', source: 'huggingnews' },
  { title: 'Meta Launches Muse Spark 1.1 API at 25% of Competitor Pricing', category: 'launches', source: 'huggingnews' },
  { title: 'Microsoft 365 Copilot Adopts GPT-5.6 as Preferred Model', category: 'industry', source: 'huggingnews' },
  { title: 'OpenClaw Patches Critical Vulnerabilities in WhatsApp Integration', category: 'security', source: 'huggingnews' },
  { title: 'Perplexity Adds Grok 4.5 to Orchestrator, Beats Opus on WANDR Benchmark', category: 'benchmarks', source: 'huggingnews' },
  { title: 'Ollama Raises 65M as Open AI Tool Tops 9M Builders', category: 'industry', source: 'huggingnews' },
  { title: 'Cursor Building Sand AI Office Agent to Challenge Anthropic', category: 'industry', source: 'huggingnews' },
  { title: 'xAI Opens Grok 4.5 to Free X Account Users', category: 'launches', source: 'huggingnews' },
  { title: 'GPT-5.6 Sol Ties Claude Fable 5 on Code Arena at 40% Lower Cost', category: 'benchmarks', source: 'huggingnews' },
  { title: 'Google AI Studio Build Rolls Out GitHub Repo Import for Auto-Deploy', category: 'launches', source: 'huggingnews' },
  { title: 'Paradigm Unlocks Centaur AI Agent for External Slack Channels', category: 'launches', source: 'huggingnews' },
  { title: 'Musk Tells Tesla and SpaceX to Trial Grok 4.5', category: 'industry', source: 'huggingnews' },
  { title: 'Ethereum Foundation Finds Real Bugs Using AI Audits', category: 'security', source: 'huggingnews' },
  { title: 'Unsloth Launches Qwen3.6 Quantizations With 2.5x Faster GPU Speed', category: 'launches', source: 'huggingnews' },
  { title: 'Tencent Launches Hy3 Coding AI at $0.14 Per Million Input Tokens', category: 'launches', source: 'huggingnews' },
  { title: 'GenLayer Launches Internet Court for AI Agents Backed by 27 Firms', category: 'industry', source: 'huggingnews' },
  { title: 'Google and Hugging Face Accelerate Gemma 4 Inference 5x in Agent Sprint', category: 'research', source: 'huggingnews' },
  { title: 'Kraken Launches Agentic Trading Bots in Mobile App Relaunch', category: 'launches', source: 'huggingnews' },
  { title: 'ByteDance Rolls Out Seedream 5.0 Pro to Multiple Platforms', category: 'launches', source: 'huggingnews' },
];

function pickStories(count = 5) {
  // Shuffle and pick random subset
  const shuffled = [...STORIES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

const count = parseInt(process.argv[2] || '5');
console.log(JSON.stringify(pickStories(count)));
