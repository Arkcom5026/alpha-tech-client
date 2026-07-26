param(
  [string]$ClientPath = 'D:\alpha-tech\client',
  [string]$ServerPath = 'D:\alpha-tech\server',
  [ValidateSet('Certify', 'SyncAndCertify')]
  [string]$Mode = 'SyncAndCertify',
  [string]$RequiredBranch = 'main',
  [string]$EvidencePath = ''
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Write-RunnerSection {
  param([Parameter(Mandatory)][string]$Title)
  Write-Host ''
  Write-Host ('=' * 78) -ForegroundColor DarkGray
  Write-Host " $Title" -ForegroundColor Cyan
  Write-Host ('=' * 78) -ForegroundColor DarkGray
}

function Assert-ProjectRepository {
  param(
    [Parameter(Mandatory)][string]$Path,
    [Parameter(Mandatory)][string]$Label
  )

  if (-not (Test-Path -LiteralPath $Path -PathType Container)) {
    throw "$Label repository does not exist: $Path"
  }

  if (-not (Test-Path -LiteralPath (Join-Path $Path '.git'))) {
    throw "$Label path is not a Git repository: $Path"
  }

  if (-not (Test-Path -LiteralPath (Join-Path $Path 'package.json'))) {
    throw "$Label repository does not contain package.json: $Path"
  }
}

function Get-LatestVerificationReport {
  param(
    [Parameter(Mandatory)][string]$ArtifactDirectory,
    [Parameter(Mandatory)][datetime]$NotBefore
  )

  if (-not (Test-Path -LiteralPath $ArtifactDirectory)) {
    return $null
  }

  return Get-ChildItem -LiteralPath $ArtifactDirectory -Filter 'alde-*.json' -File |
    Where-Object {
      $_.Name -match '^alde-\d{8}-\d{6}\.json$' -and
      $_.LastWriteTime -ge $NotBefore.AddSeconds(-2)
    } |
    Sort-Object LastWriteTime -Descending |
    Select-Object -First 1
}

function Write-GitHubOutput {
  param(
    [Parameter(Mandatory)][string]$Name,
    [AllowEmptyString()][string]$Value
  )

  if (-not $env:GITHUB_OUTPUT) { return }
  Add-Content -LiteralPath $env:GITHUB_OUTPUT -Value "$Name=$Value" -Encoding UTF8
}

function Write-GitHubSummary {
  param(
    [Parameter(Mandatory)][string]$Status,
    [Parameter(Mandatory)][string]$ClientHead,
    [Parameter(Mandatory)][string]$ServerHead,
    [string]$ReportPath = '',
    [string]$MetadataPath = ''
  )

  $summaryPath = $env:GITHUB_STEP_SUMMARY
  if (-not $summaryPath) { return }

  $reportDisplay = if ($ReportPath) { Split-Path -Leaf $ReportPath } else { 'not created' }
  $metadataDisplay = if ($MetadataPath) { Split-Path -Leaf $MetadataPath } else { 'not created' }

  $lines = @(
    '# Alpha-Tech Local Certification',
    '',
    "- Status: **$Status**",
    "- Client HEAD: ``$ClientHead``",
    "- Server HEAD: ``$ServerHead``",
    "- Runner: ``$env:RUNNER_NAME``",
    "- Workflow run: ``$env:GITHUB_RUN_ID``",
    "- Verification report: ``$reportDisplay``",
    "- Runner metadata: ``$metadataDisplay``"
  )

  Add-Content -LiteralPath $summaryPath -Value ($lines -join [Environment]::NewLine) -Encoding UTF8
}

Write-RunnerSection 'ALDE SELF-HOSTED RUNNER BRIDGE'
Write-Host "Client repository : $ClientPath"
Write-Host "Server repository : $ServerPath"
Write-Host "Mode              : $Mode"
Write-Host "Required branch   : $RequiredBranch"
Write-Host 'Policy            : Fixed allow-listed ALDE invocation only; no arbitrary shell input.'

Assert-ProjectRepository -Path $ClientPath -Label 'Client'
Assert-ProjectRepository -Path $ServerPath -Label 'Server'

$aldeScript = Join-Path $ClientPath 'local-build.ps1'
if (-not (Test-Path -LiteralPath $aldeScript -PathType Leaf)) {
  throw "ALDE script does not exist: $aldeScript"
}

if (-not $EvidencePath) {
  if ($env:GITHUB_WORKSPACE) {
    $EvidencePath = Join-Path $env:GITHUB_WORKSPACE 'alde-evidence'
  }
  else {
    $EvidencePath = Join-Path $PSScriptRoot 'alde-evidence'
  }
}

if (Test-Path -LiteralPath $EvidencePath) {
  Remove-Item -LiteralPath $EvidencePath -Recurse -Force
}
New-Item -ItemType Directory -Path $EvidencePath -Force | Out-Null

$startedAt = Get-Date
$exitCode = 0
$status = 'FAIL'
$report = $null
$publishedReportPath = ''
$metadataPath = Join-Path $EvidencePath 'runner-result.json'
$clientHead = ''
$serverHead = ''

try {
  & $aldeScript `
    -Mode $Mode `
    -ClientPath $ClientPath `
    -ServerPath $ServerPath `
    -RemoteName 'origin' `
    -RequiredBranch $RequiredBranch `
    -RunAllBackendVerifiers `
    -IncludeRuntime

  $exitCode = $LASTEXITCODE
  if ($null -eq $exitCode) { $exitCode = 0 }
  if ($exitCode -ne 0) {
    throw "ALDE exited with code $exitCode."
  }

  $status = 'PASS'
}
catch {
  if ($exitCode -eq 0) { $exitCode = 1 }
  Write-Error $_
}
finally {
  $artifactDirectory = Join-Path $ClientPath '.artifacts\verification'
  $report = Get-LatestVerificationReport -ArtifactDirectory $artifactDirectory -NotBefore $startedAt

  if ($report) {
    $publishedReportPath = Join-Path $EvidencePath $report.Name
    Copy-Item -LiteralPath $report.FullName -Destination $publishedReportPath -Force
    Write-Host "Published verification report: $publishedReportPath"
  }

  try { $clientHead = (& git -C $ClientPath rev-parse HEAD).Trim() } catch { $clientHead = 'unavailable' }
  try { $serverHead = (& git -C $ServerPath rev-parse HEAD).Trim() } catch { $serverHead = 'unavailable' }

  $metadata = [ordered]@{
    schemaVersion = 2
    status = $status
    mode = $Mode
    startedAt = $startedAt.ToUniversalTime().ToString('o')
    finishedAt = (Get-Date).ToUniversalTime().ToString('o')
    runnerName = $env:RUNNER_NAME
    workflowRunId = $env:GITHUB_RUN_ID
    clientPath = $ClientPath
    serverPath = $ServerPath
    clientHead = $clientHead
    serverHead = $serverHead
    reportFile = if ($report) { $report.Name } else { $null }
    reportPath = if ($report) { $report.FullName } else { $null }
    publishedReportPath = if ($publishedReportPath) { $publishedReportPath } else { $null }
    exitCode = $exitCode
  }

  $metadata | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath $metadataPath -Encoding UTF8

  Write-GitHubOutput -Name 'status' -Value $status
  Write-GitHubOutput -Name 'client_head' -Value $clientHead
  Write-GitHubOutput -Name 'server_head' -Value $serverHead
  Write-GitHubOutput -Name 'report_path' -Value $publishedReportPath
  Write-GitHubOutput -Name 'metadata_path' -Value $metadataPath

  Write-GitHubSummary `
    -Status $status `
    -ClientHead $clientHead `
    -ServerHead $serverHead `
    -ReportPath $publishedReportPath `
    -MetadataPath $metadataPath
}

if (-not $report) {
  Write-Warning 'No timestamped ALDE verification report was created during this runner invocation.'
}

exit $exitCode
