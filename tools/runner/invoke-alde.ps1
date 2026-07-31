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

function Get-CommandVersion {
  param(
    [Parameter(Mandatory)][string]$Command,
    [Parameter(Mandatory)][string[]]$Arguments
  )

  $resolved = Get-Command $Command -ErrorAction SilentlyContinue | Select-Object -First 1
  if (-not $resolved) {
    throw "Required executable is not available: $Command"
  }

  $output = & $Command @Arguments 2>&1
  if ($LASTEXITCODE -ne 0) {
    throw "$Command version check failed with exit code $LASTEXITCODE."
  }

  return ([string]($output | Select-Object -First 1)).Trim()
}

function ConvertTo-SemanticVersion {
  param(
    [Parameter(Mandatory)][string]$Value,
    [Parameter(Mandatory)][string]$Label
  )

  $match = [regex]::Match($Value, '(\d+)\.(\d+)(?:\.(\d+))?')
  if (-not $match.Success) {
    throw "Could not parse $Label version from '$Value'."
  }

  $patch = if ($match.Groups[3].Success) { [int]$match.Groups[3].Value } else { 0 }
  return [version]::new([int]$match.Groups[1].Value, [int]$match.Groups[2].Value, $patch)
}

function Invoke-RunnerPolicyGate {
  Write-RunnerSection 'ALDE RUNNER POLICY GATE'

  $minimumPowerShell = [version]'5.1.0'
  $minimumNode = [version]'20.0.0'
  $minimumNpm = [version]'10.0.0'

  $powerShellVersion = $PSVersionTable.PSVersion
  if ($powerShellVersion -lt $minimumPowerShell) {
    throw "PowerShell $powerShellVersion is below required version $minimumPowerShell."
  }

  if ($env:GITHUB_ACTIONS -eq 'true') {
    if ($env:RUNNER_OS -ne 'Windows') {
      throw "ALDE requires a Windows runner; received '$env:RUNNER_OS'."
    }
    if (-not $env:RUNNER_NAME) {
      throw 'GitHub Actions runner name is unavailable.'
    }
  }

  $gitText = Get-CommandVersion -Command 'git' -Arguments @('--version')
  $nodeText = Get-CommandVersion -Command 'node' -Arguments @('--version')
  $npmText = Get-CommandVersion -Command 'npm' -Arguments @('--version')
  $nodeVersion = ConvertTo-SemanticVersion -Value $nodeText -Label 'Node.js'
  $npmVersion = ConvertTo-SemanticVersion -Value $npmText -Label 'npm'

  if ($nodeVersion -lt $minimumNode) {
    throw "Node.js $nodeVersion is below required version $minimumNode."
  }
  if ($npmVersion -lt $minimumNpm) {
    throw "npm $npmVersion is below required version $minimumNpm."
  }

  $policy = [ordered]@{
    status = 'PASS'
    policyVersion = 2
    runnerName = $env:RUNNER_NAME
    runnerOS = $env:RUNNER_OS
    powershell = $powerShellVersion.ToString()
    git = $gitText
    node = $nodeText
    npm = $npmText
    requirements = [ordered]@{
      windowsRunner = $true
      minimumPowerShell = $minimumPowerShell.ToString()
      minimumNode = $minimumNode.ToString()
      minimumNpm = $minimumNpm.ToString()
      requiredBranch = $RequiredBranch
      cleanCommitBoundCertification = $true
      outcomeTaxonomy = @('PASS', 'FAIL', 'BLOCKED')
      failureClasses = @('REGRESSION', 'ENVIRONMENT_BLOCKER', 'SAFETY_GUARD')
    }
  }

  Write-Host "[PASS] Runner policy v$($policy.policyVersion)" -ForegroundColor Green
  Write-Host "[TOOL] $gitText" -ForegroundColor DarkGreen
  Write-Host "[TOOL] Node.js $nodeText" -ForegroundColor DarkGreen
  Write-Host "[TOOL] npm $npmText" -ForegroundColor DarkGreen
  Write-Host "[TOOL] PowerShell $powerShellVersion" -ForegroundColor DarkGreen

  return $policy
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

function Get-GateFailureClass {
  param(
    [Parameter(Mandatory)][string]$Name,
    [string]$Detail = ''
  )

  $text = "$Name`n$Detail"

  if ($text -match '(?i)TEST_DATABASE_AUTHORITY_REJECTED|RESTORE_DATABASE_ENVIRONMENT|RESTORE_DATABASE_PROJECT_REF|RESTORE_DATABASE_WRITE_APPROVAL|ALLOW_PARTNER_STORE_RUNTIME_TEST') {
    return 'SAFETY_GUARD'
  }

  if ($text -match '(?i)EPERM|EBUSY|operation not permitted|file.*(lock|locked)|port.*already in use|EADDRINUSE|access is denied|permission denied') {
    return 'ENVIRONMENT_BLOCKER'
  }

  return 'REGRESSION'
}

function Add-OutcomeAssessment {
  param([Parameter(Mandatory)][object]$VerificationReport)

  $classifiedGates = @()
  foreach ($gate in @($VerificationReport.gates)) {
    $failureClass = $null
    if ([string]$gate.status -eq 'FAIL') {
      $failureClass = Get-GateFailureClass -Name ([string]$gate.name) -Detail ([string]$gate.detail)
    }

    $classifiedGates += [ordered]@{
      name = [string]$gate.name
      status = [string]$gate.status
      failureClass = $failureClass
      durationSeconds = $gate.durationSeconds
      detail = [string]$gate.detail
    }
  }

  $regressionCount = @($classifiedGates | Where-Object { $_.failureClass -eq 'REGRESSION' }).Count
  $environmentBlockerCount = @($classifiedGates | Where-Object { $_.failureClass -eq 'ENVIRONMENT_BLOCKER' }).Count
  $safetyGuardCount = @($classifiedGates | Where-Object { $_.failureClass -eq 'SAFETY_GUARD' }).Count
  $failedCount = @($classifiedGates | Where-Object { $_.status -eq 'FAIL' }).Count

  $authorityStatus = if ($failedCount -eq 0) {
    'PASS'
  }
  elseif ($regressionCount -gt 0) {
    'FAIL'
  }
  else {
    'BLOCKED'
  }

  $assessment = [ordered]@{
    schemaVersion = 1
    authorityStatus = $authorityStatus
    regressionCount = $regressionCount
    environmentBlockerCount = $environmentBlockerCount
    safetyGuardCount = $safetyGuardCount
    failedGateCount = $failedCount
    interpretation = if ($authorityStatus -eq 'PASS') {
      'All certification gates passed.'
    }
    elseif ($authorityStatus -eq 'BLOCKED') {
      'No source regression was identified, but certification is blocked by environment or explicit safety authority requirements.'
    }
    else {
      'At least one source or executable-contract regression requires correction before certification can pass.'
    }
    gates = $classifiedGates
  }

  $VerificationReport | Add-Member -NotePropertyName assessment -NotePropertyValue $assessment -Force
  return $assessment
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
    [string]$MetadataPath = '',
    [string]$PolicyStatus = 'NOT_RUN',
    [object]$Assessment = $null
  )

  $summaryPath = $env:GITHUB_STEP_SUMMARY
  if (-not $summaryPath) { return }

  $reportDisplay = if ($ReportPath) { Split-Path -Leaf $ReportPath } else { 'not created' }
  $metadataDisplay = if ($MetadataPath) { Split-Path -Leaf $MetadataPath } else { 'not created' }

  $lines = @(
    '# Alpha-Tech Local Certification',
    '',
    "- Authority status: **$Status**",
    "- Runner policy: **$PolicyStatus**",
    "- Client HEAD: ``$ClientHead``",
    "- Server HEAD: ``$ServerHead``",
    "- Runner: ``$env:RUNNER_NAME``",
    "- Workflow run: ``$env:GITHUB_RUN_ID``",
    "- Verification report: ``$reportDisplay``",
    "- Runner metadata: ``$metadataDisplay``"
  )

  if ($Assessment) {
    $lines += @(
      '',
      '## Failure classification',
      '',
      "- Regressions: **$($Assessment.regressionCount)**",
      "- Environment blockers: **$($Assessment.environmentBlockerCount)**",
      "- Safety guards: **$($Assessment.safetyGuardCount)**",
      '',
      $Assessment.interpretation
    )
  }

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
$runnerPolicy = $null
$assessment = $null

try {
  $runnerPolicy = Invoke-RunnerPolicyGate

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
    $reportData = Get-Content -LiteralPath $report.FullName -Raw | ConvertFrom-Json
    $assessment = Add-OutcomeAssessment -VerificationReport $reportData
    $status = [string]$assessment.authorityStatus
    if ($status -eq 'PASS') {
      $exitCode = 0
    }
    elseif ($status -eq 'BLOCKED') {
      $exitCode = 2
    }
    else {
      $exitCode = 1
    }

    $publishedReportPath = Join-Path $EvidencePath $report.Name
    $reportData | ConvertTo-Json -Depth 20 | Set-Content -LiteralPath $publishedReportPath -Encoding UTF8
    Write-Host "Published classified verification report: $publishedReportPath"
    Write-Host "[ASSESS] authority=$status regressions=$($assessment.regressionCount) environment=$($assessment.environmentBlockerCount) safety=$($assessment.safetyGuardCount)" -ForegroundColor Cyan
  }

  try { $clientHead = (& git -C $ClientPath rev-parse HEAD).Trim() } catch { $clientHead = 'unavailable' }
  try { $serverHead = (& git -C $ServerPath rev-parse HEAD).Trim() } catch { $serverHead = 'unavailable' }

  $metadata = [ordered]@{
    schemaVersion = 4
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
    runnerPolicy = $runnerPolicy
    assessment = $assessment
    reportFile = if ($report) { $report.Name } else { $null }
    reportPath = if ($report) { $report.FullName } else { $null }
    publishedReportPath = if ($publishedReportPath) { $publishedReportPath } else { $null }
    exitCode = $exitCode
  }

  $metadata | ConvertTo-Json -Depth 20 | Set-Content -LiteralPath $metadataPath -Encoding UTF8

  Write-GitHubOutput -Name 'status' -Value $status
  Write-GitHubOutput -Name 'client_head' -Value $clientHead
  Write-GitHubOutput -Name 'server_head' -Value $serverHead
  Write-GitHubOutput -Name 'report_path' -Value $publishedReportPath
  Write-GitHubOutput -Name 'metadata_path' -Value $metadataPath

  $policyStatus = if ($runnerPolicy) { [string]$runnerPolicy.status } else { 'FAIL' }
  Write-GitHubSummary `
    -Status $status `
    -ClientHead $clientHead `
    -ServerHead $serverHead `
    -ReportPath $publishedReportPath `
    -MetadataPath $metadataPath `
    -PolicyStatus $policyStatus `
    -Assessment $assessment
}

if (-not $report) {
  Write-Warning 'No timestamped ALDE verification report was created during this runner invocation.'
}

exit $exitCode
