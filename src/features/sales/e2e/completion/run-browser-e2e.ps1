param(
  [Parameter(Mandatory = $false)]
  [string]$ServerRoot,

  [Parameter(Mandatory = $false)]
  [switch]$SkipProvision
)

$ErrorActionPreference = 'Stop'
$ClientRoot = Resolve-Path (Join-Path $PSScriptRoot '..\..\..\..\..')

if ([string]::IsNullOrWhiteSpace($ServerRoot)) {
  $ServerRoot = Join-Path (Split-Path $ClientRoot -Parent) 'server'
}
$ServerRoot = Resolve-Path $ServerRoot

function Import-DotEnvFile {
  param([Parameter(Mandatory = $true)][string]$Path)
  if (-not (Test-Path $Path)) { return }

  foreach ($Line in Get-Content $Path) {
    $Trimmed = $Line.Trim()
    if ([string]::IsNullOrWhiteSpace($Trimmed) -or $Trimmed.StartsWith('#')) { continue }
    $SeparatorIndex = $Trimmed.IndexOf('=')
    if ($SeparatorIndex -le 0) { continue }

    $Name = $Trimmed.Substring(0, $SeparatorIndex).Trim()
    $Value = $Trimmed.Substring($SeparatorIndex + 1).Trim()
    if (
      ($Value.StartsWith('"') -and $Value.EndsWith('"')) -or
      ($Value.StartsWith("'") -and $Value.EndsWith("'"))
    ) {
      $Value = $Value.Substring(1, $Value.Length - 2)
    }

    if ([string]::IsNullOrWhiteSpace([Environment]::GetEnvironmentVariable($Name, 'Process'))) {
      [Environment]::SetEnvironmentVariable($Name, $Value, 'Process')
    }
  }
}

