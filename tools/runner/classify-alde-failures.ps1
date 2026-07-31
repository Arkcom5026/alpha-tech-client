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

function Get-AuthorityStatus {
  param([Parameter(Mandatory)][object[]]$Gates)

  $failed = @($Gates | Where-Object { $_.status -eq 'FAIL' })
  if ($failed.Count -eq 0) { return 'PASS' }

  $defects = @($failed | Where-Object {
    $_.failureClass -in @('REGRESSION', 'UNCLASSIFIED')
  })
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
  }
}

$authorityStatus = Get-AuthorityStatus -Gates $classifiedGates
$assessment = [ordered]@{
  schemaVersion = 2
  classifier = [ordered]@{
    name = 'ALDE Transcript-Aware Failure Classification Engine'
    version = '1.0.0'
    evidenceSources = @('gate.name', 'gate.detail', 'execution transcript')
    conservativeUnknownPolicy = 'UNCLASSIFIED is certification-failing until reviewed.'
  }
  authorityStatus = $authorityStatus
  regressionCount = @($classifiedGates | Where-Object { $_.failureClass -eq 'REGRESSION' }).Count
  environmentBlockerCount = @($classifiedGates | Where-Object { $_.failureClass -eq 'ENVIRONMENT_BLOCKER' }).Count
  safetyGuardCount = @($classifiedGates | Where-Object { $_.failureClass -eq 'SAFETY_GUARD' }).Count
  unclassifiedCount = @($classifiedGates | Where-Object { $_.failureClass -eq 'UNCLASSIFIED' }).Count
  failedGateCount = @($classifiedGates | Where-Object { $_.status -eq 'FAIL' }).Count
  interpretation = if ($authorityStatus -eq 'PASS') {
    'All certification gates passed.'
  }
  elseif ($authorityStatus -eq 'BLOCKED') {
    'No source regression was identified, but certification requires environment recovery or explicit safety authority.'
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
