$ErrorActionPreference = 'Stop'

$ClientRoot = Resolve-Path (Join-Path $PSScriptRoot '..\..\..\..\..')
Push-Location $ClientRoot
try {
  npx playwright test src/features/repair/e2e/intake-completion/repairIntakeCompletion.browser.spec.js
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
} finally {
  Pop-Location
}
