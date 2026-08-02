$ErrorActionPreference = 'Stop'

$ClientRoot = Resolve-Path (Join-Path $PSScriptRoot '..\..\..\..\..')
$TestApiBaseUrl = if ($env:E2E_TEST_API_BASE_URL) {
  $env:E2E_TEST_API_BASE_URL.TrimEnd('/')
} else {
  'http://localhost:3000'
}
$WebPort = if ($env:E2E_REPAIR_WEB_PORT) {
  [int]$env:E2E_REPAIR_WEB_PORT
} else {
  5174
}
$WebHost = 'localhost'
$WebBaseUrl = "http://$WebHost`:$WebPort"
$ViteOut = Join-Path $env:TEMP 'alphatech-repair-e2e-vite.out.log'
$ViteErr = Join-Path $env:TEMP 'alphatech-repair-e2e-vite.err.log'
$ViteProcess = $null

$RequiredEnvironmentNames = @(
  'E2E_TEST_USERNAME',
  'E2E_TEST_PASSWORD',
  'REPAIR_INTAKE_E2E_BRANCH_SLUG',
  'REPAIR_INTAKE_E2E_JOB_ID',
  'REPAIR_INTAKE_E2E_JOB_NO'
)
$MissingEnvironmentNames = @(
  $RequiredEnvironmentNames | Where-Object {
    [string]::IsNullOrWhiteSpace([Environment]::GetEnvironmentVariable($_, 'Process'))
  }
)
if ($MissingEnvironmentNames.Count -gt 0) {
  throw "Missing Repair Browser E2E environment: $($MissingEnvironmentNames -join ', '). Set the values emitted by the Test-DB fixture in this PowerShell session."
}

function Test-TcpPort {
  param(
    [Parameter(Mandatory = $true)]
    [string]$HostName,
    [Parameter(Mandatory = $true)]
    [int]$Port
  )

  $Client = [System.Net.Sockets.TcpClient]::new()
  try {
    $Async = $Client.BeginConnect($HostName, $Port, $null, $null)
    if (-not $Async.AsyncWaitHandle.WaitOne(2000)) { return $false }
    $Client.EndConnect($Async)
    return $true
  } catch {
    return $false
  } finally {
    $Client.Dispose()
  }
}

Push-Location $ClientRoot
try {
  $ApiUri = [Uri]$TestApiBaseUrl
  $ApiPort = if ($ApiUri.IsDefaultPort) {
    if ($ApiUri.Scheme -eq 'https') { 443 } else { 80 }
  } else {
    $ApiUri.Port
  }

  if (-not (Test-TcpPort -HostName $ApiUri.Host -Port $ApiPort)) {
    throw "Test API is not listening at $TestApiBaseUrl. Start the Server with npm run start:test-database first."
  }

  if (Test-TcpPort -HostName $WebHost -Port $WebPort) {
    throw "Dedicated Repair E2E web port $WebPort is already in use. Stop that process or set E2E_REPAIR_WEB_PORT to another free port."
  }

  Remove-Item $ViteOut, $ViteErr -Force -ErrorAction SilentlyContinue

  $PreviousViteApiBaseUrl = $env:VITE_API_BASE_URL
  $PreviousE2EBaseUrl = $env:E2E_BASE_URL
  $env:VITE_API_BASE_URL = $TestApiBaseUrl
  $env:E2E_BASE_URL = $WebBaseUrl

  Write-Host "Starting dedicated Repair E2E client at $WebBaseUrl" -ForegroundColor Cyan
  Write-Host "Repair E2E API authority: $TestApiBaseUrl" -ForegroundColor Cyan

  $ViteProcess = Start-Process `
    -FilePath 'npm.cmd' `
    -ArgumentList @('run', 'dev', '--', '--host', $WebHost, '--port', "$WebPort", '--strictPort') `
    -WorkingDirectory $ClientRoot `
    -RedirectStandardOutput $ViteOut `
    -RedirectStandardError $ViteErr `
    -PassThru `
    -NoNewWindow

  $Deadline = (Get-Date).AddSeconds(60)
  do {
    if ($ViteProcess.HasExited) {
      $Output = (Get-Content $ViteOut -Raw -ErrorAction SilentlyContinue)
      $ErrorOutput = (Get-Content $ViteErr -Raw -ErrorAction SilentlyContinue)
      throw "Dedicated Vite process exited before becoming ready.`n$Output`n$ErrorOutput"
    }

    try {
      $Response = Invoke-WebRequest -Uri $WebBaseUrl -UseBasicParsing -TimeoutSec 2
      if ($Response.StatusCode -ge 200 -and $Response.StatusCode -lt 500) { break }
    } catch {}

    Start-Sleep -Milliseconds 500
  } while ((Get-Date) -lt $Deadline)

  if ((Get-Date) -ge $Deadline) {
    throw "Dedicated Repair E2E client did not become ready at $WebBaseUrl within 60 seconds."
  }

  npx playwright test src/features/repair/e2e/intake-completion/repairIntakeCompletion.browser.spec.js
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
} finally {
  if ($ViteProcess -and -not $ViteProcess.HasExited) {
    & taskkill.exe /PID $ViteProcess.Id /T /F 2>$null | Out-Null
  }

  if ($null -eq $PreviousViteApiBaseUrl) {
    Remove-Item Env:VITE_API_BASE_URL -ErrorAction SilentlyContinue
  } else {
    $env:VITE_API_BASE_URL = $PreviousViteApiBaseUrl
  }

  if ($null -eq $PreviousE2EBaseUrl) {
    Remove-Item Env:E2E_BASE_URL -ErrorAction SilentlyContinue
  } else {
    $env:E2E_BASE_URL = $PreviousE2EBaseUrl
  }

  Pop-Location
}
