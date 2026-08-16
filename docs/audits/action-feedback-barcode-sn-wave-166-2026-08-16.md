# Action Feedback Residual Audit — Wave 166

## Scope

Wave 166 hardens barcode / serial-number mutations in the procurement receiving workspace.

## Residual found

The barcode store persisted SN changes and then called `loadBarcodesAction()` as a post-success refresh. That read action swallowed refresh failures and returned no status, so mutation callers could not distinguish a persistence failure from a successful mutation followed by a stale-list refresh failure.

The receiving page also relied on React `editingSubmitting` alone for the edit-SN interaction, leaving a first-render duplicate-submit gap.

## Authority introduced

- `loadBarcodesAction()` now returns an explicit `{ ok, error, barcodes }` read result while preserving its existing non-throwing compatibility.
- `updateReceivedSNAction`, `updateSerialNumberAction`, and `deleteSerialNumberAction` preserve server-confirmed persistence and return `refreshError` metadata when the post-success barcode refresh fails.
- The receiving page owns edit-SN submission synchronously with `editingMutationRef`.
- Receipt id, barcode-receipt id, barcode, stock-item id, and serial value are snapshotted before persistence begins.
- Successful SN persistence is announced before a refresh problem is surfaced.
- A failed post-success refresh is reported as partial success instead of mutation failure.
- The receiving-page delete path no longer performs a second redundant barcode refresh.

## Compatibility / safety

- No receiving, barcode, stock, or server persistence API is changed.
- Existing optimistic/local barcode-state updates remain intact.
- `loadBarcodesAction()` remains non-throwing for existing callers; it only gains an explicit result contract.
- `InStockBarcodeTable.jsx` is intentionally not rewritten in this wave because the file is CRLF and changing it through the Git contents workflow would risk full-file line-ending churn. Its separate refresh ownership remains a later residual candidate.
- No schema or database changes.

## Verification

A static contract test was added at `tests/barcode-sn-partial-success-authority.contract.test.js` to lock:

- observable refresh outcomes,
- separate refresh metadata after persistence,
- synchronous edit-SN ownership,
- immutable command snapshots,
- ADS success / partial-success feedback,
- removal of the duplicate receiving-page delete refresh.

Local typecheck/build/test execution remains pending until the Local workspace is available.
