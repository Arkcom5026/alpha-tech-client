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

function Write-Section {
  param([Parameter(Mandatory)][string]$Title)
  Write-Host ''
  Write-Host ('=' * 78) -ForegroundColor DarkGray
  Write-Host " $Title" -ForegroundColor Cyan
  Write-Host ('=' * 78) -ForegroundColor DarkGray
}

function Assert-Repository {
  param([Parameter(Mandatory)][string]$Path, [Parameter(Mandatory)][string]$Label)
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

function Get-HeadSafely {
  param([Parameter(Mandatory)][string]$Path)
  try { return (& git -C $Path rev-parse HEAD).Trim() }
  catch { return 'unavailable' }
}

function Get-LatestReport {
  param([Parameter(Mandatory)][string]$Directory, [Parameter(Mandatory)][datetime]$NotBefore)
  if (-not (Test-Path -LiteralPath $Directory)) { return $null }
  return Get-ChildItem -LiteralPath $Directory -Filter 'alde-*.json' -File |
    Where-Object {
      $_.Name -match '^alde-\d{8}-\d{6}\.json$' -and
      $_.LastWriteTime -ge $NotBefore.AddSeconds(-2)
    } |
    Sort-Object LastWriteTime -Descending |
    Select-Object -First 1
}

function Write-GitHubOutput {
  param([Parameter(Mandatory)][string]$Name, [AllowEmptyString()][string]$Value)
  if ($env:GITHUB_OUTPUT) {
    Add-Content -LiteralPath $env:GITHUB_OUTPUT -Value "$Name=$Value" -Encoding UTF8
  }
}

function Write-GitHubSummary {
  param(
    [Parameter(Mandatory)][string]$Status,
    [Parameter(Mandatory)][string]$ClientHead,
    [Parameter(Mandatory)][string]$ServerHead,
    [string]$ReportPath = '',
    [string]$MetadataPath = '',
    [string]$TranscriptPath = '',
    [object]$Assessment = $null
  )
  if (-not $env:GITHUB_STEP_SUMMARY) { return }
  $lines = @(
    '# Alpha-Tech Local Certification',
    '',
    "- Authority status: **$Status**",
    "- Client HEAD: ``$ClientHead``",
    "- Server HEAD: ``$ServerHead``",
    "- Runner: ``$env:RUNNER_NAME``",
    "- Workflow run: ``$env:GITHUB_RUN_ID``",
    "- Verification report: ``$(if ($ReportPath) { Split-Path -Leaf $ReportPath } else { 'not created' })``",
    "- Transcript: ``$(if ($TranscriptPath) { Split-Path -Leaf $TranscriptPath } else { 'not created' })``",
    "- Runner metadata: ``$(if ($MetadataPath) { Split-Path -Leaf $MetadataPath } else { 'not created' })``"
  )
  if ($Assessment) {
    $lines += @(
      '',
      '## Failure classification',
      '',
      "- Regressions: **$($Assessment.regressionCount)**",
      "- Environment blockers: **$($Assessment.environmentBlockerCount)**",
      "- Safety guards: **$($Assessment.safetyGuardCount)**",
      "- Unclassified: **$($Assessment.unclassifiedCount)**",
      '',
      [string]$Assessment.interpretation
    )
  }
  Add-Content -LiteralPath $env:GITHUB_STEP_SUMMARY -Value ($lines -join [Environment]::NewLine) -Encoding UTF8
}

Write-Section 'ALDE TRANSCRIPT-AWARE CERTIFICATION PIPELINE'
Write-Host "Client repository : $ClientPath"
Write-Host "Server repository : $ServerPath"
Write-Host "Mode              : $Mode"
Write-Host "Required branch   : $RequiredBranch"

Assert-Repository -Path $ClientPath -Label 'Client'
Assert-Repository -Path $ServerPath -Label 'Server'

$aldeScript = Join-Path $ClientPath 'local-build.ps1'
$classifierScript = Join-Path $ClientPath 'tools\runner\classify-alde-failures.ps1'
$preflightScript = Join-Path $ClientPath 'tools\runner\invoke-alde-preflight.ps1'
if (-not (Test-Path -LiteralPath $aldeScript -PathType Leaf)) { throw "ALDE engine does not exist: $aldeScript" }
if (-not (Test-Path -LiteralPath $classifierScript -PathType Leaf)) { throw "ALDE classifier does not exist: $classifierScript" }
if (-not (Test-Path -LiteralPath $preflightScript -PathType Leaf)) { throw "ALDE preflight does not exist: $preflightScript" }

if (-not $EvidencePath) {
  $EvidencePath = if ($env:GITHUB_WORKSPACE) {
    Join-Path $env:GITHUB_WORKSPACE 'alde-evidence'
  }
  else {
    Join-Path $PSScriptRoot 'alde-evidence'
  }
}
if (Test-Path -LiteralPath $EvidencePath) { Remove-Item -LiteralPath $EvidencePath -Recurse -Force }
New-Item -ItemType Directory -Path $EvidencePath -Force | Out-Null

$startedAt = Get-Date
$timestamp = $startedAt.ToString('yyyyMMdd-HHmmss')
$transcriptPath = Join-Path $EvidencePath "alde-transcript-$timestamp.log"
$metadataPath = Join-Path $EvidencePath 'runner-result.json'
$preflightReportPath = Join-Path $EvidencePath "alde-preflight-$timestamp.json"
$publishedReportPath = ''
$preflight = $null
$preflightExitCode = 1
$status = 'FAIL'
$engineExitCode = 1
$assessment = $null
$pipelineError = ''
$transcriptStarted = $false

try {
  # Start-Transcript captures host/native console output without merging PowerShell
  # streams. This preserves the engine's warning/error semantics while ensuring
  # the transcript artifact exists for classification and publication.
  Start-Transcript -LiteralPath $transcriptPath -Force | Out-Null
  $transcriptStarted = $true

  Write-Section 'ALDE RELIABILITY PREFLIGHT'
  & $preflightScript `
    -ClientPath $ClientPath `
    -ServerPath $ServerPath `
    -RequiredBranch $RequiredBranch `
    -ReportPath $preflightReportPath
  $preflightExitCode = $LASTEXITCODE
  $preflight = Get-Content -LiteralPath $preflightReportPath -Raw | ConvertFrom-Json
  if ($preflightExitCode -ne 0) {
    throw "ALDE preflight blocked certification."
  }

  Write-Section 'ALDE ENGINE EXECUTION'
  & $aldeScript `
    -Mode $Mode `
    -ClientPath $ClientPath `
    -ServerPath $ServerPath `
    -RemoteName 'origin' `
    -RequiredBranch $RequiredBranch `
    -RunAllBackendVerifiers `
    -IncludeRuntime

  $engineExitCode = $LASTEXITCODE
  if ($null -eq $engineExitCode) { $engineExitCode = 0 }
}
catch {
  $pipelineError = $_.Exception.Message
  if ($LASTEXITCODE -is [int]) { $engineExitCode = $LASTEXITCODE }
  Write-Warning "ALDE engine returned failure: $pipelineError"
}
finally {
  if ($transcriptStarted) {
    try {
      Stop-Transcript | Out-Null
    }
    catch {
      if (-not $pipelineError) { $pipelineError = $_.Exception.Message }
    }
  }
  if (-not (Test-Path -LiteralPath $transcriptPath -PathType Leaf)) {
    New-Item -ItemType File -Path $transcriptPath -Force | Out-Null
  }

  $artifactDirectory = Join-Path $ClientPath '.artifacts\verification'
  $report = Get-LatestReport -Directory $artifactDirectory -NotBefore $startedAt

  if ($report) {
    $publishedReportPath = Join-Path $EvidencePath $report.Name
    & $classifierScript `
      -ReportPath $report.FullName `
      -TranscriptPath $transcriptPath `
      -OutputPath $publishedReportPath | Out-Host

    $classifiedReport = Get-Content -LiteralPath $publishedReportPath -Raw | ConvertFrom-Json
    $assessment = $classifiedReport.assessment
    $status = [string]$assessment.authorityStatus
  }
  elseif ($engineExitCode -eq 0) {
    $status = 'FAIL'
    $pipelineError = 'ALDE engine exited successfully but did not create a timestamped verification report.'
  }

  $exitCode = switch ($status) {
    'PASS' { 0 }
    'BLOCKED' { 2 }
    default { 1 }
  }

  $clientHead = Get-HeadSafely -Path $ClientPath
  $serverHead = Get-HeadSafely -Path $ServerPath
  $metadata = [ordered]@{
    schemaVersion = 5
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
    engineExitCode = $engineExitCode
    pipelineExitCode = $exitCode
    pipelineError = $pipelineError
    preflight = $preflight
    preflightReportPath = $preflightReportPath
    preflightExitCode = $preflightExitCode
    assessment = $assessment
    reportPath = if ($publishedReportPath) { $publishedReportPath } else { $null }
    transcriptPath = $transcriptPath
  }
  $metadata | ConvertTo-Json -Depth 30 | Set-Content -LiteralPath $metadataPath -Encoding UTF8

  Write-GitHubOutput -Name 'status' -Value $status
  Write-GitHubOutput -Name 'client_head' -Value $clientHead
  Write-GitHubOutput -Name 'server_head' -Value $serverHead
  Write-GitHubOutput -Name 'report_path' -Value $publishedReportPath
  Write-GitHubOutput -Name 'metadata_path' -Value $metadataPath
  Write-GitHubOutput -Name 'transcript_path' -Value $transcriptPath

  Write-GitHubSummary `
    -Status $status `
    -ClientHead $clientHead `
    -ServerHead $serverHead `
    -ReportPath $publishedReportPath `
    -MetadataPath $metadataPath `
    -TranscriptPath $transcriptPath `
    -Assessment $assessment

  Write-Host "[AUTHORITY] status=$status engineExit=$engineExitCode pipelineExit=$exitCode" -ForegroundColor Cyan
}

exit $exitCode