function Test-TcpPort {
  param(
    [Parameter(Mandatory = $true)][string]$HostName,
    [Parameter(Mandatory = $true)][int]$Port
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

function Set-BrowserEnvironment {
  param([Parameter(Mandatory = $true)]$Values)
  foreach ($Property in $Values.PSObject.Properties) {
    [Environment]::SetEnvironmentVariable(
      $Property.Name,
      [string]$Property.Value,
      'Process'
    )
  }
}

Import-DotEnvFile (Join-Path $ClientRoot '.env.e2e.local')
Import-DotEnvFile (Join-Path $ServerRoot '.env.restore')
Import-DotEnvFile (Join-Path $ServerRoot '.env')

if ([string]::IsNullOrWhiteSpace($env:POS_SALE_E2E_DATABASE_MODE)) {
  $env:POS_SALE_E2E_DATABASE_MODE = 'TEST_DB'
}

$ApiBaseUrl = if ($env:E2E_SALE_API_BASE_URL) {
  $env:E2E_SALE_API_BASE_URL.TrimEnd('/')
} elseif ($env:E2E_TEST_API_BASE_URL) {
  $env:E2E_TEST_API_BASE_URL.TrimEnd('/')
} else {
  'http://localhost:3000'
}
$WebPort = if ($env:E2E_SALE_WEB_PORT) { [int]$env:E2E_SALE_WEB_PORT } else { 5174 }
$WebHost = 'localhost'
$WebBaseUrl = "http://$WebHost`:$WebPort"
$ViteOut = Join-Path $env:TEMP 'alphatech-sale-e2e-vite.out.log'
$ViteErr = Join-Path $env:TEMP 'alphatech-sale-e2e-vite.err.log'
$ResultPath = Join-Path $env:TEMP 'alphatech-sale-e2e-result.json'
$ViteProcess = $null

try {
  if (-not $SkipProvision) {
    Write-Host 'Provisioning Sale completion fixture...' -ForegroundColor Cyan
    Push-Location $ServerRoot
    try {
      $FixtureRaw = (& node src/modules/sales/e2e/completion/provisionSaleCompletionFixture.js | Out-String).Trim()
      if ($LASTEXITCODE -ne 0) { throw "Sale fixture provisioner failed with exit code $LASTEXITCODE." }
    } finally {
      Pop-Location
    }

    try {
      $FixtureResult = $FixtureRaw | ConvertFrom-Json
    } catch {
      throw "Sale fixture provisioner did not return valid JSON.`n$FixtureRaw"
    }
    if ($FixtureResult.result -ne 'PASS' -or -not $FixtureResult.browserEnvironment) {
      throw "Sale fixture provisioner did not return PASS browser environment.`n$FixtureRaw"
    }
    Set-BrowserEnvironment $FixtureResult.browserEnvironment
  } else {
    Import-DotEnvFile (Join-Path $ClientRoot '.env.e2e.runtime.local')
  }

  $RequiredEnvironmentNames = @(
    'POS_SALE_E2E_OPERATOR_EMAIL',
    'POS_SALE_E2E_OPERATOR_PASSWORD',
    'POS_SALE_E2E_BRANCH_ID',
    'POS_SALE_E2E_BRANCH_SLUG',
    'POS_SALE_E2E_STOCK_BARCODE',
    'POS_SALE_E2E_EXPECTED_RETAIL_TOTAL',
    'POS_SALE_E2E_CUSTOMER_NAME',
    'POS_SALE_E2E_CUSTOMER_PHONE'
  )
  $MissingEnvironmentNames = @(
    $RequiredEnvironmentNames | Where-Object {
      [string]::IsNullOrWhiteSpace([Environment]::GetEnvironmentVariable($_, 'Process'))
    }
  )
  if ($MissingEnvironmentNames.Count -gt 0) {
    throw "Missing Sale Browser E2E environment: $($MissingEnvironmentNames -join ', ')."
  }

  $ApiUri = [Uri]$ApiBaseUrl
  $ApiPort = if ($ApiUri.IsDefaultPort) {
    if ($ApiUri.Scheme -eq 'https') { 443 } else { 80 }
  } else { $ApiUri.Port }

  if (-not (Test-TcpPort -HostName $ApiUri.Host -Port $ApiPort)) {
    throw "Sale E2E API is not listening at $ApiBaseUrl. Start the Server with the same database authority used by the fixture."
  }
  if (Test-TcpPort -HostName $WebHost -Port $WebPort) {
    throw "Dedicated Sale E2E web port $WebPort is already in use."
  }

  Remove-Item $ViteOut, $ViteErr, $ResultPath -Force -ErrorAction SilentlyContinue
  $PreviousViteApiBaseUrl = $env:VITE_API_BASE_URL
  $PreviousE2EBaseUrl = $env:E2E_BASE_URL
  $PreviousResultPath = $env:POS_SALE_E2E_RESULT_PATH
  $env:VITE_API_BASE_URL = $ApiBaseUrl
  $env:E2E_BASE_URL = $WebBaseUrl
  $env:POS_SALE_E2E_RESULT_PATH = $ResultPath

  Write-Host "Starting dedicated Sale E2E client at $WebBaseUrl" -ForegroundColor Cyan
  Write-Host "Sale E2E API authority: $ApiBaseUrl" -ForegroundColor Cyan
  Write-Host "Sale fixture stock: $($env:POS_SALE_E2E_STOCK_BARCODE)" -ForegroundColor Cyan

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
      $Output = Get-Content $ViteOut -Raw -ErrorAction SilentlyContinue
      $ErrorOutput = Get-Content $ViteErr -Raw -ErrorAction SilentlyContinue
      throw "Dedicated Vite process exited before becoming ready.`n$Output`n$ErrorOutput"
    }
    try {
      $Response = Invoke-WebRequest -Uri $WebBaseUrl -UseBasicParsing -TimeoutSec 2
      if ($Response.StatusCode -ge 200 -and $Response.StatusCode -lt 500) { break }
    } catch {}
    Start-Sleep -Milliseconds 500
  } while ((Get-Date) -lt $Deadline)

  if ((Get-Date) -ge $Deadline) {
    throw "Dedicated Sale E2E client did not become ready at $WebBaseUrl within 60 seconds."
  }

  Push-Location $ClientRoot
  try {
    Write-Host 'Ensuring module-owned Sale E2E authentication state...' -ForegroundColor Cyan
    node src/features/sales/e2e/completion/ensureSaleMerchantAuthState.js
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

    npx playwright test src/features/sales/e2e/completion/saleCompletion.browser.spec.js
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
  } finally {
    Pop-Location
  }

  if (-not (Test-Path $ResultPath)) {
    throw 'Sale Browser E2E passed without publishing result evidence.'
  }
  $BrowserResult = Get-Content $ResultPath -Raw | ConvertFrom-Json
  if ($BrowserResult.result -ne 'PASS') {
    throw "Sale Browser E2E result is not PASS: $($BrowserResult | ConvertTo-Json -Depth 8)"
  }

  Write-Host 'Running read-only Sale database verifier...' -ForegroundColor Cyan
  Push-Location $ServerRoot
  try {
    node src/modules/sales/e2e/completion/verifySaleCompletionOutcome.js `
      $BrowserResult.saleId `
      $BrowserResult.branchId
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
  } finally {
    Pop-Location
  }

  Write-Host 'Sale completion Browser + Database E2E package: PASS' -ForegroundColor Green
} finally {
  if ($ViteProcess -and -not $ViteProcess.HasExited) {
    & taskkill.exe /PID $ViteProcess.Id /T /F 2>$null | Out-Null
  }

  if ($null -eq $PreviousViteApiBaseUrl) { Remove-Item Env:VITE_API_BASE_URL -ErrorAction SilentlyContinue }
  else { $env:VITE_API_BASE_URL = $PreviousViteApiBaseUrl }

  if ($null -eq $PreviousE2EBaseUrl) { Remove-Item Env:VITE_API_BASE_URL -ErrorAction SilentlyContinue }
  else { $env:E2E_BASE_URL = $PreviousE2EBaseUrl }

  if ($null -eq $PreviousResultPath) { Remove-Item Env:POS_SALE_E2E_RESULT_PATH -ErrorAction SilentlyContinue }
  else { $env:POS_SALE_E2E_RESULT_PATH = $PreviousResultPath }
}
