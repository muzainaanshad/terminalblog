#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONFIG = {
  repos: [
    { owner: 'NousResearch', name: 'hermes-agent' },
    { owner: 'opencode-ai', name: 'opencode' },
    { owner: 'mimo-code', name: 'mimo' },
    { owner: 'kilocode', name: 'cli' },
    { owner: 'pi-delabs', name: 'pi' },
    { owner: 'gitlawb', name: 'zero' },
    { owner: 'can1357', name: 'oh-my-pi' },
    { owner: 'anthropics', name: 'claude-code' }
  ],
  hoursToLookBack: 24,
  outputDir: path.join(__dirname, '..', 'src', 'content', 'blog'),
  githubApiBase: 'https://api.github.com',
  githubToken: process.env.GITHUB_TOKEN || '',
  bynaraApiKey: process.env.BYNARA_API_KEY || '',
  bynaraModel: 'claude-sonnet-4.5',
  bynaraApiUrl: 'https://router.bynara.id/v1',
  seoKeywords: [
    'autonomous life assistants',
    'workflow orchestration',
    'AI automation',
    'background tasks',
    'productivity tools'
  ]
};

const COMMIT_FILTERS = {
  includePatterns: [
    /feat/i, /feature/i, /add/i, /new/i, /improve/i, /enhance/i,
    /background/i, /automation/i, /workflow/i, /orchestration/i
  ],
  excludePatterns: [
    /chore/i, /docs/i, /readme/i, /typo/i, /bump/i, /version/i,
    /release/i, /merge/i, /revert/i, /test/i, /ci/i, /build/i
  ]
};

async function fetchCommits(owner, repo, sinceDate) {
  const url = `${CONFIG.githubApiBase}/repos/${owner}/${repo}/commits?since=${sinceDate.toISOString()}&per_page=100`;
  const headers = {
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'AI-Content-Engine/1.0'
  };
  if (CONFIG.githubToken) {
    headers['Authorization'] = `Bearer ${CONFIG.githubToken}`;
  }
  try {
    const response = await fetch(url, { headers });
    if (!response.ok) {
      if (response.status === 403) {
        console.warn(`Rate limited for ${owner}/${repo}. Consider adding GITHUB_TOKEN.`);
        return [];
      }
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }
    const commits = await response.json();
    return commits.map(commit => ({
      sha: commit.sha,
      message: commit.commit.message,
      author: commit.commit.author.name,
      date: new Date(commit.commit.author.date),
      url: commit.html_url,
      repo: `${owner}/${repo}`
    }));
  } catch (error) {
    console.error(`Error fetching commits for ${owner}/${repo}:`, error.message);
    return [];
  }
}

function filterCommits(commits) {
  return commits.filter(commit => {
    const message = commit.message.toLowerCase();
    if (COMMIT_FILTERS.excludePatterns.some(p => p.test(message))) return false;
    return COMMIT_FILTERS.includePatterns.some(p => p.test(message));
  });
}

function extractCommitInfo(commit) {
  const typeMatch = commit.message.match(/^(\w+)(?:\(([^)]+)\))?:\s*(.*)/);
  return {
    type: typeMatch ? typeMatch[1] : 'other',
    scope: typeMatch ? typeMatch[2] : null,
    subject: typeMatch ? typeMatch[3] : commit.message,
    repo: commit.repo,
    url: commit.url
  };
}

