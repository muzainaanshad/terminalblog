#!/usr/bin/env node
/**
 * Cross-platform GSC service-account bootstrap (wraps gcloud).
 *
 * Usage:
 *   node scripts/setup-gsc-service-account.cjs
 *   node scripts/setup-gsc-service-account.cjs --project terminalblog-seo-12345
 *
 * On Windows you can also run:
 *   powershell -ExecutionPolicy Bypass -File scripts/setup-gsc-service-account.ps1
 */

const { execSync, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const ROOT = path.join(__dirname, '..');
const args = process.argv.slice(2);
const projectArg = args.find((a, i) => args[i - 1] === '--project') || null;

function sh(cmd, opts = {}) {
  console.log(`$ ${cmd}`);
  return execSync(cmd, { stdio: 'inherit', shell: true, ...opts });
}

function shJson(cmd) {
  const out = execSync(cmd, { encoding: 'utf8', shell: true });
  return JSON.parse(out || 'null');
}

function hasGcloud() {
  try {
    execSync('gcloud --version', { stdio: 'ignore', shell: true });
    return true;
  } catch {
    return false;
  }
}

function ask(q) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) =>
    rl.question(q, (a) => {
      rl.close();
      resolve(a.trim());
    })
  );
}

async function main() {
  console.log('terminalblog — GSC service account JSON (gcloud)\n');

  if (!hasGcloud()) {
    console.error('gcloud not found on PATH.\n');
    if (process.platform === 'win32') {
      console.error('Run the PowerShell installer script instead:\n');
      console.error(
        '  powershell -ExecutionPolicy Bypass -File scripts/setup-gsc-service-account.ps1\n'
      );
      console.error('Or install: winget install -e --id Google.CloudSDK');
    } else {
      console.error('Install: https://cloud.google.com/sdk/docs/install');
    }
    process.exit(1);
  }

  sh('gcloud auth login --brief');

  let projectId = projectArg;
  if (!projectId) {
    projectId = await ask(
      `GCP project id [terminalblog-seo-${Math.floor(Math.random() * 90000 + 10000)}]: `
    );
    if (!projectId) projectId = `terminalblog-seo-${Math.floor(Math.random() * 90000 + 10000)}`;
  }

  let projects = [];
  try {
    projects = shJson('gcloud projects list --format=json') || [];
  } catch {
    projects = [];
  }
  const exists = projects.some((p) => p.projectId === projectId);
  if (!exists) {
    sh(`gcloud projects create "${projectId}" --name="terminalblog SEO"`);
  }
  sh(`gcloud config set project "${projectId}"`);

  sh('gcloud services enable searchconsole.googleapis.com');
  try {
    sh('gcloud services enable analyticsdata.googleapis.com');
  } catch {
    console.warn('Analytics Data API optional — skipped');
  }

  const saName = 'terminalblog-gsc';
  const saEmail = `${saName}@${projectId}.iam.gserviceaccount.com`;
  const sas = shJson('gcloud iam service-accounts list --format=json') || [];
  if (!sas.some((s) => s.email === saEmail)) {
    sh(
      `gcloud iam service-accounts create ${saName} --display-name="terminalblog Search Console reader"`
    );
  }

  const secretsDir = path.join(ROOT, 'secrets');
  fs.mkdirSync(secretsDir, { recursive: true });
  const keyOut = path.join(secretsDir, 'gsc-service-account.json');
  if (fs.existsSync(keyOut)) {
    fs.renameSync(keyOut, `${keyOut}.bak-${Date.now()}`);
  }

  sh(
    `gcloud iam service-accounts keys create "${keyOut}" --iam-account="${saEmail}"`
  );

  const key = JSON.parse(fs.readFileSync(keyOut, 'utf8'));
  console.log('\n=== SUCCESS ===');
  console.log('JSON:', keyOut);
  console.log('Add this user in GSC (Full):', key.client_email);
  console.log('\nThen:');
  console.log(`  export GOOGLE_APPLICATION_CREDENTIALS="${keyOut}"`);
  console.log('  export GSC_SITE_URL="https://terminalblog.com/"');
  console.log('  npm i -D googleapis && npm run seo:learn');
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
