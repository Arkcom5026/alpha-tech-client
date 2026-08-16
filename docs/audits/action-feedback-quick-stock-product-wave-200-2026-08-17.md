# Wave 200 — Quick Stock product mutation authority

## Scope

Residual audit of `useQuickStockProductController.js` after Wave 199.

## Defects found

The Quick Stock product owner still relied on React render state (`isCreatingOperationalProduct`, `isSavingProduct`, `isDeletingProduct`) as the main guard for local product creation, inline product update, and recovery deletion. Because React state is not a synchronous command lock, two actions could enter during the same tick before the next render.

Inline update also read `operationalProduct`, `productForm`, and `priceForm` live throughout the async lifecycle instead of binding the persistence command to one immutable snapshot. Delete mixed persistence and the post-delete product search refresh in one failure boundary, so a refresh failure after a successful delete could be reported like a delete failure.

## Changes

- Added shared synchronous `productMutationRef` authority across local create, inline save, and recovery delete.
- Freeze product/form/price intent before persistence.
- Freeze edit/create/select helpers while a product mutation owns the controller.
- Replaced generic success/error notifications on the audited mutations with entity/operation-scoped ADS feedback keys.
- Split delete persistence success from post-delete search reconciliation; a failed refresh now reports partial success via `delete:refresh:error`.
- Kept template materialization lifecycle outside this wave because it already has effect cleanup ownership and is not an explicit user mutation re-entry path.

## Contract

`tests/quick-stock-product-mutation-authority.contract.test.js`

The contract locks the synchronous mutation ref, immutable snapshots, operation-scoped feedback identities, and delete partial-success reconciliation boundary.

## Verification status

Git-side structural verification only. Local typecheck/build/runtime verification remains pending under the current Git-first workflow.
