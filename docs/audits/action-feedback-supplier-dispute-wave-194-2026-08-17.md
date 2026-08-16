# Action Feedback Audit — Wave 194

Date: 2026-08-17
Branch: `feature/action-feedback-residual-wave-194`
Owner: `src/features/supplierPayable/pages/SupplierPayableWorkspacePage.jsx`

## Scope

Wave 194 hardens the remaining Supplier Payable dispute and adjustment lifecycle:

- open dispute
- resolve dispute, optionally with an adjustment
- create direct credit/debit adjustment
- void adjustment

Settlement, Advance, and payable creation were hardened in Waves 187–189.

## Residual found

These four mutations still relied on render-visible `saving` as their only duplicate-submit guard, read live form values when persistence began, and kept persistence plus `load()` reconciliation in one generic `try/catch` boundary.

This left three authority risks:

1. Same-tick duplicate commands could enter before React propagated `saving`.
2. The command payload could drift if form state changed while a request was in flight.
3. A successful Server mutation followed by a failed workspace refresh could be reported like a persistence failure, even though dispute/adjustment authority had already changed.

## Hardening

- Added shared synchronous `disputeMutationRef` ownership for all dispute/adjustment commands.
- Snapshotted payable/dispute/adjustment ids, reasons, notes, amounts, direction/type, and document values before persistence.
- Replaced generic success/error feedback with entity-scoped ADS action feedback.
- Reused observable `load({ reportError: false })` and added dedicated partial-success feedback when reconciliation fails.
- Mutation ownership remains held through post-success refresh.

## Event authority

Open dispute:

`supplier-payable:<payableId>:dispute:open:{success|error|refresh:error}`

Resolve dispute:

`supplier-payable:dispute:<disputeId>:resolve:{success|error|refresh:error}`

Create adjustment:

`supplier-payable:<payableId>:adjustment:create:{success|error|refresh:error}`

Void adjustment:

`supplier-payable:adjustment:<adjustmentId>:void:{success|error|refresh:error}`

## Verification contract

Added:

`tests/supplier-dispute-adjustment-partial-success-authority.contract.test.js`

The contract locks synchronous mutation ownership, immutable snapshots, entity-scoped feedback, observable post-success reconciliation, and partial-success separation.
