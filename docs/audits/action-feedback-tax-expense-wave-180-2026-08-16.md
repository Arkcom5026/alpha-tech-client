# Action Feedback Residual Audit — Wave 180

Date: 2026-08-16
Branch: `feature/action-feedback-residual-wave-180`
Scope: Tax Expense evidence verification

## Residual found

`TaxExpenseWorkspacePage.jsx` already had confirmation and ADS success/error feedback for evidence verification, but two lifecycle gaps remained:

1. Verification relied on render-visible `verifyingEvidenceId` only, leaving a same-tick duplicate-submit window before React committed the disabled state.
2. After `verifyTaxExpenseEvidence()` succeeded, the page called workspace `load()` inside the same `try/catch`. The hook swallowed refresh errors, so the caller could not distinguish a successful evidence verification from a failed post-success refresh. The user could see success while the workspace remained stale without an explicit partial-success warning.

## Wave 180 changes

- Added synchronous `evidenceMutationRef` ownership across verification and post-success reconciliation.
- Snapshotted expense id and expense number before persistence.
- Kept conflicting assessment/refresh/evidence interactions disabled while verification owns the lifecycle.
- Made `useTaxExpenseWorkspace().load()` return observable `{ ok, ... }` / `{ ok: false, error, message }` outcomes while preserving existing read-error UI by default.
- Added `reportError: false` for post-success reconciliation to avoid duplicate generic read feedback.
- Emitted verification success immediately after Server persistence succeeds.
- Added dedicated `tax-expense:<id>:evidence-verify:refresh:error` partial-success feedback when the workspace refresh fails after verification succeeds.

## Contract evidence

Added:

`tests/tax-expense-evidence-partial-success-authority.contract.test.js`

The contract locks synchronous ownership, immutable expense identity, persistence-before-refresh ordering, observable refresh outcomes, dedicated partial-success feedback, and lifecycle-safe ownership release.

## Scope discipline

No Tax Expense API route, Server behavior, schema, evidence policy, category/payee creation behavior, or assessment policy changed. Wave 180 only hardens Client-side evidence verification authority and refresh outcome communication.

## Verification status

Git-side source, contract, and audit changes are complete. Local contract execution, typecheck, build, and runtime verification remain pending until Local execution is available.
