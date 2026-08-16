# Action Feedback Residual Audit — Wave 167

Date: 2026-08-16
Branch: `feature/action-feedback-residual-wave-167`
Base: `feature/action-feedback-residual-wave-166`

## Scope

Wave 167 audits the canonical stock receiving mutation store used by the barcode receiving workspace:

- `receiveSNAction`
- `receiveAllPendingNoSNAction`

## Residual found

The UI already has queue-level protection for normal scan processing, but the Zustand store exposed the two persistent receiving commands independently and only used React/Zustand `loading` as a visible state.

That left a store-level race window where conflicting receiving commands could be invoked by different callers before render-state controls had propagated.

## Changes

- Added one synchronous store authority: `mutationAction`.
- Serialized `RECEIVE_SCAN` and `RECEIVE_ALL_PENDING` so only one persistent receive command can own the boundary at a time.
- Snapshotted barcode, serial number, receipt item id, and receipt id before persistence.
- Added a deterministic busy error instead of silently accepting a conflicting command.
- Release logic clears the authority only if the action that acquired it still owns it.
- Preserved existing scanned-list success/error behavior and existing API contracts.

## Contract evidence

Added:

`tests/stock-receive-mutation-serialization.contract.test.js`

The contract locks:

- shared store mutation ownership,
- immutable command snapshots,
- receive-all serialization,
- owner-safe release semantics.

## Deferred

Post-success refresh feedback in `ScanBarcodeListPage.jsx` remains a separate UI-owner concern. Wave 166 made barcode refresh outcome observable; a later wave can use that signal for finalize / scan / receive-all partial-success messaging without mixing this store-serialization change with a larger page rewrite.

## Verification status

Git implementation complete. Local typecheck/build/test verification remains pending.
