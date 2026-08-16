# Action Feedback Residual Audit — Wave 155

## Scope

`src/features/branchPrice/workspace/ManageBranchPriceWorkspace.jsx`

## Residual found

The workspace already had synchronous `savingRef` ownership and immutable update snapshots, but the persistent update and the post-success refresh were inside the same `try/catch` block.

A successful `updateMultipleBranchPricesAction(updates)` followed by a failed `fetchAllProductsWithPriceByTokenAction(refreshFilters)` could therefore be reported as a save failure even though the server-side branch-price mutation had already succeeded.

## Wave 155 authority

- Preserve the existing synchronous mutation lock.
- Preserve immutable `updates` and `refreshFilters` snapshots.
- Treat `updateMultipleBranchPricesAction(updates)` as the persistence boundary.
- Emit the success outcome immediately after persistence succeeds.
- Run list refresh as a post-success operation.
- If refresh fails, emit a distinct partial-success `actionError` explaining that prices were saved but the latest list could not be refreshed.
- Keep the pending list cleared after server-confirmed success to avoid encouraging a duplicate write.

## Event keys

- Persistence success: `branch-price:update:success`
- Persistence failure: `branch-price:update:error`
- Post-success refresh failure: `branch-price:update:refresh:error`

## Verification status

Implementation and contract coverage are committed on the Git feature branch. Local `npm run verify` remains pending until the local workspace is available.
