# Sale Completion Browser E2E

Module-owned Browser E2E package for POS sale completion.

## Authority split

- `saleCompletion.browser.spec.js` proves staff can operate the real Sale UI against the selected database runtime.
- The paired Server module provisions the fixture and verifies database post-conditions read-only.
- No API interception, mock response, store injection, or browser-side database access is allowed.

## Authentication authority

Sale E2E follows the Repair E2E pattern:

- authentication is prepared by runtime bootstrap/storage state
- business-flow tests do not repeat manual login steps
- authentication failures are runtime authority failures
- receipt handoff must never visit Login or Partner Portal Login

## Integrated package runner

Run from PowerShell:

```powershell
.\src\features\sales\e2e\completion\run-browser-e2e.ps1
```

The default Server repository is the sibling `server` directory. Override it when needed:

```powershell
.\src\features\sales\e2e\completion\run-browser-e2e.ps1 `
  -ServerRoot D:\alpha-tech\server
```

The runner performs:

1. Server fixture provisioning through the selected runtime authority.
2. Browser environment injection from fixture JSON.
3. Dedicated Vite startup on the Sale E2E port.
4. Reusable Merchant authentication-state bootstrap.
5. Real POS Sale Browser flow.
6. Receipt popup/same-tab authentication verification.
7. Read-only Server database verification using the emitted `saleId` and `branchId`.

Use `-SkipProvision` only when all `POS_SALE_E2E_*` fixture values are already supplied through `.env.e2e.runtime.local` or the current process environment.

## Flow authority

Authentication bootstrap → POS Sale → Customer → Product → Payment → Sale Completion → Receipt/Bill Print → Database evidence verification.

## Document handoff verification

The completion flow supports:

- popup/new-tab receipt document
- same-tab receipt document fallback

Both modes must preserve the authenticated merchant session. The Browser spec writes a JSON evidence bridge containing the Sale identity, Branch identity, handoff mode, final receipt URL, and authentication-redirect result.

## Contract check

```powershell
node src/features/sales/e2e/completion/saleCompletionPackage.contract.test.js
```
