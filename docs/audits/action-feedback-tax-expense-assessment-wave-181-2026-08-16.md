# Action Feedback Residual Audit — Wave 181

Date: 2026-08-16
Branch: `feature/action-feedback-residual-wave-181`
Scope: Tax Expense Assessment confirmation / reconciliation

## Residual found

`TaxExpenseAssessmentPanel.jsx` already had a synchronous `savingRef`, command snapshotting, and ADS success/error feedback for the persistence step. Two lifecycle gaps remained after confirmation succeeded:

1. `savingRef` and `saving` were released immediately after the persistence request, before the success feedback and post-success reconciliation completed. This reopened the panel to conflicting interaction while the latest assessment/workspace state was still being reconciled.
2. The panel's `load()` swallowed assessment-refresh failure and the parent `onConfirmed()` callback could now return an observable `{ ok: false }` result without throwing. The panel therefore had no reliable way to surface either stale assessment data or stale parent workspace data after a successful confirmation.

## Wave 181 changes

- Keep synchronous assessment mutation ownership across persistence, success feedback, assessment refresh, and parent workspace reconciliation.
- Make assessment `load()` return observable `{ ok, data, error }` results while preserving normal read-error feedback.
- Suppress duplicate generic read feedback during post-success reconciliation and emit dedicated partial-success events instead.
- Detect both thrown and non-throwing parent refresh failures.
- Freeze refresh, close, treatment selectors, note editing, and confirm controls through the complete mutation lifecycle.
- Preserve the immutable `expenseIdSnapshot` as event/command identity.

## Partial-success semantics

If assessment persistence succeeds but the panel refresh fails:

`tax-expense:assessment:<expenseId>:refresh:error`

If assessment persistence succeeds but the related workspace refresh fails:

`tax-expense:assessment:<expenseId>:post-confirm:error`

Neither case is reported as assessment persistence failure.

## Contract evidence

Added:

`tests/tax-expense-assessment-reconciliation-authority.contract.test.js`

The contract locks synchronous ownership, immutable identity, observable refresh outcome, dedicated partial-success events, parent-result observation, and lifecycle-safe release.

## Scope discipline

No API, Server behavior, schema, tax policy, or assessment rule changed. Wave 181 only hardens Client mutation/reconciliation authority and outcome communication.

## Verification status

Git-side source, contract, and audit changes are complete. Local contract execution, typecheck, build, and runtime verification remain pending until Local execution is available.
