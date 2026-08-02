param(
  [Parameter(Mandatory)][string]$ReportPath,
  [Parameter(Mandatory)][string]$TranscriptPath,
  [string]$OutputPath = ''
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Get-GateTranscript {
  param(
    [Parameter(Mandatory)][string]$Transcript,
    [Parameter(Mandatory)][string]$GateName
  )

  $escapedName = [regex]::Escape($GateName)
  $pattern = "(?ms)^\[RUN \]\s+$escapedName\s*$.*?(?=^\[RUN \]\s+|^={20,}\s*$|\z)"
  $match = [regex]::Match($Transcript, $pattern)
  if ($match.Success) { return $match.Value.Trim() }
  return ''
}

function Resolve-FailureClassification {
  param(
    [Parameter(Mandatory)][string]$GateName,
    [string]$Detail = '',
    [string]$Transcript = ''
  )

  $evidence = "$GateName`n$Detail`n$Transcript"

  $preflightPatterns = @(
    [ordered]@{ pattern = "Repository .* is on branch '.*';\s*expected '.*'"; reasonCode = 'REQUIRED_BRANCH_MISMATCH' },
    [ordered]@{ pattern = 'working tree is not clean|Repository .* is dirty'; reasonCode = 'WORKING_TREE_NOT_CLEAN' },
    [ordered]@{ pattern = 'does not exist:|is not a Git repository|does not contain package\.json'; reasonCode = 'REPOSITORY_PRECONDITION_FAILED' },
    [ordered]@{ pattern = 'fatal: detected dubious ownership'; reasonCode = 'GIT_SAFE_DIRECTORY_REQUIRED' },
    [ordered]@{ pattern = 'PRISMA_GENERATE_LOCK_RISK|SERVER_NODE_PROCESS_ACTIVE'; reasonCode = 'PRISMA_GENERATE_LOCK_RISK' }
  )

  foreach ($rule in $preflightPatterns) {
    if ($evidence -match "(?is)$($rule.pattern)") {
      return [ordered]@{
        failureClass = 'ENVIRONMENT_BLOCKER'
        reasonCode = [string]$rule.reasonCode
        matchedPattern = [string]$rule.pattern
      }
    }
  }

  $safetyPatterns = @(
    'TEST_DATABASE_AUTHORITY_REJECTED',
    'RESTORE_DATABASE_ENVIRONMENT\s+must equal\s+TEST',
    'RESTORE_DATABASE_PROJECT_REF\s+must equal',
    'RESTORE_DATABASE_WRITE_APPROVAL\s+must equal',
    'Refusing runtime write',
    'ALLOW_PARTNER_STORE_RUNTIME_TEST\s*=\s*true',
    'explicit approval',
    'write approval'
  )

  foreach ($pattern in $safetyPatterns) {
    if ($evidence -match "(?i)$pattern") {
      return [ordered]@{
        failureClass = 'SAFETY_GUARD'
        reasonCode = 'EXPLICIT_AUTHORITY_REQUIRED'
        matchedPattern = $pattern
      }
    }
  }

  $environmentPatterns = @(
    'EPERM',
    'EBUSY',
    'EACCES',
    'operation not permitted',
    'access is denied',
    'permission denied',
    'resource busy',
    'file.*(?:lock|locked)',
    'query_engine-windows\.dll\.node',
    'EADDRINUSE',
    'port.*already in use',
    'ECONNREFUSED',
    'timed? out',
    'network.*(?:unavailable|failure)',
    'Could not resolve host'
  )

  foreach ($pattern in $environmentPatterns) {
    if ($evidence -match "(?i)$pattern") {
      return [ordered]@{
        failureClass = 'ENVIRONMENT_BLOCKER'
        reasonCode = 'EXECUTION_ENVIRONMENT_BLOCKED'
        matchedPattern = $pattern
      }
    }
  }

  $regressionPatterns = @(
    'AssertionError',
    'expected .* to (?:contain|match|equal|be)',
    'Test Files?\s+\d+ failed',
    'Tests?\s+\d+ failed',
    'Cannot find module',
    'Module not found',
    'SyntaxError',
    'TypeError',
    'ReferenceError',
    'TS\d{4}',
    'Build failed',
    'failed executable workflow contract'
  )

  foreach ($pattern in $regressionPatterns) {
    if ($evidence -match "(?i)$pattern") {
      return [ordered]@{
        failureClass = 'REGRESSION'
        reasonCode = 'SOURCE_OR_CONTRACT_REGRESSION'
        matchedPattern = $pattern
      }
    }
  }

  return [ordered]@{
    failureClass = 'UNCLASSIFIED'
    reasonCode = 'INSUFFICIENT_FAILURE_EVIDENCE'
    matchedPattern = $null
  }
}

function Get-GatePolicy {
  param([Parameter(Mandatory)][object]$Gate)

  if ([string]$Gate.status -ne 'SKIP') { return 'REQUIRED' }
  if (
    [string]$Gate.name -eq 'Backend verify:partner-store-application-runtime' -and
    [string]$Gate.detail -match 'Direct runtime write verifier is intentionally excluded'
  ) {
    return 'ADVISORY_SKIP'
  }
  return 'BLOCKING_SKIP'
}

function Get-AuthorityStatus {
  param([AllowEmptyCollection()][object[]]$Gates = @())

  $failed = @($Gates | Where-Object { $_.status -eq 'FAIL' })
  $blockingSkips = @($Gates | Where-Object { $_.gatePolicy -eq 'BLOCKING_SKIP' })
  if ($blockingSkips.Count -gt 0) { return 'BLOCKED' }
  if ($failed.Count -eq 0) { return 'PASS' }

  $defects = @($failed | Where-Object { $_.failureClass -in @('REGRESSION', 'UNCLASSIFIED') })
  if ($defects.Count -gt 0) { return 'FAIL' }
  return 'BLOCKED'
}

if (-not (Test-Path -LiteralPath $ReportPath -PathType Leaf)) {
  throw "ALDE report does not exist: $ReportPath"
}
if (-not (Test-Path -LiteralPath $TranscriptPath -PathType Leaf)) {
  throw "ALDE transcript does not exist: $TranscriptPath"
}

$report = Get-Content -LiteralPath $ReportPath -Raw | ConvertFrom-Json
$transcript = Get-Content -LiteralPath $TranscriptPath -Raw
$classifiedGates = @()

foreach ($gate in @($report.gates)) {
  $failureClass = $null
  $reasonCode = $null
  $matchedPattern = $null
  $gateTranscript = ''

  if ([string]$gate.status -eq 'FAIL') {
    $gateTranscript = Get-GateTranscript -Transcript $transcript -GateName ([string]$gate.name)
    $classification = Resolve-FailureClassification `
      -GateName ([string]$gate.name) `
      -Detail ([string]$gate.detail) `
      -Transcript $gateTranscript

    $failureClass = [string]$classification.failureClass
    $reasonCode = [string]$classification.reasonCode
    $matchedPattern = $classification.matchedPattern
  }

  $classifiedGates += [ordered]@{
    name = [string]$gate.name
    status = [string]$gate.status
    failureClass = $failureClass
    reasonCode = $reasonCode
    matchedPattern = $matchedPattern
    durationSeconds = $gate.durationSeconds
    detail = [string]$gate.detail
    transcriptEvidence = $gateTranscript
    gatePolicy = ''
  }
}

foreach ($gate in $classifiedGates) { $gate.gatePolicy = Get-GatePolicy -Gate $gate }

# ALDE can fail during Git Guard or repository bootstrap before normal gates exist.
# Preserve that failure as a synthetic preflight gate so the pipeline can still
# publish metadata, transcript evidence, and a deterministic authority status.
if ($classifiedGates.Count -eq 0 -and [string]$report.status -ne 'PASS') {
  $reportDetail = ''
  foreach ($propertyName in @('error', 'failure', 'message', 'summary', 'issues')) {
    $property = $report.PSObject.Properties[$propertyName]
    if ($null -ne $property -and $null -ne $property.Value -and [string]$property.Value) {
      $reportDetail = if ($property.Value -is [System.Collections.IEnumerable] -and $property.Value -isnot [string]) { @($property.Value) -join "`n" } else { [string]$property.Value }
      break
    }
  }

  $classification = Resolve-FailureClassification `
    -GateName 'ALDE preflight' `
    -Detail $reportDetail `
    -Transcript $transcript

  $classifiedGates += [ordered]@{
    name = 'ALDE preflight'
    status = 'FAIL'
    failureClass = [string]$classification.failureClass
    reasonCode = [string]$classification.reasonCode
    matchedPattern = $classification.matchedPattern
    durationSeconds = $null
    detail = $reportDetail
    transcriptEvidence = $transcript.Trim()
    gatePolicy = ''
  }
  $classifiedGates[$classifiedGates.Count - 1].gatePolicy = Get-GatePolicy -Gate $classifiedGates[$classifiedGates.Count - 1]
}

$authorityStatus = Get-AuthorityStatus -Gates $classifiedGates
$assessment = [ordered]@{
  schemaVersion = 2
  classifier = [ordered]@{
    name = 'ALDE Transcript-Aware Failure Classification Engine'
    version = '1.1.0'
    evidenceSources = @('gate.name', 'gate.detail', 'execution transcript')
    conservativeUnknownPolicy = 'UNCLASSIFIED is certification-failing until reviewed.'
    earlyFailurePolicy = 'Preflight failures without normal gates are preserved as a synthetic ALDE preflight gate.'
  }
  authorityStatus = $authorityStatus
  regressionCount = @($classifiedGates | Where-Object { $_.failureClass -eq 'REGRESSION' }).Count
  environmentBlockerCount = @($classifiedGates | Where-Object { $_.failureClass -eq 'ENVIRONMENT_BLOCKER' }).Count
  safetyGuardCount = @($classifiedGates | Where-Object { $_.failureClass -eq 'SAFETY_GUARD' }).Count
  unclassifiedCount = @($classifiedGates | Where-Object { $_.failureClass -eq 'UNCLASSIFIED' }).Count
  failedGateCount = @($classifiedGates | Where-Object { $_.status -eq 'FAIL' }).Count
  requiredPassedGateCount = @($classifiedGates | Where-Object { $_.status -eq 'PASS' -and $_.gatePolicy -eq 'REQUIRED' }).Count
  advisorySkippedGateCount = @($classifiedGates | Where-Object { $_.gatePolicy -eq 'ADVISORY_SKIP' }).Count
  blockingSkippedGateCount = @($classifiedGates | Where-Object { $_.gatePolicy -eq 'BLOCKING_SKIP' }).Count
  interpretation = if ($authorityStatus -eq 'PASS') {
    'All certification gates passed.'
  }
  elseif ($authorityStatus -eq 'BLOCKED') {
    'No source regression was identified, but certification requires repository/environment recovery or explicit safety authority.'
  }
  else {
    'A source/executable-contract regression or unclassified failure requires correction or review.'
  }
  gates = $classifiedGates
}

$report | Add-Member -NotePropertyName assessment -NotePropertyValue $assessment -Force
if (-not $OutputPath) { $OutputPath = $ReportPath }
$report | ConvertTo-Json -Depth 30 | Set-Content -LiteralPath $OutputPath -Encoding UTF8

Write-Host "[CLASSIFY] authority=$authorityStatus regressions=$($assessment.regressionCount) environment=$($assessment.environmentBlockerCount) safety=$($assessment.safetyGuardCount) unclassified=$($assessment.unclassifiedCount)" -ForegroundColor Cyan
Write-Output $OutputPath
