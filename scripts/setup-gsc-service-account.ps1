#Requires -Version 5.1
# Generate Google Search Console service-account JSON via gcloud.
# Usage:
#   powershell -ExecutionPolicy Bypass -File scripts\setup-gsc-service-account.ps1
#   powershell -ExecutionPolicy Bypass -File scripts\setup-gsc-service-account.ps1 -ProjectId "terminalblog-seo-12345" -Yes

param(
  [string]$ProjectId = "",
  [string]$SaName = "terminalblog-gsc",
  [string]$KeyOut = "",
  [switch]$SkipAnalytics,
  [switch]$Yes
)

$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
if ([string]::IsNullOrWhiteSpace($KeyOut)) {
  $KeyOut = Join-Path $Root "secrets\gsc-service-account.json"
}
$SecretsDir = Split-Path -Parent $KeyOut

function Write-Step {
  param([string]$Num, [string]$Msg)
  Write-Host ""
  Write-Host ("==> [{0}] {1}" -f $Num, $Msg) -ForegroundColor Cyan
}

function Ensure-Gcloud {
  $cmd = Get-Command gcloud -ErrorAction SilentlyContinue
  if ($null -ne $cmd) {
    Write-Host ("gcloud found: {0}" -f $cmd.Source)
    return
  }

  Write-Step "0" "gcloud not found - installing Google Cloud SDK via winget"
  $winget = Get-Command winget -ErrorAction SilentlyContinue
  if ($null -eq $winget) {
    throw "winget not available. Install Cloud SDK from https://cloud.google.com/sdk/docs/install then re-run."
  }

  winget install -e --id Google.CloudSDK --accept-package-agreements --accept-source-agreements

  $machinePath = [System.Environment]::GetEnvironmentVariable("Path", "Machine")
  $userPath = [System.Environment]::GetEnvironmentVariable("Path", "User")
  $env:Path = $machinePath + ";" + $userPath

  $cmd = Get-Command gcloud -ErrorAction SilentlyContinue
  if ($null -eq $cmd) {
    throw "gcloud still not on PATH. Close this terminal, open a new one, re-run the script."
  }
}

function Invoke-Gcloud {
  param([Parameter(ValueFromRemainingArguments = $true)][string[]]$GcloudArgs)
  & gcloud @GcloudArgs
  if ($LASTEXITCODE -ne 0) {
    throw ("gcloud failed: gcloud {0}" -f ($GcloudArgs -join " "))
  }
}

Write-Host "terminalblog - GSC service account JSON generator" -ForegroundColor Green
Write-Host ("Output key: {0}" -f $KeyOut)

Ensure-Gcloud

Write-Step "1" "Login to Google (browser will open)"
if (-not $Yes) {
  Write-Host "Press Enter to start gcloud auth login..."
  [void][Console]::ReadLine()
}
Invoke-Gcloud auth login --brief

Write-Step "2" "Resolve GCP project"
if ([string]::IsNullOrWhiteSpace($ProjectId)) {
  $suggested = "terminalblog-seo-" + (Get-Random -Maximum 99999)
  Write-Host ("Suggested project id: {0}" -f $suggested)
  $ProjectId = Read-Host "Enter new or existing GCP project id"
  if ([string]::IsNullOrWhiteSpace($ProjectId)) {
    $ProjectId = $suggested
  }
}

$projectsJson = & gcloud projects list --format=json 2>$null
$exists = $false
if ($projectsJson) {
  $projects = $projectsJson | ConvertFrom-Json
  foreach ($p in $projects) {
    if ($p.projectId -eq $ProjectId) { $exists = $true }
  }
}

if (-not $exists) {
  Write-Host ("Creating project {0} ..." -f $ProjectId)
  Invoke-Gcloud projects create $ProjectId --name="terminalblog SEO"
} else {
  Write-Host ("Using existing project {0}" -f $ProjectId)
}

Invoke-Gcloud config set project $ProjectId

