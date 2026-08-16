# Action Feedback Residual Audit — Wave 175

Date: 2026-08-16

## Scope

Tax Closing Package finalization in `TaxClosingHandoffPage.jsx`.

## Residual found

The page already had a synchronous `finalizingRef`, confirmation dialog, ADS success/error feedback, and UI freeze during finalization. The remaining gap was the read-after-success boundary: `load()` swallowed refresh failures and returned no observable outcome, while `finalizeSnapshot()` treated the refresh as an opaque follow-up after a successful persistent finalization.

That meant the server could successfully finalize the Tax Closing Snapshot while the page failed to reconcile the latest bundle, without a dedicated partial-success notification explaining that persistence succeeded but the screen may be stale.

## Change

- `load()` now returns `{ ok, data, error }` while retaining its existing read-error UI behavior.
- Finalization snapshots `branchId`, `taxPeriodId`, and `snapshotHash` before persistence.
- Persistence failure keeps a dedicated `:finalize:error` event.
- Server-confirmed finalization emits success before any refresh attempt.
- Refresh failure after success emits `:refresh-after-finalize:error` with wording that explicitly preserves the successful finalization outcome.
- `finalizingRef` remains held through the complete persistence + reconciliation lifecycle.
- Event identity now includes both branch and tax-period authority.

## Verification contract

Added `tests/tax-closing-finalize-partial-success-authority.contract.test.js` to lock:

- synchronous finalization ownership,
- immutable branch/period/hash snapshots,
- observable refresh outcome,
- persistence -> success -> refresh ordering,
- dedicated post-success refresh feedback.

## Result

Wave 175 narrows the remaining Tax Closing risk from persistence correctness to explicit reconciliation semantics. No API route, server contract, tax calculation, export format, or schema was changed.
