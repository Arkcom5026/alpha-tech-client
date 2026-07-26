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
$script:EngineVersion = '1.1.0-phase1'
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

function Add-CommandLedgerEntry {
  param(
    [Parameter(Mandatory)][string]$Command,
    [string[]]$Arguments = @(),
    [string]$WorkingDirectory = ''
  )

  $renderedArguments = @($Arguments | ForEach-Object { ConvertTo-DisplayArgument ([string]$_) })
  $display = (@($Command) + $renderedArguments) -join ' '

  if ($WorkingDirectory) {
    $display = "[$WorkingDirectory] $display"
  }

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

  if ($WorkingDirectory) {
    Push-Location $WorkingDirectory
  }

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

    if ($nativeExitCode -ne 0) {
      throw "$Command exited with code $nativeExitCode."
    }
  }
  finally {
    if ($WorkingDirectory) {
      Pop-Location
    }
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
  param(
    [Parameter(Mandatory)][string]$Name,
    [Parameter(Mandatory)][string]$Reason
  )

  Add-GateResult -Name $Name -Status 'SKIP' -Detail $Reason
  Write-Host "[SKIP] $Name - $Reason" -ForegroundColor DarkYellow
}

function Test-GatePassed {
  param([Parameter(Mandatory)][string]$Name)

  $result = $script:Results | Where-Object { $_.name -eq $Name } | Select-Object -Last 1
  return $null -ne $result -and $result.status -eq 'PASS'
}

function Get-FailedGateCount {
  return @($script:Results | Where-Object { $_.status -eq 'FAIL' }).Count
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

function Test-NpmScript {
  param(
    [Parameter(Mandatory)][string]$ProjectPath,
    [Parameter(Mandatory)][string]$ScriptName
  )

  $packageJsonPath = Join-Path $ProjectPath 'package.json'
  if (-not (Test-Path $packageJsonPath)) {
    return $false
  }

  $packageJson = Get-Content $packageJsonPath -Raw | ConvertFrom-Json
  return $null -ne $packageJson.scripts.PSObject.Properties[$ScriptName]
}

function Invoke-RequiredNpmScriptGate {
  param(
    [Parameter(Mandatory)][string]$GateName,
    [Parameter(Mandatory)][string]$ProjectPath,
    [Parameter(Mandatory)][string]$ScriptName
  )

  if (-not (Test-NpmScript -ProjectPath $ProjectPath -ScriptName $ScriptName)) {
    Add-GateResult -Name $GateName -Status 'FAIL' -Detail "package.json does not define '$ScriptName'."
    Write-Host "[FAIL] $GateName - package.json does not define '$ScriptName'." -ForegroundColor Red
    return $false
  }

  return Invoke-NpmScriptGate -GateName $GateName -ProjectPath $ProjectPath -ScriptName $ScriptName
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
    if (Test-Path (Join-Path $candidate 'package.json')) {
      return (Resolve-Path $candidate).Path
    }
  }

  throw "$ProjectLabel repository was not found. Pass its path explicitly."
}

function Get-GitOutput {
  param(
    [Parameter(Mandatory)][string]$RepositoryPath,
    [Parameter(Mandatory)][string[]]$Arguments
  )

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
  param(
    [Parameter(Mandatory)][object]$State,
    [Parameter(Mandatory)][string]$ExpectedBranch
  )

  if ($State.branch -ne $ExpectedBranch) {
    throw "Repository $($State.path) is on branch '$($State.branch)'; expected '$ExpectedBranch'."
  }
}

