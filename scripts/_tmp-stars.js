const TOKEN = process.env.GITHUB_TOKEN;
const repos = [
  ['github', 'copilot-cli'], ['ampcode', 'amp'], ['NousResearch', 'hermes-agent'],
  ['opencode-ai', 'opencode'], ['mimo-code', 'mimo'], ['kilocode', 'cli'],
  ['pi-delabs', 'pi'], ['gitlawb', 'zero'], ['can1357', 'oh-my-pi'],
  ['aaif-goose', 'goose'], ['openclaw', 'openclaw'], ['CodebuffAI', 'codebuff'],
];
(async () => {
  for (const [owner, name] of repos) {
    const r = await fetch(`https://api.github.com/repos/${owner}/${name}`, {
      headers: { 'Authorization': `Bearer ${TOKEN}`, 'Accept': 'application/vnd.github+json', 'User-Agent': 'tb' }
    });
    const d = await r.json();
    console.log(`${owner}/${name}: ${d.stargazers_count||'?'} stars | ${d.forks_count||'?'} forks | ${d.open_issues_count||'?'} issues`);
  }
})();
