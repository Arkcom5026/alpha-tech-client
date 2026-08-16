# Wave 202 — Sale Return cross-sale async authority

## Scope

Residual audit of `src/features/sales/return/pages/CreateReturnPage.jsx` after Wave 201.

## Confirmed residual

The sale-return create page already had a synchronous submit guard and immutable mutation payload snapshots, but two route-context gaps remained:

1. `getSaleReturnEligibility(saleId).then(setEligibility)` could write a stale eligibility response after the route moved to a different sale.
2. After the sale-return persistence succeeded, downstream credit-note issuance and navigation still used the current component route without first proving that the original sale/shop context remained authoritative.

This matters because the sale return is a financial mutation. Once persistence succeeds, a later route change must not cause the old workflow to drive UI or downstream actions for a different sale context.

## Changes

- Added `saleContextRef` to track the current `saleId` and `shopSlug`.
- Added `eligibilityRequestRef` to sequence eligibility reads and discard stale responses.
- Reset sale-specific draft state when the sale/shop route context changes.
- Snapshot `targetSaleId` and `targetShopSlug` before the mutation.
- Added ADS persistence success/error events scoped to the sale id.
- After persistence succeeds, verify that the original route context is still owned before continuing to credit-note issuance or navigation.
- After credit-note issuance succeeds, verify route ownership again before opening the document.
- Preserve partial-success semantics when the sale return succeeds but credit-note issuance fails.

## Event authority

- `sale-return:<saleId>:complete:success`
- `sale-return:<saleId>:complete:error`
- `sale-return:<saleId>:context-changed-after-complete:error`
- `sale-return:<saleId>:credit-note:error`
- `sale-return:<saleId>:credit-note:context-changed:error`

## Contract

`tests/sale-return-cross-sale-authority.contract.test.js`

The contract locks the route-context refs, immutable sale/shop snapshots, stale eligibility rejection, and post-persistence context-change events.

## Residual assessment

This wave addresses a cross-entity async authority defect rather than a basic missing toast. The remaining agenda should continue to prioritize stale response ownership and post-success reconciliation boundaries over already-standardized feedback surfaces.
