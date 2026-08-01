param(
  [ValidateSet('Sync', 'Certify', 'SyncAndCertify', 'CertifyAndPublish')]
  [string]$Mode = 'Certify',
  [string]$ClientPath = $PSScriptRoot,
  [string]$ServerPath = '',
  [string]$RemoteName = 'origin',
  [string]$RequiredBranch = 'main',
  [switch]$Install,
  [switch]$SkipFrontend,
  [switch]$SkipBackend,
  [switch]$RunAllBackendVerifiers,
  [switch]$IncludeRuntime,
  [switch]$IncludeOperationalE2E,
  [switch]$AllowDirtyCertification,
  [int]$BackendPort = 3000,
  [int]$FrontendPort = 5173
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$script:EngineName = 'Alpha-Tech Local Development Engine'
$script:EngineVersion = '1.1.1-phase1'
$script:WorkflowName = 'Git-first E2E Increment Full Certification'
$script:StartedAt = Get-Date
$script:Results = [System.Collections.Generic.List[object]]::new()
$script:ExecutedCommands = [System.Collections.Generic.List[string]]::new()
$script:StartedProcesses = [System.Collections.Generic.List[System.Diagnostics.Process]]::new()
$script:CertifiedHeads = @{}

function Write-Section {
  param([Parameter(Mandatory)][string]$Title)
  Write-Host ''
  Write-Host ('=' * 78) -ForegroundColor DarkGray
  Write-Host " $Title" -ForegroundColor Cyan
  Write-Host ('=' * 78) -ForegroundColor DarkGray
}

function ConvertTo-DisplayArgument {
  param([AllowEmptyString()][string]$Value)
  if ($Value -match '[\s"'']') {
    return '"' + ($Value -replace '"', '\"') + '"'
  }
  return $Value
}

function ConvertTo-ProcessArgument {
  param([AllowEmptyString()][string]$Value)
  if ($Value.Length -eq 0) { return '""' }
  if ($Value -notmatch '[\s"]') { return $Value }
  $escaped = $Value -replace '(\\*)"', '$1$1\"'
  $escaped = $escaped -replace '(\\+)$', '$1$1'
  return '"' + $escaped + '"'
}

function Add-CommandLedgerEntry {
  param(
    [Parameter(Mandatory)][string]$Command,
    [string[]]$Arguments = @(),
    [string]$WorkingDirectory = ''
  )
  $renderedArguments = @($Arguments | ForEach-Object { ConvertTo-DisplayArgument ([string]$_) })
  $display = (@($Command) + $renderedArguments) -join ' '
  if ($WorkingDirectory) { $display = "[$WorkingDirectory] $display" }
  $script:ExecutedCommands.Add($display)
  Write-Host "[CMD ] $display" -ForegroundColor DarkCyan
}

function Invoke-NativeCommand {
  param(
    [Parameter(Mandatory)][string]$Command,
    [string[]]$Arguments = @(),
    [string]$WorkingDirectory = '',
    [switch]$CaptureOutput
  )
  Add-CommandLedgerEntry -Command $Command -Arguments $Arguments -WorkingDirectory $WorkingDirectory
  if ($WorkingDirectory) { Push-Location $WorkingDirectory }
  try {
    if ($CaptureOutput) {
      $output = & $Command @Arguments 2>&1
      $nativeExitCode = $LASTEXITCODE
      if ($nativeExitCode -ne 0) {
        throw "$Command exited with code $nativeExitCode.`n$($output -join [Environment]::NewLine)"
      }
      return @($output)
    }
    & $Command @Arguments
    $nativeExitCode = $LASTEXITCODE
    if ($nativeExitCode -ne 0) { throw "$Command exited with code $nativeExitCode." }
  }
  finally {
    if ($WorkingDirectory) { Pop-Location }
  }
}

function Add-GateResult {
  param(
    [Parameter(Mandatory)][string]$Name,
    [Parameter(Mandatory)][ValidateSet('PASS', 'FAIL', 'SKIP')][string]$Status,
    [double]$DurationSeconds = 0,
    [string]$Detail = ''
  )
  $script:Results.Add([pscustomobject]@{
    name = $Name
    status = $Status
    durationSeconds = [math]::Round($DurationSeconds, 2)
    detail = $Detail
  })
}

function Invoke-Gate {
  param(
    [Parameter(Mandatory)][string]$Name,
    [Parameter(Mandatory)][scriptblock]$Action
  )
  Write-Host "[RUN ] $Name" -ForegroundColor Yellow
  $watch = [System.Diagnostics.Stopwatch]::StartNew()
  try {
    & $Action
    $watch.Stop()
    Add-GateResult -Name $Name -Status 'PASS' -DurationSeconds $watch.Elapsed.TotalSeconds
    Write-Host "[PASS] $Name" -ForegroundColor Green
    return $true
  }
  catch {
    $watch.Stop()
    Add-GateResult -Name $Name -Status 'FAIL' -DurationSeconds $watch.Elapsed.TotalSeconds -Detail $_.Exception.Message
    Write-Host "[FAIL] $Name - $($_.Exception.Message)" -ForegroundColor Red
    return $false
  }
}

function Add-SkippedGate {
  param([Parameter(Mandatory)][string]$Name, [Parameter(Mandatory)][string]$Reason)
  Add-GateResult -Name $Name -Status 'SKIP' -Detail $Reason
  Write-Host "[SKIP] $Name - $Reason" -ForegroundColor DarkYellow
}

function Get-FailedGateCount {
  return @($script:Results | Where-Object { $_.status -eq 'FAIL' }).Count
}

function Test-NpmScript {
  param([Parameter(Mandatory)][string]$ProjectPath, [Parameter(Mandatory)][string]$ScriptName)
  $packageJsonPath = Join-Path $ProjectPath 'package.json'
  if (-not (Test-Path $packageJsonPath)) { return $false }
  $packageJson = Get-Content $packageJsonPath -Raw | ConvertFrom-Json
  return $null -ne $packageJson.scripts.PSObject.Properties[$ScriptName]
}

function Invoke-NpmScriptGate {
  param(
    [Parameter(Mandatory)][string]$GateName,
    [Parameter(Mandatory)][string]$ProjectPath,
    [Parameter(Mandatory)][string]$ScriptName
  )
  return Invoke-Gate -Name $GateName -Action {
    Invoke-NativeCommand -Command 'npm' -Arguments @('run', $ScriptName) -WorkingDirectory $ProjectPath
  }
}

function Resolve-ProjectPath {
  param(
    [string]$ExplicitPath,
    [Parameter(Mandatory)][string[]]$Candidates,
    [Parameter(Mandatory)][string]$ProjectLabel
  )
  if ($ExplicitPath) {
    $resolved = (Resolve-Path $ExplicitPath).Path
    if (-not (Test-Path (Join-Path $resolved 'package.json'))) {
      throw "$ProjectLabel path does not contain package.json: $resolved"
    }
    return $resolved
  }
  foreach ($candidate in $Candidates) {
    if (Test-Path (Join-Path $candidate 'package.json')) { return (Resolve-Path $candidate).Path }
  }
  throw "$ProjectLabel repository was not found. Pass its path explicitly."
}

function Get-GitOutput {
  param([Parameter(Mandatory)][string]$RepositoryPath, [Parameter(Mandatory)][string[]]$Arguments)
  $output = Invoke-NativeCommand -Command 'git' -Arguments (@('-C', $RepositoryPath) + $Arguments) -CaptureOutput
  return @($output | ForEach-Object { [string]$_ })
}

function Get-RepositoryState {
  param([Parameter(Mandatory)][string]$RepositoryPath)
  $branch = (Get-GitOutput $RepositoryPath @('branch', '--show-current') | Select-Object -First 1).Trim()
  $head = (Get-GitOutput $RepositoryPath @('rev-parse', 'HEAD') | Select-Object -First 1).Trim()
  $statusLines = @(Get-GitOutput $RepositoryPath @('status', '--porcelain=v1', '--untracked-files=all'))
  return [pscustomobject]@{
    path = $RepositoryPath
    branch = $branch
    head = $head
    clean = $statusLines.Count -eq 0
    status = $statusLines
  }
}

function Assert-RepositoryBranch {
  param([Parameter(Mandatory)][object]$State, [Parameter(Mandatory)][string]$ExpectedBranch)
  if ($State.branch -ne $ExpectedBranch) {
    throw "Repository $($State.path) is on branch '$($State.branch)'; expected '$ExpectedBranch'."
  }
}

function Assert-CleanWorkingTree {
  param([Parameter(Mandatory)][object]$State, [Parameter(Mandatory)][string]$Reason)
  if (-not $State.clean) {
    throw "Repository $($State.path) must be clean $Reason.`n$($State.status -join [Environment]::NewLine)"
  }
}

function Sync-Repository {
  param(
    [Parameter(Mandatory)][string]$RepositoryPath,
    [Parameter(Mandatory)][string]$Remote,
    [Parameter(Mandatory)][string]$Branch
  )
  $state = Get-RepositoryState $RepositoryPath
  Assert-RepositoryBranch -State $state -ExpectedBranch $Branch
  Assert-CleanWorkingTree -State $state -Reason 'before synchronization'
  Invoke-NativeCommand -Command 'git' -Arguments @('-C', $RepositoryPath, 'fetch', $Remote, '--prune')
  $countsLine = (Get-GitOutput $RepositoryPath @('rev-list', '--left-right', '--count', "HEAD...$Remote/$Branch") | Select-Object -First 1).Trim()
  $parts = $countsLine -split '\s+'
  $ahead = [int]$parts[0]
  $behind = [int]$parts[1]
  if ($ahead -gt 0 -and $behind -gt 0) {
    throw "Repository $RepositoryPath has diverged from $Remote/$Branch (ahead=$ahead, behind=$behind)."
  }
  if ($behind -gt 0) {
    Invoke-NativeCommand -Command 'git' -Arguments @('-C', $RepositoryPath, 'pull', '--ff-only', $Remote, $Branch)
  }
  Write-Host "[SYNC] $RepositoryPath (ahead=$ahead, behind=$behind)" -ForegroundColor Green
}

function Resolve-Executable {
  param([Parameter(Mandatory)][string[]]$Names)
  foreach ($name in $Names) {
    $command = Get-Command $name -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($command) { return $command.Source }
  }
  throw "Executable not found. Tried: $($Names -join ', ')"
}

function Start-TrackedProcess {
  param(
    [Parameter(Mandatory)][string]$Executable,
    [string[]]$Arguments = @(),
    [Parameter(Mandatory)][string]$WorkingDirectory,
    [hashtable]$Environment = @{}
  )
  Add-CommandLedgerEntry -Command $Executable -Arguments $Arguments -WorkingDirectory $WorkingDirectory
  $startInfo = New-Object System.Diagnostics.ProcessStartInfo
  $startInfo.FileName = $Executable
  $startInfo.WorkingDirectory = $WorkingDirectory
  $startInfo.UseShellExecute = $false
  $startInfo.CreateNoWindow = $true
  $startInfo.Arguments = (@($Arguments | ForEach-Object { ConvertTo-ProcessArgument ([string]$_) }) -join ' ')
  foreach ($key in $Environment.Keys) {
    $startInfo.EnvironmentVariables[[string]$key] = [string]$Environment[$key]
  }
  $process = New-Object System.Diagnostics.Process
  $process.StartInfo = $startInfo
  if (-not $process.Start()) { throw "Failed to start process: $Executable" }
  $script:StartedProcesses.Add($process)
  return $process
}

function Stop-TrackedProcesses {
  foreach ($process in $script:StartedProcesses) {
    try {
      if (-not $process.HasExited) {
        Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
        [void]$process.WaitForExit(5000)
      }
    }
    catch { Write-Warning "Could not stop process $($process.Id): $($_.Exception.Message)" }
  }
}

function Wait-HttpReady {
  param([Parameter(Mandatory)][string]$Uri, [int]$TimeoutSeconds = 45)
  $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
  do {
    try {
      Invoke-WebRequest -Uri $Uri -UseBasicParsing -TimeoutSec 3 -ErrorAction Stop | Out-Null
      return
    }
    catch {
      if ($_.Exception.Response) { return }
      Start-Sleep -Milliseconds 750
    }
  } while ((Get-Date) -lt $deadline)
  throw "Runtime did not respond at $Uri within $TimeoutSeconds seconds."
}

function Invoke-FrontendGate {
  param([Parameter(Mandatory)][string]$Path)
  Write-Section 'FRONTEND REPOSITORY GATE'
  if ($Install) {
    [void](Invoke-Gate 'Frontend dependency install' {
      Invoke-NativeCommand -Command 'npm' -Arguments @('ci') -WorkingDirectory $Path
    })
  }
  foreach ($scriptName in @('typecheck', 'lint', 'build', 'test:run')) {
    if (-not (Test-NpmScript $Path $scriptName)) {
      Add-SkippedGate -Name "Frontend $scriptName" -Reason "package.json does not define '$scriptName'."
      continue
    }
    [void](Invoke-NpmScriptGate -GateName "Frontend $scriptName" -ProjectPath $Path -ScriptName $scriptName)
  }
}

function Invoke-BackendGate {
  param([Parameter(Mandatory)][string]$Path)
  Write-Section 'BACKEND REPOSITORY GATE'
  if ($Install) {
    [void](Invoke-Gate 'Backend dependency install' {
      Invoke-NativeCommand -Command 'npm' -Arguments @('ci') -WorkingDirectory $Path
    })
  }
  if (Test-Path (Join-Path $Path 'server.js')) {
    [void](Invoke-Gate 'Backend entry syntax check' {
      Invoke-NativeCommand -Command 'node' -Arguments @('--check', 'server.js') -WorkingDirectory $Path
    })
  }
  if (Test-Path (Join-Path $Path 'prisma\schema.prisma')) {
    [void](Invoke-Gate 'Prisma validate' {
      Invoke-NativeCommand -Command 'npx' -Arguments @('prisma', 'validate') -WorkingDirectory $Path
    })
    [void](Invoke-Gate 'Prisma generate' {
      Invoke-NativeCommand -Command 'npx' -Arguments @('prisma', 'generate') -WorkingDirectory $Path
    })
  }
  if (Test-NpmScript $Path 'test') {
    [void](Invoke-NpmScriptGate -GateName 'Backend regression tests' -ProjectPath $Path -ScriptName 'test')
  }
  else {
    Add-SkippedGate -Name 'Backend regression tests' -Reason "package.json does not define 'test'."
  }
  if ($RunAllBackendVerifiers) {
    $packageJson = Get-Content (Join-Path $Path 'package.json') -Raw | ConvertFrom-Json
    $verifyScripts = @($packageJson.scripts.PSObject.Properties | Where-Object { $_.Name -like 'verify:*' } | Select-Object -ExpandProperty Name | Sort-Object)
    $unsafeDirectVerifierScripts = @(
      'verify:partner-store-application-runtime'
    )
    foreach ($verifyScript in $verifyScripts) {
      if ($unsafeDirectVerifierScripts -contains $verifyScript) {
        Add-SkippedGate -Name "Backend $verifyScript" -Reason 'Direct runtime write verifier is intentionally excluded; use the dedicated :test wrapper with Test DB authority.'
        continue
      }
      [void](Invoke-NpmScriptGate -GateName "Backend $verifyScript" -ProjectPath $Path -ScriptName $verifyScript)
    }
  }
}

function Invoke-RuntimeGate {
  param(
    [Parameter(Mandatory)][string]$ClientRepositoryPath,
    [Parameter(Mandatory)][string]$ServerRepositoryPath
  )
  Write-Section 'RUNTIME GATE'
  $nodeExecutable = Resolve-Executable @('node.exe', 'node')
  $npmExecutable = Resolve-Executable @('npm.cmd', 'npm.exe', 'npm')
  [void](Invoke-Gate 'Backend startup smoke test' {
    $backendProcess = Start-TrackedProcess -Executable $nodeExecutable -Arguments @('server.js') -WorkingDirectory $ServerRepositoryPath -Environment @{ PORT = $BackendPort; CORS_ALLOW_ALL = 'true'; NODE_ENV = 'test' }
    Wait-HttpReady -Uri "http://127.0.0.1:$BackendPort/api/__alde_probe__"
    if ($backendProcess.HasExited) { throw "Backend exited with code $($backendProcess.ExitCode)." }
  })
  if (-not $SkipFrontend) {
    [void](Invoke-Gate 'Frontend startup smoke test' {
      $frontendProcess = Start-TrackedProcess -Executable $npmExecutable -Arguments @('run', 'dev', '--', '--host', '127.0.0.1', '--port', "$FrontendPort", '--strictPort') -WorkingDirectory $ClientRepositoryPath
      Wait-HttpReady -Uri "http://127.0.0.1:$FrontendPort"
      if ($frontendProcess.HasExited) { throw "Frontend exited with code $($frontendProcess.ExitCode)." }
    })
  }
}

function Invoke-OperationalGate {
  param([Parameter(Mandatory)][string]$Path)
  Write-Section 'OPERATIONAL E2E GATE'
  if (-not $IncludeRuntime) {
    Add-SkippedGate -Name 'Playwright browser E2E' -Reason 'Operational E2E requires -IncludeRuntime.'
    return
  }
  if (-not (Test-NpmScript $Path 'test:e2e')) {
    Add-SkippedGate -Name 'Playwright browser E2E' -Reason "package.json does not define 'test:e2e'."
    return
  }
  [void](Invoke-NpmScriptGate -GateName 'Playwright browser E2E' -ProjectPath $Path -ScriptName 'test:e2e')
}

function Get-ToolVersionSafely {
  param([string]$Command, [string[]]$Arguments)
  try { return ((Invoke-NativeCommand -Command $Command -Arguments $Arguments -CaptureOutput) | Select-Object -First 1) }
  catch { return "unknown ($($_.Exception.Message))" }
}

function Write-VerificationReport {
  param(
    [Parameter(Mandatory)][string]$Status,
    [Parameter(Mandatory)][object]$ClientState,
    [Parameter(Mandatory)][object]$ServerState,
    [string]$FailureMessage = ''
  )
  $artifactDirectory = Join-Path $ClientState.path '.artifacts\verification'
  New-Item -ItemType Directory -Force -Path $artifactDirectory | Out-Null
  $report = [ordered]@{
    schemaVersion = 3
    engine = [ordered]@{
      name = $script:EngineName
      version = $script:EngineVersion
      workflow = $script:WorkflowName
      mode = $Mode
      executionPolicy = 'full-certification'
      runtimeCompatibility = 'Windows PowerShell 5.1+'
    }
    status = $Status
    failureMessage = $FailureMessage
    failedGateCount = Get-FailedGateCount
    startedAt = $script:StartedAt.ToString('o')
    finishedAt = (Get-Date).ToString('o')
    environment = [ordered]@{
      machine = $env:COMPUTERNAME
      user = $env:USERNAME
      powershell = $PSVersionTable.PSVersion.ToString()
      node = Get-ToolVersionSafely 'node' @('--version')
      npm = Get-ToolVersionSafely 'npm' @('--version')
    }
    repositories = [ordered]@{
      client = $ClientState
      server = $ServerState
    }
    certifiedHeads = $script:CertifiedHeads
    gates = @($script:Results)
    executedCommands = @($script:ExecutedCommands)
  }
  $reportPath = Join-Path $artifactDirectory ("alde-{0}.json" -f (Get-Date -Format 'yyyyMMdd-HHmmss'))
  $report | ConvertTo-Json -Depth 20 | Set-Content -Path $reportPath -Encoding UTF8
  Write-Host "Verification report: $reportPath" -ForegroundColor Cyan
  return $reportPath
}

$clientRepositoryPath = $null
$serverRepositoryPath = $null
$clientState = $null
$serverState = $null
$failureMessage = ''

try {
  $clientRepositoryPath = Resolve-ProjectPath -ExplicitPath $ClientPath -Candidates @($PSScriptRoot) -ProjectLabel 'Client'
  $serverRepositoryPath = Resolve-ProjectPath -ExplicitPath $ServerPath -Candidates @((Join-Path $PSScriptRoot '..\server'), 'D:\alpha-tech\server') -ProjectLabel 'Server'

  Write-Section "$script:EngineName $script:EngineVersion"
  Write-Host "Workflow : $script:WorkflowName"
  Write-Host "Mode     : $Mode"
  Write-Host 'Policy   : Run all safe gates, collect complete evidence, then decide PASS or FAIL.'
  Write-Host 'Safety   : This engine never stages files and never creates commits.'

  Write-Section 'GIT GUARD'
  $clientState = Get-RepositoryState $clientRepositoryPath
  $serverState = Get-RepositoryState $serverRepositoryPath
  Assert-RepositoryBranch -State $clientState -ExpectedBranch $RequiredBranch
  Assert-RepositoryBranch -State $serverState -ExpectedBranch $RequiredBranch
  if (-not $AllowDirtyCertification) {
    Assert-CleanWorkingTree -State $clientState -Reason "for mode $Mode"
    Assert-CleanWorkingTree -State $serverState -Reason "for mode $Mode"
  }

  if ($Mode -in @('Sync', 'SyncAndCertify')) {
    Write-Section 'GIT SYNCHRONIZATION'
    Sync-Repository -RepositoryPath $clientRepositoryPath -Remote $RemoteName -Branch $RequiredBranch
    Sync-Repository -RepositoryPath $serverRepositoryPath -Remote $RemoteName -Branch $RequiredBranch
  }

  if ($Mode -in @('Certify', 'SyncAndCertify', 'CertifyAndPublish')) {
    if (-not $SkipFrontend) { Invoke-FrontendGate -Path $clientRepositoryPath }
    if (-not $SkipBackend) { Invoke-BackendGate -Path $serverRepositoryPath }
    if ($IncludeRuntime) { Invoke-RuntimeGate -ClientRepositoryPath $clientRepositoryPath -ServerRepositoryPath $serverRepositoryPath }
    if ($IncludeOperationalE2E) { Invoke-OperationalGate -Path $clientRepositoryPath }

    Stop-TrackedProcesses

    Write-Section 'POST-CERTIFICATION GIT GUARD'
    $clientState = Get-RepositoryState $clientRepositoryPath
    $serverState = Get-RepositoryState $serverRepositoryPath
    Assert-RepositoryBranch -State $clientState -ExpectedBranch $RequiredBranch
    Assert-RepositoryBranch -State $serverState -ExpectedBranch $RequiredBranch
    if (-not $AllowDirtyCertification) {
      Assert-CleanWorkingTree -State $clientState -Reason 'after certification'
      Assert-CleanWorkingTree -State $serverState -Reason 'after certification'
    }

    if ((Get-FailedGateCount) -gt 0) {
      throw "$(Get-FailedGateCount) certification gate(s) failed."
    }

    $script:CertifiedHeads = @{
      client = $clientState.head
      server = $serverState.head
    }
  }

  $reportPath = Write-VerificationReport -Status 'PASS' -ClientState $clientState -ServerState $serverState
  Write-Host ''
  Write-Host 'ALDE CERTIFICATION: PASS' -ForegroundColor Green
  Write-Host "Certified client SHA: $($script:CertifiedHeads.client)"
  Write-Host "Certified server SHA: $($script:CertifiedHeads.server)"
  Write-Host "Report: $reportPath"
  exit 0
}
catch {
  $failureMessage = $_.Exception.Message
  Stop-TrackedProcesses
  if (-not $clientState -and $clientRepositoryPath) { $clientState = Get-RepositoryState $clientRepositoryPath }
  if (-not $serverState -and $serverRepositoryPath) { $serverState = Get-RepositoryState $serverRepositoryPath }
  if ($clientState -and $serverState) {
    [void](Write-VerificationReport -Status 'FAIL' -ClientState $clientState -ServerState $serverState -FailureMessage $failureMessage)
  }
  Write-Host ''
  Write-Host "ALDE FAILED: $failureMessage" -ForegroundColor Red
  exit 1
}
