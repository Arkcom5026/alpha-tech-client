param(
  [string]$ClientPath = $PSScriptRoot,
  [string]$ServerPath = "",
  [switch]$Install,
  [switch]$SkipFrontend,
  [switch]$SkipBackend,
  [switch]$IncludeRuntime,
  [switch]$IncludeOperationalE2E,
  [switch]$RunAllBackendVerifiers,
  [int]$BackendPort = 3000,
  [int]$FrontendPort = 5173
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$script:Results = New-Object System.Collections.Generic.List[object]
$script:StartedProcesses = New-Object System.Collections.Generic.List[System.Diagnostics.Process]
$script:StartedAt = Get-Date

function Write-Section {
  param([string]$Title)
  Write-Host ""
  Write-Host ('=' * 72) -ForegroundColor DarkGray
  Write-Host " $Title" -ForegroundColor Cyan
  Write-Host ('=' * 72) -ForegroundColor DarkGray
}

function Add-Result {
  param(
    [string]$Name,
    [string]$Status,
    [double]$DurationSeconds,
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
    [string]$Name,
    [string]$WorkingDirectory,
    [scriptblock]$Action
  )

  Write-Host "[RUN ] $Name" -ForegroundColor Yellow
  $watch = [System.Diagnostics.Stopwatch]::StartNew()
  Push-Location $WorkingDirectory

  try {
    & $Action
    if ($LASTEXITCODE -and $LASTEXITCODE -ne 0) {
      throw "$Name exited with code $LASTEXITCODE"
    }

    $watch.Stop()
    Add-Result -Name $Name -Status 'PASS' -DurationSeconds $watch.Elapsed.TotalSeconds
    Write-Host "[PASS] $Name" -ForegroundColor Green
  }
  catch {
    $watch.Stop()
    Add-Result -Name $Name -Status 'FAIL' -DurationSeconds $watch.Elapsed.TotalSeconds -Detail $_.Exception.Message
    Write-Host "[FAIL] $Name" -ForegroundColor Red
    throw
  }
  finally {
    Pop-Location
  }
}

function Test-NpmScript {
  param(
    [string]$ProjectPath,
    [string]$ScriptName
  )

  $packageJsonPath = Join-Path $ProjectPath 'package.json'
  if (-not (Test-Path $packageJsonPath)) {
    return $false
  }

  $packageJson = Get-Content $packageJsonPath -Raw | ConvertFrom-Json
  return $null -ne $packageJson.scripts.PSObject.Properties[$ScriptName]
}

function Resolve-ServerPath {
  param([string]$ExplicitPath)

  if ($ExplicitPath) {
    return (Resolve-Path $ExplicitPath).Path
  }

  $candidates = @(
    (Join-Path $PSScriptRoot '..\server'),
    (Join-Path $PSScriptRoot '..\alpha-tech-server')
  )

  foreach ($candidate in $candidates) {
    if (Test-Path (Join-Path $candidate 'package.json')) {
      return (Resolve-Path $candidate).Path
    }
  }

  throw 'Backend repository was not found. Pass -ServerPath explicitly.'
}

function Wait-HttpReady {
  param(
    [string]$Uri,
    [int]$TimeoutSeconds = 30
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

function Start-TrackedProcess {
  param(
    [string]$FilePath,
    [string[]]$ArgumentList,
    [string]$WorkingDirectory,
    [hashtable]$Environment = @{}
  )

  $startInfo = New-Object System.Diagnostics.ProcessStartInfo
  $startInfo.FileName = $FilePath
  $startInfo.WorkingDirectory = $WorkingDirectory
  $startInfo.UseShellExecute = $false
  $startInfo.RedirectStandardOutput = $true
  $startInfo.RedirectStandardError = $true

  foreach ($argument in $ArgumentList) {
    [void]$startInfo.ArgumentList.Add($argument)
  }

  foreach ($key in $Environment.Keys) {
    $startInfo.Environment[$key] = [string]$Environment[$key]
  }

  $process = New-Object System.Diagnostics.Process
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
      }
    }
    catch {
      Write-Warning "Could not stop process $($process.Id): $($_.Exception.Message)"
    }
  }
}

function Write-VerificationReport {
  param(
    [string]$RepositoryPath,
    [string]$FinalStatus
  )

  $artifactDirectory = Join-Path $RepositoryPath '.artifacts\verification'
  New-Item -ItemType Directory -Force -Path $artifactDirectory | Out-Null

  $branch = (& git -C $RepositoryPath branch --show-current 2>$null)
  $commit = (& git -C $RepositoryPath rev-parse HEAD 2>$null)
  $dirty = (& git -C $RepositoryPath status --porcelain 2>$null)

  $report = [ordered]@{
    schemaVersion = 1
    workflow = 'E2E Increment-Based Local Certification'
    status = $FinalStatus
    startedAt = $script:StartedAt.ToString('o')
    finishedAt = (Get-Date).ToString('o')
    branch = ($branch | Select-Object -First 1)
    commit = ($commit | Select-Object -First 1)
    workingTreeClean = -not [bool]$dirty
    nodeVersion = (& node --version 2>$null)
    npmVersion = (& npm --version 2>$null)
    gates = $script:Results
  }

  $timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
  $reportPath = Join-Path $artifactDirectory "local-build-$timestamp.json"
  $latestPath = Join-Path $artifactDirectory 'local-build-latest.json'

  $json = $report | ConvertTo-Json -Depth 8
  Set-Content -Path $reportPath -Value $json -Encoding utf8
  Set-Content -Path $latestPath -Value $json -Encoding utf8

  Write-Host "Verification report: $reportPath" -ForegroundColor Cyan
}

