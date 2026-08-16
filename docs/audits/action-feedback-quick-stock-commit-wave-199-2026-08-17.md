# Wave 199 — Quick Stock commit mutation authority

## Scope

Owner: `src/features/receiving/quick-stock/hooks/useQuickStockCommitController.js`

This wave hardens the final Quick Stock intake commit boundary only. It does not change stock calculation, barcode validation rules, product onboarding, or server APIs.

## Residual found

The controller previously used only React `isCommitting` state to represent commit ownership. Because state updates are asynchronous, two same-tick invocations could both pass validation before the next render. The success message also read `barcodeQueue.length` after persistence rather than using the exact queue snapshot sent to the server.

## Changes

- Added synchronous `commitRef` mutation ownership.
- Bound render-visible busy state to `isCommitting || commitRef.current`.
- Snapshot product identity, note, prices, barcode/serial queue, and queue count before persistence.
- Build the intake payload exclusively from those snapshots.
- Bind success/error feedback to the snapshotted product id.
- Use the snapshotted queue count in the success message so feedback describes the committed command rather than later UI state.
- Keep queue reset strictly after successful persistence.

## Feedback authority

Success event:

`quick-stock:intake:<productId>:success`

Failure event:

`quick-stock:intake:<productId>:error`

## Contract

`tests/quick-stock-commit-mutation-authority.contract.test.js`

The contract locks synchronous ownership, immutable command snapshots, entity-scoped feedback, and render-state integration.

## Verification status

Git-side source review and branch diff verification are complete. Local Node contract execution, typecheck, build, and runtime verification remain pending under the current Git-first workflow.