Write-Step "3" "Billing note (free tier OK)"
Write-Host "If API enable fails, link billing:"
Write-Host ("  https://console.cloud.google.com/billing/linkedaccount?project={0}" -f $ProjectId)

Write-Step "4" "Enable APIs"
Invoke-Gcloud services enable searchconsole.googleapis.com --project $ProjectId
if (-not $SkipAnalytics) {
  try {
    Invoke-Gcloud services enable analyticsdata.googleapis.com --project $ProjectId
  } catch {
    Write-Host "Analytics Data API optional - skipped" -ForegroundColor Yellow
  }
}

Write-Step "5" "Create service account"
$SaEmail = "{0}@{1}.iam.gserviceaccount.com" -f $SaName, $ProjectId
$saList = & gcloud iam service-accounts list --project $ProjectId --format=json | ConvertFrom-Json
$saExists = $false
foreach ($s in $saList) {
  if ($s.email -eq $SaEmail) { $saExists = $true }
}
if (-not $saExists) {
  Invoke-Gcloud iam service-accounts create $SaName --project $ProjectId --display-name "terminalblog Search Console reader"
} else {
  Write-Host ("Service account already exists: {0}" -f $SaEmail)
}

Write-Step "6" "Download JSON key"
New-Item -ItemType Directory -Force -Path $SecretsDir | Out-Null
if (Test-Path $KeyOut) {
  $bak = "{0}.bak-{1}" -f $KeyOut, (Get-Date -Format "yyyyMMdd-HHmmss")
  Move-Item $KeyOut $bak
  Write-Host ("Backed up existing key to {0}" -f $bak)
}
Invoke-Gcloud iam service-accounts keys create $KeyOut --iam-account $SaEmail --project $ProjectId

$gi = Join-Path $Root ".gitignore"
$ignoreLines = @("secrets/", "**/gsc-service-account.json", ".gcloud/")
if (Test-Path $gi) {
  $cur = Get-Content $gi -Raw
  foreach ($line in $ignoreLines) {
    if ($cur -notmatch [regex]::Escape($line)) {
      Add-Content $gi ("`n" + $line)
    }
  }
}

$keyObj = Get-Content $KeyOut -Raw | ConvertFrom-Json
if (-not $keyObj.client_email -or -not $keyObj.private_key) {
  throw "Key file missing client_email/private_key - generation failed"
}

Write-Step "7" "DONE"
Write-Host ""
Write-Host ("JSON path:  {0}" -f $KeyOut) -ForegroundColor Green
Write-Host ("SA email:   {0}" -f $keyObj.client_email) -ForegroundColor Green
Write-Host ("project_id: {0}" -f $keyObj.project_id)
Write-Host ""
Write-Host "========== MANUAL STEP (GSC) ==========" -ForegroundColor Yellow
Write-Host "1. Open https://search.google.com/search-console"
Write-Host "2. Select property: https://terminalblog.com/"
Write-Host "3. Settings -> Users and permissions -> Add user"
Write-Host "4. Paste this email (Full permission):"
Write-Host ("   {0}" -f $keyObj.client_email) -ForegroundColor Cyan
Write-Host "5. Wait a few minutes, then run:"
Write-Host ""
Write-Host ('   $env:GOOGLE_APPLICATION_CREDENTIALS = "{0}"' -f $KeyOut)
Write-Host '   $env:GSC_SITE_URL = "https://terminalblog.com/"'
Write-Host ("   cd {0}" -f $Root)
Write-Host "   npm i -D googleapis"
Write-Host "   npm run seo:learn"
Write-Host "========================================" -ForegroundColor Yellow

$envSample = Join-Path $SecretsDir "gsc.env.ps1"
@(
  "# Local only - do not commit",
  ('$env:GOOGLE_APPLICATION_CREDENTIALS = "{0}"' -f $KeyOut),
  '$env:GSC_SITE_URL = "https://terminalblog.com/"',
  ('Write-Host "GSC env loaded. SA: {0}"' -f $keyObj.client_email)
) | Set-Content $envSample -Encoding ASCII
Write-Host ("Helper: . {0}" -f $envSample)
