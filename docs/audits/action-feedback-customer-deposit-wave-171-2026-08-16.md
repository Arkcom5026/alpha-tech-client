# Action Feedback Residual Audit — Wave 171

Date: 2026-08-16
Branch: `feature/action-feedback-residual-wave-171`
Base: `feature/action-feedback-residual-wave-170`
Owner: Customer Deposit legacy finance flow

## Residual defect found

`ListCustomerDepositPage.jsx` already emitted ADS success/error feedback for legacy deposit cancellation, but a successful cancellation did not reconcile the in-memory `deposits` list. The UI therefore continued to render the destructive cancel action against a record whose server status had already transitioned to `CANCELLED` until a later reload.

This is a financial-state authority defect rather than a missing-toast defect: persistence could succeed while the visible action surface remained stale and still looked actionable.

## Change

- Added a synchronous `cancelingRef` guard alongside React loading state to close the same-tick duplicate-submit window.
- Snapshot the target deposit id before awaiting persistence.
- After successful persistence, reconcile the returned record into the local list immediately, with `CANCELLED` as the defensive terminal-status fallback.
- Render a visible `ยกเลิกแล้ว` terminal badge instead of the destructive action for cancelled records.
- Keep the confirmation dialog frozen while the cancellation mutation is in flight.
- Preserve existing ADS success/error event keys and wording.

## Contract

Added:

`tests/customer-deposit-cancel-reconciliation.contract.test.js`

The contract locks the synchronous guard, target snapshot, awaited mutation, immediate list reconciliation, terminal-state rendering, and dialog freeze behavior.

## Scope

No API, server, schema, route, or unrelated UX changes are included in this wave.
