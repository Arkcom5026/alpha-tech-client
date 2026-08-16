# Action Feedback Residual Audit — Wave 159

Date: 2026-08-16
Branch: `feature/action-feedback-residual-wave-159`
Base: `feature/action-feedback-residual-wave-158`

## Scope

Wave 159 hardens the customer refund financial mutation boundary.

## Residual found

`RefundForm.jsx` already emitted ADS success/error feedback and already distinguished server-confirmed refund success from a later refresh failure. However, the persistence boundary relied only on the refund store `loading` state. A fast second submit could enter before the disabled render committed.

The live sale-return id, remaining refundable balance, amount, deduction, method, and note were also read from mutable render values without an explicit command snapshot.

## Changes

- Added synchronous `submittingRef` ownership for refund persistence.
- Added render-visible `submitting` state and a combined `mutationBusy` authority.
- Snapshotted sale-return id, remaining refundable balance, and the refund command before persistence begins.
- Validation now runs against the immutable refund command and balance snapshot.
- Conflicting amount, deduction, payment-method, note, and submit controls are frozen while the mutation is owned.
- Preserved the existing partial-success rule: refund success is announced before attempting the parent refresh, and refresh failure uses a dedicated ADS error event without misreporting persistence failure.

## Contract

Added `tests/refund-financial-mutation-authority.contract.test.js` to lock synchronous ownership, financial snapshots, UI freeze behavior, and the server-success-before-refresh ordering.

## Verification status

Git-side implementation complete. Local typecheck/build/test verification remains pending until the local workspace is available.