function generateMockArticle(commits, seoKeywords) {
  const timestamp = new Date().toISOString();
  const title = `How Modern AI Assistants Handle Background Tasks: ${commits.length} New Features Analyzed`;
  const description = 'Discover how autonomous life assistants like Hermes and OpenClaw manage background processes for seamless workflow orchestration.';

  const commitDetails = commits.map(commit => {
    const info = extractCommitInfo(commit);
    return [
      `### ${info.subject}`,
      '',
      `**Repository**: ${commit.repo}`,
      `**Type**: ${info.type}`,
      `**URL**: [View Commit](${commit.url})`,
      '',
      'This feature enables better workflow orchestration and autonomous life assistant capabilities.',
      ''
    ].join('\n');
  }).join('\n');

  const articleLines = [
    '---',
    `title: "${title}"`,
    `description: "${description}"`,
    `pubDate: "${timestamp}"`,
    'author: "Workflow Insights Team"',
    `keywords: "${seoKeywords.join(', ')}"`,
    '---',
    '',
    '# How Modern AI Assistants Handle Background Tasks',
    '',
    'In the rapidly evolving landscape of **autonomous life assistants**, the ability to manage background tasks efficiently has become a critical differentiator. Tools like Hermes and OpenClaw are leading the charge in **workflow orchestration**, enabling users to automate complex processes without manual intervention.',
    '',
    '## The Rise of Background Task Automation',
    '',
    "Traditional coding agents required constant user oversight. Today's autonomous systems can:",
    '',
    '- **Execute long-running processes** without blocking the main workflow',
    '- **Manage concurrent operations** with intelligent resource allocation',
    '- **Handle failures gracefully** with automatic retry mechanisms',
    '- **Provide real-time status updates** through webhook integrations',
    '',
    '## Recent Feature Developments',
    '',
    commitDetails,
    '',
    '## Key Features of Modern Workflow Orchestration',
    '',
    '### 1. Process Isolation',
    '',
    "Modern assistants use containerized execution environments to ensure that background tasks don't interfere with each other or the main application thread.",
    '',
    '```javascript',
    '// Example: Background task execution',
    'const result = await delegate_task({',
    '  goal: "Analyze codebase for security vulnerabilities",',
    '  context: "Focus on authentication and data validation",',
    '  background: true',
    '});',
    '```',
    '',
    '### 2. Intelligent Scheduling',
    '',
    'AI-powered scheduling algorithms determine the optimal time to run tasks based on:',
    '- System resource availability',
    '- User activity patterns',
    '- Task priority levels',
    '- Dependency relationships',
    '',
    '### 3. Result Aggregation',
    '',
    'Instead of overwhelming users with raw data, modern assistants:',
    '- **Compress** large outputs into actionable insights',
    '- **Filter** noise and irrelevant information',
    '- **Prioritize** findings based on impact and urgency',
    '',
    '## Real-World Applications',
    '',
    '### For Developers',
    '',
    '- **Automated code reviews** that run in parallel with development',
    '- **Continuous integration** pipelines that adapt to code changes',
    '- **Dependency updates** that test compatibility before merging',
    '',
    '### For Businesses',
    '',
    '- **Customer data processing** without manual intervention',
    '- **Report generation** on scheduled intervals',
    '- **System monitoring** with automated alerts and remediation',
    '',
    '## The Future of Autonomous Workflows',
    '',
    'As AI assistants continue to evolve, we can expect:',
    '',
    "1. **Predictive task execution** - Systems that anticipate needs before they're explicitly requested",
    '2. **Cross-platform orchestration** - Seamless coordination between different tools and services',
    '3. **Self-optimizing workflows** - Processes that improve themselves based on performance data',
    '4. **Natural language interfaces** - Conversational control over complex automation',
    '',
    '## Conclusion',
    '',
    "The shift from simple coding agents to sophisticated **autonomous life assistants** represents a fundamental change in how we approach productivity. By mastering background task management and workflow orchestration, these tools are not just automating work\u2014they're redefining what's possible.",
    '',
    "For organizations looking to stay competitive, investing in modern workflow automation isn't just an option\u2014it's a necessity. The future belongs to those who can harness the power of intelligent, autonomous systems to work smarter, not harder.",
    ''
  ];

  return articleLines.join('\n');
}

