#Requires -Version 5.1
<#
.SYNOPSIS
  Programmatically create a Google Cloud service-account JSON key for Search Console.

.DESCRIPTION
  1) Ensures Google Cloud SDK (gcloud) is installed (winget)
  2) Logs you in (browser)
  3) Creates/selects a GCP project
  4) Enables Search Console API (+ optional Analytics Data API)
  5) Creates service account terminalblog-gsc
  6) Downloads JSON key to secrets/gsc-service-account.json (gitignored)
  7) Prints the exact email to add in Search Console Users

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File scripts/setup-gsc-service-account.ps1

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File scripts/setup-gsc-service-account.ps1 -ProjectId "terminalblog-seo-12345"
#>
param(
  [string]$ProjectId = "",
  [string]$SaName = "terminalblog-gsc",
  [string]$KeyOut = "",
  [switch]$SkipAnalytics,
  [switch]$Yes
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
if (-not $KeyOut) {
  $KeyOut = Join-Path $Root "secrets\gsc-service-account.json"
}
$SecretsDir = Split-Path -Parent $KeyOut

function Write-Step($n, $msg) {
  Write-Host ""
  Write-Host "==> [$n] $msg" -ForegroundColor Cyan
}

function Ensure-Gcloud {
  $gcloud = Get-Command gcloud -ErrorAction SilentlyContinue
  if ($gcloud) {
    Write-Host "gcloud found: $($gcloud.Source)"
    return
  }
  Write-Step "0" "gcloud not found — installing Google Cloud SDK via winget"
  $winget = Get-Command winget -ErrorAction SilentlyContinue
  if (-not $winget) {
    throw @"
winget not available. Install Google Cloud SDK manually:
  https://cloud.google.com/sdk/docs/install
Then re-run this script.
"@
  }
  winget install -e --id Google.CloudSDK --accept-package-agreements --accept-source-agreements
  # Refresh PATH for this session
  $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" +
              [System.Environment]::GetEnvironmentVariable("Path", "User")
  $gcloud = Get-Command gcloud -ErrorAction SilentlyContinue
  if (-not $gcloud) {
    throw "gcloud still not on PATH. Close this terminal, open a new one, re-run the script."
  }
}

function Invoke-Gcloud {
  param([Parameter(ValueFromRemainingArguments = $true)][string[]]$GcloudArgs)
  & gcloud @GcloudArgs
  if ($LASTEXITCODE -ne 0) {
    throw "gcloud failed: gcloud $($GcloudArgs -join ' ')"
  }
}

Write-Host "terminalblog — GSC service account JSON generator" -ForegroundColor Green
Write-Host "Output key: $KeyOut"

Ensure-Gcloud

Write-Step "1" "Login to Google (browser will open)"
if (-not $Yes) {
  Write-Host "Press Enter to start gcloud auth login..."
  [void][Console]::ReadLine()
}
# Application default + user login (needed for project/SA admin)
try {
  Invoke-Gcloud auth login --brief
} catch {
  Invoke-Gcloud auth login
}

Write-Step "2" "Resolve GCP project"
if (-not $ProjectId) {
  $suggested = "terminalblog-seo-" + (Get-Random -Maximum 99999)
  Write-Host "Suggested project id: $suggested"
  $ProjectId = Read-Host "Enter new or existing GCP project id (letters/numbers/hyphens)"
  if (-not $ProjectId) { $ProjectId = $suggested }
}

$projectsJson = & gcloud projects list --format=json 2>$null
$exists = $false
if ($projectsJson) {
  $projects = $projectsJson | ConvertFrom-Json
  $exists = $null -ne ($projects | Where-Object { $_.projectId -eq $ProjectId })
}

if (-not $exists) {
  Write-Host "Creating project $ProjectId ..."
  Invoke-Gcloud projects create $ProjectId --name="terminalblog SEO"
} else {
  Write-Host "Using existing project $ProjectId"
}

Invoke-Gcloud config set project $ProjectId

Write-Step "3" "Link billing (required for some APIs — free tier OK)"
Write-Host "If Search Console API enable fails, open:"
Write-Host "  https://console.cloud.google.com/billing/linkedaccount?project=$ProjectId"
Write-Host "and attach any billing account (GSC API itself is free)."

Write-Step "4" "Enable APIs"
Invoke-Gcloud services enable searchconsole.googleapis.com --project $ProjectId
if (-not $SkipAnalytics) {
  try {
    Invoke-Gcloud services enable analyticsdata.googleapis.com --project $ProjectId
  } catch {
    Write-Host "Analytics Data API enable skipped/failed (optional): $_" -ForegroundColor Yellow
  }
}

Write-Step "5" "Create service account"
$SaEmail = "$SaName@$ProjectId.iam.gserviceaccount.com"
$saList = & gcloud iam service-accounts list --project $ProjectId --format=json | ConvertFrom-Json
$saExists = $null -ne ($saList | Where-Object { $_.email -eq $SaEmail })
if (-not $saExists) {
  Invoke-Gcloud iam service-accounts create $SaName `
    --project $ProjectId `
    --display-name "terminalblog Search Console reader"
} else {
  Write-Host "Service account already exists: $SaEmail"
}

Write-Step "6" "Download JSON key"
New-Item -ItemType Directory -Force -Path $SecretsDir | Out-Null
if (Test-Path $KeyOut) {
  $bak = "$KeyOut.bak-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
  Move-Item $KeyOut $bak
  Write-Host "Backed up existing key to $bak"
}
Invoke-Gcloud iam service-accounts keys create $KeyOut `
  --iam-account $SaEmail `
  --project $ProjectId

# Ensure gitignore
$gi = Join-Path $Root ".gitignore"
$ignoreLines = @("secrets/", "**/gsc-service-account.json", ".gcloud/")
if (Test-Path $gi) {
  $cur = Get-Content $gi -Raw
  foreach ($line in $ignoreLines) {
    if ($cur -notmatch [regex]::Escape($line)) {
      Add-Content $gi "`n$line"
    }
  }
}

# Validate JSON shape
$keyObj = Get-Content $KeyOut -Raw | ConvertFrom-Json
if (-not $keyObj.client_email -or -not $keyObj.private_key) {
  throw "Key file missing client_email/private_key — generation failed"
}

Write-Step "7" "DONE — key file generated"
Write-Host ""
Write-Host "JSON path:  $KeyOut" -ForegroundColor Green
Write-Host "SA email:   $($keyObj.client_email)" -ForegroundColor Green
Write-Host "project_id: $($keyObj.project_id)"
Write-Host ""
Write-Host "========== MANUAL STEP (cannot be automated) ==========" -ForegroundColor Yellow
Write-Host "1. Open Google Search Console:"
Write-Host "   https://search.google.com/search-console"
Write-Host "2. Select property: https://terminalblog.com/"
Write-Host "3. Settings → Users and permissions → Add user"
Write-Host "4. Paste this email (Full permission):"
Write-Host "   $($keyObj.client_email)" -ForegroundColor Cyan
Write-Host "5. Wait 1–5 minutes, then run:"
Write-Host ""
Write-Host '   $env:GOOGLE_APPLICATION_CREDENTIALS = "' + $KeyOut + '"'
Write-Host '   $env:GSC_SITE_URL = "https://terminalblog.com/"'
Write-Host "   cd $Root"
Write-Host "   npm i -D googleapis"
Write-Host "   npm run seo:learn"
Write-Host "========================================================" -ForegroundColor Yellow

# Optional: write helper env file (local only)
$envSample = Join-Path $SecretsDir "gsc.env.ps1"
@"
# Local only — do not commit
`$env:GOOGLE_APPLICATION_CREDENTIALS = "$KeyOut"
`$env:GSC_SITE_URL = "https://terminalblog.com/"
Write-Host "GSC env loaded. SA: $($keyObj.client_email)"
"@ | Set-Content $envSample -Encoding UTF8
Write-Host "Helper: . $envSample"
