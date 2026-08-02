# Repair Intake Completion Browser E2E

This directory is the module-owned Browser E2E package for repair intake completion.

## Authority split

- `repairIntakeCompletion.browser.spec.js` proves the employee can operate the real UI against the local Server connected to the Test DB.
- The paired Server package under `src/modules/repair/e2e/intake-completion/` provisions isolated Test-DB data and verifies database post-conditions read-only.
- No API interception, mock response, store injection, or direct browser-side database access is allowed.

## Runtime authority

The normal Alpha-Tech local Client defaults to API port `5000`. The Test-DB API uses port `3000` through `npm run start:test-database`.

To prevent an already-running Vite process from using the wrong API authority, `run-browser-e2e.ps1` starts a dedicated Vite instance on `http://127.0.0.1:5174`, compiles it with `VITE_API_BASE_URL=http://localhost:3000`, runs the Repair Browser E2E, and stops the dedicated process afterward.

Do not use the normal Vite instance on port `5173` as Browser E2E authority for this package.

Optional overrides:

- `E2E_TEST_API_BASE_URL` — defaults to `http://localhost:3000`
- `E2E_REPAIR_WEB_PORT` — defaults to `5174`

## Required environment

- `E2E_TEST_USERNAME`
- `E2E_TEST_PASSWORD`
- `REPAIR_INTAKE_E2E_BRANCH_SLUG`
- `REPAIR_INTAKE_E2E_JOB_ID`
- `REPAIR_INTAKE_E2E_JOB_NO`

Use the values emitted by the paired Server fixture command.

## Run from this package

First keep the paired Server Test-DB runtime open:

```powershell
cd D:\alpha-tech\server
npm run start:test-database
```

Then, in the Client PowerShell session containing the Browser environment:

```powershell
.\src\features\repair\e2e\intake-completion\run-browser-e2e.ps1
```

After Browser PASS, run the paired Server read-only verifier with the fixture RepairJob ID.
