# Action Feedback Audit — Wave 191

Date: 2026-08-16
Branch: `feature/action-feedback-residual-wave-191`
Owner: `src/features/repair/components/ExpensePayeeQuickCreateDialog.jsx`

## Scope

Wave 191 audits the Repair quick-create flow that persists an `ExpensePayee` and then asks the parent workflow to select the newly created payee automatically.

## Residual found

The dialog already had synchronous `savingRef` protection, immutable form snapshots and separate persistence/selection feedback when `onCreated` throws.

One reconciliation gap remained: the parent callback could report failure without throwing, for example by returning `false` or `{ ok: false, error }`. In that case the dialog treated selection as successful and closed even though the payee had only been created, not selected into the active repair workflow.

This is a partial-success boundary because the payee persistence is already committed and must never be reported as a create failure.

## Hardening

- Kept `savingRef` ownership across both persistence and automatic-selection reconciliation.
- Captured the created payee identity once as `createdId` and reused it in event authority.
- Observed the return value of `onCreated(created)` instead of relying only on thrown exceptions.
- Treat both `false` and `{ ok: false }` as selection reconciliation failures.
- Promote a returned error/message into a real selection error for consistent UI and ADS feedback.
- Keep the dialog open after selection failure so the user can see that creation succeeded but automatic selection did not.
- Preserve the existing create-success event; selection failure remains a distinct `:select:error` event.

## Event authority

Persistence success:

`repair:expense-payee:<payeeId>:create:success`

Persistence succeeded but automatic selection failed:

`repair:expense-payee:<payeeId>:select:error`

Create persistence failure remains:

`repair:expense-payee:create:error`

## Verification contract

Added:

`tests/repair-expense-payee-selection-outcome-authority.contract.test.js`

The contract locks synchronous ownership, immutable form intent, created-entity identity and non-throwing callback failure detection.

## Residual status

This owner is hardened for the create → auto-select compound lifecycle. Supplier Payable dispute/adjustment mutations remain a separate confirmed residual candidate for a later wave.
