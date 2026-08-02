# Repair Intake Completion Browser E2E

This directory is the module-owned Browser E2E package for repair intake completion.

## Authority split

- `repairIntakeCompletion.browser.spec.js` proves the employee can operate the real UI against the local Server connected to the Test DB.
- The paired Server package under `src/modules/repair/e2e/intake-completion/` provisions isolated Test-DB data and verifies database post-conditions read-only.
- No API interception, mock response, store injection, or direct browser-side database access is allowed.

## Required environment

- `E2E_BASE_URL`
- `E2E_TEST_USERNAME`
- `E2E_TEST_PASSWORD`
- `REPAIR_INTAKE_E2E_BRANCH_SLUG`
- `REPAIR_INTAKE_E2E_JOB_ID`
- `REPAIR_INTAKE_E2E_JOB_NO`

Use the values emitted by the paired Server fixture command.

## Run from this package

```powershell
.\src\features\repair\e2e\intake-completion\run-browser-e2e.ps1
```

After Browser PASS, run the paired Server read-only verifier with the fixture RepairJob ID.
