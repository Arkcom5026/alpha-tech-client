param(
  [Parameter(Mandatory)][string]$ClientPath,
  [Parameter(Mandatory)][string]$ServerPath,
  [Parameter(Mandatory)][string]$RequiredBranch,
  [Parameter(Mandatory)][string]$ReportPath
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Get-RepositoryPreflight {
  param([Parameter(Mandatory)][string]$Path, [Parameter(Mandatory)][string]$Label)

  $issues = @()
  if (-not (Test-Path -LiteralPath $Path -PathType Container)) {
    return [ordered]@{ label = $Label; path = $Path; branch = $null; head = $null; clean = $false; issues = @('REPOSITORY_PATH_MISSING') }
  }

  $branch = (& git -C $Path branch --show-current 2>$null | Select-Object -First 1).Trim()
  $head = (& git -C $Path rev-parse HEAD 2>$null | Select-Object -First 1).Trim()
  $status = @(& git -C $Path status --porcelain=v1 --untracked-files=all 2>$null)
  if ($branch -ne $RequiredBranch) { $issues += 'REQUIRED_BRANCH_MISMATCH' }
  if ($status.Count -gt 0) { $issues += 'WORKING_TREE_NOT_CLEAN' }

  return [ordered]@{
    label = $Label
    path = $Path
    branch = $branch
    head = $head
    clean = ($status.Count -eq 0)
    dirtyEntries = @($status)
    issues = @($issues)
  }
}

function Get-PrismaLockSignals {
  param([Parameter(Mandatory)][string]$ServerRepositoryPath)

  $signals = @()
  try {
    $nodes = @(Get-CimInstance Win32_Process -Filter "Name = 'node.exe'" -ErrorAction Stop |
      Where-Object { $_.CommandLine -and $_.CommandLine -match [regex]::Escape($ServerRepositoryPath) })

    foreach ($node in $nodes) {
      $signals += [ordered]@{
        processId = [int]$node.ProcessId
        commandLine = [string]$node.CommandLine
        reasonCode = 'SERVER_NODE_PROCESS_ACTIVE'
      }
    }
  }
  catch {
    $signals += [ordered]@{
      processId = $null
      commandLine = $null
      reasonCode = 'PROCESS_INSPECTION_UNAVAILABLE'
      detail = $_.Exception.Message
    }
  }
  return @($signals)
}

$client = Get-RepositoryPreflight -Path $ClientPath -Label 'Client'
$server = Get-RepositoryPreflight -Path $ServerPath -Label 'Server'
$lockSignals = Get-PrismaLockSignals -ServerRepositoryPath $ServerPath
$blockingSignals = @($lockSignals | Where-Object { $_.reasonCode -eq 'SERVER_NODE_PROCESS_ACTIVE' })

$issues = @($client.issues + $server.issues)
if ($blockingSignals.Count -gt 0) { $issues += 'PRISMA_GENERATE_LOCK_RISK' }

$report = [ordered]@{
  schemaVersion = 1
  status = if ($issues.Count -eq 0) { 'PASS' } else { 'BLOCKED' }
  name = 'ALDE Reliability Preflight'
  startedAt = (Get-Date).ToUniversalTime().ToString('o')
  requiredBranch = $RequiredBranch
  repositories = [ordered]@{ client = $client; server = $server }
  prismaGenerateLockSignals = @($lockSignals)
  issues = @($issues | Select-Object -Unique)
  remediation = @(
    'Keep both repositories on the required branch with clean working trees.',
    'Do not write verification logs into either repository working tree.',
    'Stop only the identified Alpha-Tech server node process before rerunning if Prisma generate lock risk is reported.'
  )
}

$report | ConvertTo-Json -Depth 10 | Set-Content -LiteralPath $ReportPath -Encoding UTF8
Write-Host "[PREFLIGHT] status=$($report.status) issues=$(@($report.issues).Count)" -ForegroundColor Cyan
if ($report.status -ne 'PASS') { exit 2 }