async function generateArticle(commits, seoKeywords) {
  if (!CONFIG.bynaraApiKey) {
    console.error('BYNARA_API_KEY not set. Skipping article generation.');
    return null;
  }

  const commitSummary = commits.map(commit => {
    const info = extractCommitInfo(commit);
    return `- **${commit.repo}**: ${info.subject} (${info.type}) - ${commit.url}`;
  }).join('\n');

  const systemPrompt = `You are an expert technical content writer specializing in AI automation and workflow orchestration. You write SEO-optimized blog articles in MDX format for a publication called "Workflow Orchestration Insights" that covers autonomous life assistants and AI-powered productivity tools.

CRITICAL RULES:
- Use the terminology "autonomous life assistants" and "workflow orchestration" throughout
- The article must be valid MDX (Markdown + JSX) with YAML frontmatter
- Frontmatter fields: title, description, pubDate, author, keywords
- pubDate format: ISO 8601 (e.g., "2026-07-03T12:00:00Z")
- author: always "Workflow Insights Team"
- Length: 1500-2500 words
- Include code examples where appropriate
- Write for developers and technical decision-makers
- Return ONLY the MDX content, no markdown fences around it`;

  const userPrompt = `Write a comprehensive blog article based on these recent developments in autonomous life assistants:

${commitSummary}

Requirements:
1. Focus on broader implications and use cases, not just specific commits
2. Naturally incorporate these keywords: ${seoKeywords.join(', ')}
3. Include practical examples and code snippets
4. Make the content evergreen and valuable beyond specific commits
5. Return the complete MDX article with frontmatter`;

  try {
    const response = await fetch(`${CONFIG.bynaraApiUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CONFIG.bynaraApiKey}`,
      },
      body: JSON.stringify({
        model: CONFIG.bynaraModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 8000,
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`ByNara API error: ${response.status} ${response.statusText} - ${errBody}`);
    }

    const data = await response.json();
    const articleContent = data.choices?.[0]?.message?.content;

    if (!articleContent) {
      throw new Error('No content generated from ByNara API');
    }

    // Strip markdown code fences if the model wrapped the output
    let cleaned = articleContent.trim();
    if (cleaned.startsWith('```mdx')) cleaned = cleaned.slice(6);
    else if (cleaned.startsWith('```md')) cleaned = cleaned.slice(5);
    else if (cleaned.startsWith('```')) cleaned = cleaned.slice(3);
    if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3);
    cleaned = cleaned.trim();

    return cleaned;
  } catch (error) {
    console.error('Error generating article with ByNara:', error.message);
    console.warn('Falling back to mock article generation.');
    return null;
  }
}

function createFilename(title) {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 80) + '.mdx';
}

function saveArticle(articleContent, outputDir) {
  const titleMatch = articleContent.match(/title:\s*"([^"]+)"/);
  const title = titleMatch ? titleMatch[1] : `ai-workflow-article-${Date.now()}`;
  const filename = createFilename(title);
  const filepath = path.join(outputDir, filename);

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  if (fs.existsSync(filepath)) {
    console.warn(`File already exists: ${filename}. Skipping.`);
    return { success: false, filepath, reason: 'already_exists' };
  }

  fs.writeFileSync(filepath, articleContent, 'utf8');
  console.log(`Article saved: ${filepath}`);
  return { success: true, filepath, filename };
}

async function main() {
  console.log('=== AI Content Engine ===');

  const sinceDate = new Date();
  sinceDate.setHours(sinceDate.getHours() - CONFIG.hoursToLookBack);

  console.log(`Fetching commits since: ${sinceDate.toISOString()}`);

  let allCommits = [];
  for (const repo of CONFIG.repos) {
    console.log(`Fetching commits from ${repo.owner}/${repo.name}...`);
    const commits = await fetchCommits(repo.owner, repo.name, sinceDate);
    console.log(`Found ${commits.length} commits from ${repo.owner}/${repo.name}`);
    allCommits = allCommits.concat(commits);
  }

  let filteredCommits = filterCommits(allCommits);
  console.log(`Filtered to ${filteredCommits.length} meaningful commits`);

  if (filteredCommits.length === 0) {
    console.log('No meaningful commits found. Using demo commits for article generation.');
    filteredCommits = [
      {
        sha: 'demo1',
        message: 'feat: add background task delegation for workflow orchestration',
        author: 'Demo Author',
        date: new Date(),
        url: 'https://github.com/NousResearch/hermes-agent/commit/demo1',
        repo: 'NousResearch/hermes-agent'
      },
      {
        sha: 'demo2',
        message: 'feat(orchestration): implement parallel agent scheduling',
        author: 'Demo Author',
        date: new Date(),
        url: 'https://github.com/opencode-ai/opencode/commit/demo2',
        repo: 'opencode-ai/opencode'
      }
    ];
  }

  const articleContent = await generateArticle(filteredCommits, CONFIG.seoKeywords);

  if (!articleContent) {
    console.log('No article generated (API unavailable or error). Exiting.');
    console.log('=== AI Content Engine completed (no output) ===');
    return;
  }

  console.log('Saving article...');
  const result = saveArticle(articleContent, CONFIG.outputDir);

  if (result.success) {
    console.log(`Successfully created article: ${result.filename}`);
    console.log(`Location: ${result.filepath}`);
  } else {
    console.log(`Could not save article: ${result.reason}`);
  }

  console.log('=== AI Content Engine completed ===');
}

main().catch(error => {
  console.error('AI Content Engine failed:', error);
  process.exit(1);
});
