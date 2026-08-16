# Action Feedback Residual Audit — Wave 168

Date: 2026-08-16

## Scope

Wave 168 hardens the stock receiving page after Wave 167 introduced store-level mutation serialization.

Canonical owner:
- `src/features/stockItem/pages/ScanBarcodeListPage.jsx`

Persistent workflows covered:
- finalize purchase receipt
- receive one scanned stock item
- receive all pending non-SN items

## Residual found

Wave 166 made `loadBarcodesAction()` return an observable `{ ok, error }` result without changing its non-throwing read semantics. Wave 167 serialized stock receiving mutations in the store.

The page still had three gaps:

1. finalize, scan, and receive-all did not share one synchronous page-level ownership boundary;
2. server-confirmed persistence success was followed by barcode refresh before success feedback was finalized;
3. a failed barcode refresh after successful persistence could leave the page stale without explicit partial-success feedback.

## Changes

- Added `workflowMutationRef` with explicit `FINALIZE`, `RECEIVE_SCAN`, and `RECEIVE_ALL_PENDING` ownership.
- Snapshotted `receiptId` before each persistent command.
- Added ADS success/error event keys for receiving actions.
- Added `reportRefreshAfterSuccess()` to preserve server-confirmed success and report barcode refresh failure separately.
- Guarded conflicting back navigation and SN editing while the workflow mutation owns the page.
- Preserved the existing scan queue and Wave 166 SN-edit authority.

## Outcome semantics

Persistence failure remains an action failure.

Persistence success is announced immediately after the persistent command resolves. Barcode-list refresh runs afterward. If that read fails, the page reports a partial-success warning instead of relabeling the persistent action as failed.

## Verification contract

Added:
- `tests/stock-receive-partial-success-authority.contract.test.js`

The contract locks:
- synchronous page ownership;
- receipt snapshots;
- persistence-success-before-refresh ordering;
- dedicated `:refresh:error` feedback;
- conflicting navigation/edit guards.

## Local verification

Pending. Full typecheck/build/test verification must run when the local workflow is available.