function Assert-CleanWorkingTree {
  param(
    [Parameter(Mandatory)][object]$State,
    [Parameter(Mandatory)][string]$Reason
  )

  if (-not $State.clean) {
    $details = $State.status -join [Environment]::NewLine
    throw "Repository $($State.path) must be clean $Reason.`n$details"
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

  if ($parts.Count -lt 2) {
    throw "Could not determine divergence for $RepositoryPath. Received: $countsLine"
  }

  $ahead = [int]$parts[0]
  $behind = [int]$parts[1]

  if ($ahead -gt 0 -and $behind -gt 0) {
    throw "Repository $RepositoryPath has diverged from $Remote/$Branch (ahead=$ahead, behind=$behind). Resolve it manually."
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
    if ($command) {
      return $command.Source
    }
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

  $startInfo = [System.Diagnostics.ProcessStartInfo]::new()
  $startInfo.FileName = $Executable
  $startInfo.WorkingDirectory = $WorkingDirectory
  $startInfo.UseShellExecute = $false

  foreach ($argument in $Arguments) {
    [void]$startInfo.ArgumentList.Add([string]$argument)
  }

  foreach ($key in $Environment.Keys) {
    $startInfo.Environment[$key] = [string]$Environment[$key]
  }

  $process = [System.Diagnostics.Process]::new()
  $process.StartInfo = $startInfo
  [void]$process.Start()
  $script:StartedProcesses.Add($process)
  return $process
}

function Stop-TrackedProcesses {
  foreach ($process in $script:StartedProcesses) {
    try {
      if (-not $process.HasExited) {
        Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
        $process.WaitForExit(5000) | Out-Null
      }
    }
    catch {
      Write-Warning "Could not stop process $($process.Id): $($_.Exception.Message)"
    }
  }
}

function Wait-HttpReady {
  param(
    [Parameter(Mandatory)][string]$Uri,
    [int]$TimeoutSeconds = 45
  )

  $deadline = (Get-Date).AddSeconds($TimeoutSeconds)

  do {
    try {
      Invoke-WebRequest -Uri $Uri -UseBasicParsing -TimeoutSec 3 -ErrorAction Stop | Out-Null
      return
    }
    catch {
      if ($_.Exception.Response) {
        return
      }
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
    [void](Invoke-RequiredNpmScriptGate -GateName "Frontend $scriptName" -ProjectPath $Path -ScriptName $scriptName)
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

  $serverEntry = Join-Path $Path 'server.js'
  if (Test-Path $serverEntry) {
    [void](Invoke-Gate 'Backend entry syntax check' {
      Invoke-NativeCommand -Command 'node' -Arguments @('--check', 'server.js') -WorkingDirectory $Path
    })
  }
  else {
    Add-SkippedGate -Name 'Backend entry syntax check' -Reason 'server.js was not found.'
  }

  $schemaPath = Join-Path $Path 'prisma\schema.prisma'
  if (Test-Path $schemaPath) {
    [void](Invoke-Gate 'Prisma validate' {
      Invoke-NativeCommand -Command 'npx' -Arguments @('prisma', 'validate') -WorkingDirectory $Path
    })

    [void](Invoke-Gate 'Prisma generate' {
      Invoke-NativeCommand -Command 'npx' -Arguments @('prisma', 'generate') -WorkingDirectory $Path
    })
  }
  else {
    Add-SkippedGate -Name 'Prisma validate' -Reason 'prisma/schema.prisma was not found.'
    Add-SkippedGate -Name 'Prisma generate' -Reason 'prisma/schema.prisma was not found.'
  }

  [void](Invoke-RequiredNpmScriptGate -GateName 'Backend regression tests' -ProjectPath $Path -ScriptName 'test')

  if ($RunAllBackendVerifiers) {
    $packageJson = Get-Content (Join-Path $Path 'package.json') -Raw | ConvertFrom-Json
    $verifyScripts = @(
      $packageJson.scripts.PSObject.Properties |
        Where-Object { $_.Name -like 'verify:*' } |
        Select-Object -ExpandProperty Name |
        Sort-Object
    )

    if ($verifyScripts.Count -eq 0) {
      Add-SkippedGate -Name 'Backend verify:* scripts' -Reason 'No verify:* scripts were defined.'
    }

    foreach ($verifyScript in $verifyScripts) {
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
    $backendProcess = Start-TrackedProcess -Executable $nodeExecutable -Arguments @('server.js') -WorkingDirectory $ServerRepositoryPath -Environment @{
      PORT = $BackendPort
      CORS_ALLOW_ALL = 'true'
      NODE_ENV = 'test'
    }

    Wait-HttpReady -Uri "http://127.0.0.1:$BackendPort/api/__alde_probe__"

    if ($backendProcess.HasExited) {
      throw "Backend exited during startup smoke test with code $($backendProcess.ExitCode)."
    }
  })

  if (-not $SkipFrontend) {
    [void](Invoke-Gate 'Frontend startup smoke test' {
      $frontendProcess = Start-TrackedProcess -Executable $npmExecutable -Arguments @('run', 'dev', '--', '--host', '127.0.0.1', '--port', "$FrontendPort", '--strictPort') -WorkingDirectory $ClientRepositoryPath

      Wait-HttpReady -Uri "http://127.0.0.1:$FrontendPort"

      if ($frontendProcess.HasExited) {
        throw "Frontend exited during startup smoke test with code $($frontendProcess.ExitCode)."
      }
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

  $runtimePrerequisites = @('Backend startup smoke test')
  if (-not $SkipFrontend) {
    $runtimePrerequisites += 'Frontend startup smoke test'
  }

  $failedPrerequisites = @($runtimePrerequisites | Where-Object { -not (Test-GatePassed -Name $_) })

  if ($failedPrerequisites.Count -gt 0) {
    Add-SkippedGate -Name 'Playwright browser E2E' -Reason "Runtime prerequisite did not pass: $($failedPrerequisites -join ', ')"
    return
  }

  [void](Invoke-RequiredNpmScriptGate -GateName 'Playwright browser E2E' -ProjectPath $Path -ScriptName 'test:e2e')
}

function Get-ToolVersionSafely {
  param(
    [Parameter(Mandatory)][string]$Command,
    [Parameter(Mandatory)][string[]]$Arguments
  )

  try {
    return (Invoke-NativeCommand -Command $Command -Arguments $Arguments -CaptureOutput | Select-Object -First 1)
  }
  catch {
    return "unavailable: $($_.Exception.Message)"
  }
}

function Write-VerificationReport {
  param(
    [Parameter(Mandatory)][string]$ClientRepositoryPath,
    [string]$ServerRepositoryPath,
    [Parameter(Mandatory)][ValidateSet('PASS', 'FAIL')][string]$FinalStatus,
    [string]$FailureMessage = ''
  )

  $artifactDirectory = Join-Path $ClientRepositoryPath '.artifacts\verification'
  New-Item -ItemType Directory -Force -Path $artifactDirectory | Out-Null

  $clientState = Get-RepositoryState $ClientRepositoryPath
  $serverState = $null
  if ($ServerRepositoryPath) {
    $serverState = Get-RepositoryState $ServerRepositoryPath
  }

  $report = [ordered]@{
    schemaVersion = 3
    engine = [ordered]@{
      name = $script:EngineName
      version = $script:EngineVersion
      workflow = $script:WorkflowName
      mode = $Mode
      executionPolicy = 'full-certification'
    }
    status = $FinalStatus
    failureMessage = $FailureMessage
    failedGateCount = Get-FailedGateCount
    startedAt = $script:StartedAt.ToString('o')
    finishedAt = (Get-Date).ToString('o')
    environment = [ordered]@{
      machine = $env:COMPUTERNAME
      user = $env:USERNAME
      powershell = $PSVersionTable.PSVersion.ToString()
      node = Get-ToolVersionSafely -Command 'node' -Arguments @('--version')
      npm = Get-ToolVersionSafely -Command 'npm' -Arguments @('--version')
    }
    repositories = [ordered]@{
      client = $clientState
      server = $serverState
    }
    certifiedHeads = $script:CertifiedHeads
    gates = $script:Results
    executedCommands = $script:ExecutedCommands
  }

  $timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
  $reportPath = Join-Path $artifactDirectory "alde-$timestamp.json"
  $latestPath = Join-Path $artifactDirectory 'alde-latest.json'
  $json = $report | ConvertTo-Json -Depth 12

  Set-Content -Path $reportPath -Value $json -Encoding utf8
  Set-Content -Path $latestPath -Value $json -Encoding utf8

  Write-Host "Verification report: $reportPath" -ForegroundColor Cyan
}

function Publish-CertifiedRepository {
  param(
    [Parameter(Mandatory)][string]$RepositoryPath,
    [Parameter(Mandatory)][string]$RepositoryKey,
    [Parameter(Mandatory)][string]$Remote,
    [Parameter(Mandatory)][string]$Branch
  )

  $state = Get-RepositoryState $RepositoryPath
  Assert-RepositoryBranch -State $state -ExpectedBranch $Branch
  Assert-CleanWorkingTree -State $state -Reason 'before publish'

  $certifiedHead = [string]$script:CertifiedHeads[$RepositoryKey]
  if (-not $certifiedHead -or $state.head -ne $certifiedHead) {
    throw "$RepositoryKey HEAD changed after certification. Certified=$certifiedHead Current=$($state.head)"
  }

  Invoke-NativeCommand -Command 'git' -Arguments @('-C', $RepositoryPath, 'fetch', $Remote, '--prune')

  $remoteHead = (Get-GitOutput $RepositoryPath @('rev-parse', "$Remote/$Branch") | Select-Object -First 1).Trim()
  $null = Get-GitOutput $RepositoryPath @('merge-base', '--is-ancestor', $remoteHead, $state.head)

  if ($remoteHead -ne $state.head) {
    Invoke-NativeCommand -Command 'git' -Arguments @('-C', $RepositoryPath, 'push', $Remote, "HEAD:$Branch")
  }
  else {
    Write-Host "[PUSH] $RepositoryKey already matches $Remote/$Branch" -ForegroundColor DarkGreen
  }

  Invoke-NativeCommand -Command 'git' -Arguments @('-C', $RepositoryPath, 'fetch', $Remote)
  $verifiedRemoteHead = (Get-GitOutput $RepositoryPath @('rev-parse', "$Remote/$Branch") | Select-Object -First 1).Trim()

  if ($verifiedRemoteHead -ne $state.head) {
    throw "$RepositoryKey remote verification failed. Local=$($state.head) Remote=$verifiedRemoteHead"
  }

  Write-Host "[PASS] $RepositoryKey publish verified at $verifiedRemoteHead" -ForegroundColor Green
}

$resolvedClientPath = $null
$resolvedServerPath = $null
$finalStatus = 'FAIL'
$failureMessage = ''
$processExitCode = 1
$shouldSync = $Mode -in @('Sync', 'SyncAndCertify')
$shouldCertify = $Mode -in @('Certify', 'SyncAndCertify', 'CertifyAndPublish')
$shouldPublish = $Mode -eq 'CertifyAndPublish'

try {
  Write-Section "$($script:EngineName) $($script:EngineVersion)"
  Write-Host "Workflow : $($script:WorkflowName)"
  Write-Host "Mode     : $Mode"
  Write-Host 'Policy   : Run all safe gates, collect complete evidence, then decide PASS or FAIL.'
  Write-Host 'Safety   : This engine never stages files and never creates commits.'

  $resolvedClientPath = Resolve-ProjectPath -ExplicitPath $ClientPath -Candidates @($PSScriptRoot) -ProjectLabel 'Frontend'

  if (-not $SkipBackend) {
    $resolvedServerPath = Resolve-ProjectPath -ExplicitPath $ServerPath -Candidates @(
      (Join-Path $resolvedClientPath '..\server'),
      (Join-Path $resolvedClientPath '..\alpha-tech-server'),
      'D:\alpha-tech\server'
    ) -ProjectLabel 'Backend'
  }

  $repositories = [ordered]@{ client = $resolvedClientPath }
  if ($resolvedServerPath) {
    $repositories.server = $resolvedServerPath
  }

  Write-Section 'GIT GUARD'
  foreach ($entry in $repositories.GetEnumerator()) {
    $state = Get-RepositoryState $entry.Value
    Assert-RepositoryBranch -State $state -ExpectedBranch $RequiredBranch

    if (($shouldSync -or $shouldPublish) -and -not $state.clean) {
      Assert-CleanWorkingTree -State $state -Reason "for mode $Mode"
    }

    if ($shouldCertify -and -not $AllowDirtyCertification -and -not $state.clean) {
      Assert-CleanWorkingTree -State $state -Reason 'for commit-bound certification'
    }

    Write-Host "[REPO] $($entry.Key): branch=$($state.branch) head=$($state.head) clean=$($state.clean)" -ForegroundColor Green
  }

  if ($shouldSync) {
    Write-Section 'GIT SYNCHRONIZATION'
    foreach ($entry in $repositories.GetEnumerator()) {
      Sync-Repository -RepositoryPath $entry.Value -Remote $RemoteName -Branch $RequiredBranch
    }
  }

  if ($Mode -eq 'Sync') {
    $finalStatus = 'PASS'
    $processExitCode = 0
    Write-Section 'SYNCHRONIZATION PASS'
  }

  if ($shouldCertify) {
    if (-not $SkipFrontend) {
      Invoke-FrontendGate -Path $resolvedClientPath
    }

    if (-not $SkipBackend) {
      Invoke-BackendGate -Path $resolvedServerPath
    }

    if ($IncludeRuntime) {
      if ($SkipBackend) {
        Add-SkippedGate -Name 'Backend startup smoke test' -Reason 'Runtime verification requires the backend repository.'
      }
      else {
        Invoke-RuntimeGate -ClientRepositoryPath $resolvedClientPath -ServerRepositoryPath $resolvedServerPath
      }
    }

    if ($IncludeOperationalE2E) {
      if ($SkipFrontend) {
        Add-SkippedGate -Name 'Playwright browser E2E' -Reason 'Operational E2E requires the frontend repository.'
      }
      else {
        Invoke-OperationalGate -Path $resolvedClientPath
      }
    }

    $failedGateCount = Get-FailedGateCount

    if ($failedGateCount -eq 0) {
      foreach ($entry in $repositories.GetEnumerator()) {
        $stateAfterCertification = Get-RepositoryState $entry.Value

        if (-not $AllowDirtyCertification) {
          Assert-CleanWorkingTree -State $stateAfterCertification -Reason 'after certification'
        }

        $script:CertifiedHeads[$entry.Key] = $stateAfterCertification.head
      }

      $finalStatus = 'PASS'
      $processExitCode = 0
      Write-Section 'LOCAL CERTIFICATION PASS'
    }
    else {
      $finalStatus = 'FAIL'
      $failureMessage = "$failedGateCount certification gate(s) failed."
      $processExitCode = 1
      Write-Section 'LOCAL CERTIFICATION FAIL'
    }

    $script:Results | Format-Table -AutoSize
  }

  if ($shouldPublish) {
    if ($finalStatus -ne 'PASS') {
      Write-Section 'PUBLISH BLOCKED'
      Write-Host 'One or more certification gates failed. No repository was pushed.' -ForegroundColor Red
    }
    else {
      Write-Section 'PUBLISH GUARD'
      foreach ($entry in $repositories.GetEnumerator()) {
        Publish-CertifiedRepository -RepositoryPath $entry.Value -RepositoryKey $entry.Key -Remote $RemoteName -Branch $RequiredBranch
      }
      Write-Section 'CERTIFICATION AND PUBLISH PASS'
    }
  }
}
catch {
  $failureMessage = $_.Exception.Message
  $finalStatus = 'FAIL'
  $processExitCode = 1

  Write-Host ''
  Write-Host "ALDE FAILED: $failureMessage" -ForegroundColor Red
  $script:Results | Format-Table -AutoSize
}
finally {
  Stop-TrackedProcesses

  if ($resolvedClientPath) {
    try {
      Write-VerificationReport -ClientRepositoryPath $resolvedClientPath -ServerRepositoryPath $resolvedServerPath -FinalStatus $finalStatus -FailureMessage $failureMessage
    }
    catch {
      Write-Warning "Could not write verification report: $($_.Exception.Message)"
    }
  }
}

exit $processExitCode