$resolvedClientPath = (Resolve-Path $ClientPath).Path
$resolvedServerPath = $null
$finalStatus = 'FAIL'

try {
  Write-Section 'ALPHA-TECH LOCAL E2E CERTIFICATION'
  Write-Host 'Full verification is intended to run after an E2E increment is complete.'
  Write-Host 'This script never commits or pushes automatically.'

  if (-not $SkipBackend) {
    $resolvedServerPath = Resolve-ServerPath -ExplicitPath $ServerPath
  }

  if ($Install) {
    if (-not $SkipFrontend) {
      Invoke-Gate 'Frontend dependency install' $resolvedClientPath { npm ci }
    }
    if (-not $SkipBackend) {
      Invoke-Gate 'Backend dependency install' $resolvedServerPath { npm ci }
    }
  }

  if (-not $SkipFrontend) {
    Write-Section 'FRONTEND REPOSITORY GATE'
    Invoke-Gate 'Frontend typecheck' $resolvedClientPath { npm run typecheck }
    Invoke-Gate 'Frontend lint' $resolvedClientPath { npm run lint }
    Invoke-Gate 'Frontend build' $resolvedClientPath { npm run build }
    Invoke-Gate 'Frontend regression tests' $resolvedClientPath { npm run test:run }
  }

  if (-not $SkipBackend) {
    Write-Section 'BACKEND REPOSITORY GATE'

    $schemaPath = Join-Path $resolvedServerPath 'prisma\schema.prisma'
    if (Test-Path $schemaPath) {
      Invoke-Gate 'Prisma validate' $resolvedServerPath { npx prisma validate }
      Invoke-Gate 'Prisma generate' $resolvedServerPath { npx prisma generate }
    }

    Invoke-Gate 'Backend regression tests' $resolvedServerPath { npm test }

    if ($RunAllBackendVerifiers) {
      $packageJson = Get-Content (Join-Path $resolvedServerPath 'package.json') -Raw | ConvertFrom-Json
      $verifyScripts = $packageJson.scripts.PSObject.Properties |
        Where-Object { $_.Name -like 'verify:*' } |
        Select-Object -ExpandProperty Name

      foreach ($verifyScript in $verifyScripts) {
        Invoke-Gate "Backend $verifyScript" $resolvedServerPath { npm run $verifyScript }.GetNewClosure()
      }
    }
  }

  if ($IncludeRuntime) {
    Write-Section 'RUNTIME GATE'

    if ($SkipBackend) {
      throw 'Runtime verification requires the backend gate. Remove -SkipBackend.'
    }

    Invoke-Gate 'Backend startup smoke test' $resolvedServerPath {
      $backendProcess = Start-TrackedProcess `
        -FilePath 'node' `
        -ArgumentList @('server.js') `
        -WorkingDirectory $resolvedServerPath `
        -Environment @{ PORT = $BackendPort; CORS_ALLOW_ALL = 'true' }

      Wait-HttpReady -Uri "http://localhost:$BackendPort/api/__local_build_probe__" -TimeoutSeconds 45

      if ($backendProcess.HasExited) {
        $stderr = $backendProcess.StandardError.ReadToEnd()
        throw "Backend exited during startup smoke test. $stderr"
      }
    }

    if (-not $SkipFrontend) {
      Invoke-Gate 'Frontend startup smoke test' $resolvedClientPath {
        $frontendProcess = Start-TrackedProcess `
          -FilePath 'npm' `
          -ArgumentList @('run', 'dev', '--', '--host', '127.0.0.1', '--port', "$FrontendPort") `
          -WorkingDirectory $resolvedClientPath

        Wait-HttpReady -Uri "http://localhost:$FrontendPort" -TimeoutSeconds 45

        if ($frontendProcess.HasExited) {
          $stderr = $frontendProcess.StandardError.ReadToEnd()
          throw "Frontend exited during startup smoke test. $stderr"
        }
      }
    }
  }

  if ($IncludeOperationalE2E) {
    Write-Section 'OPERATIONAL E2E GATE'

    if (-not (Test-NpmScript -ProjectPath $resolvedClientPath -ScriptName 'test:e2e')) {
      throw 'Frontend package.json does not define test:e2e.'
    }

    Invoke-Gate 'Playwright operational E2E' $resolvedClientPath { npm run test:e2e }
  }

  $finalStatus = 'PASS'
  Write-Section 'LOCAL CERTIFICATION PASS'
  $script:Results | Format-Table -AutoSize
  Write-VerificationReport -RepositoryPath $resolvedClientPath -FinalStatus $finalStatus
  exit 0
}
catch {
  Write-Host ""
  Write-Host "LOCAL CERTIFICATION FAILED: $($_.Exception.Message)" -ForegroundColor Red
  $script:Results | Format-Table -AutoSize
  Write-VerificationReport -RepositoryPath $resolvedClientPath -FinalStatus $finalStatus
  exit 1
}
finally {
  Stop-TrackedProcesses
}
