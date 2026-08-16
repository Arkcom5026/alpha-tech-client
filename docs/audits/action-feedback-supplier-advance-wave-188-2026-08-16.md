# Action Feedback Audit — Wave 188

Date: 2026-08-16
Branch: `feature/action-feedback-residual-wave-188`
Owner: `src/features/supplierPayable/pages/SupplierPayableWorkspacePage.jsx`

## Scope

Wave 188 hardens the Supplier Advance lifecycle only:

- create Supplier Advance
- apply Advance to Payables
- activate / certify legacy Advance balance
- void Advance and reverse allocations
- post-success workspace reconciliation

Payable creation from receipts plus dispute/adjustment mutations remain separate residual candidates.

## Residual found

The four Advance mutations still relied on render-visible `saving` as their only execution guard. They also read mutable form, selected Advance, allocation and reason state directly when persistence started and then kept the subsequent `load()` reconciliation inside the same `try/catch` boundary.

This allowed two authority failures:

1. a same-tick duplicate Advance command could enter before React propagated `saving`;
2. Server persistence could succeed, but a later workspace refresh failure could be reported through the mutation failure path even though the financial transition had already committed.

## Hardening

- Added synchronous `advanceMutationRef` ownership shared across create/apply/activate/void.
- Snapshot Advance form, supplier id, Advance id, allocation amounts, certified legacy amount and void reason before persistence.
- Reused the observable `load({ reportError: false })` result established in Wave 187.
- Persistence success is announced before reconciliation.
- Refresh failure after persistence is reported as partial success with dedicated event identity.
- Form/selection reset occurs after persistence success and before reconciliation so retries do not accidentally replay a committed command.

## Event authority

Create:
- `supplier-payable:<supplierId>:advance:create:success`
- `supplier-payable:<supplierId>:advance:create:refresh:error`

Apply:
- `supplier-payable:advance:<advanceId>:apply:success`
- `supplier-payable:advance:<advanceId>:apply:refresh:error`

Legacy activation:
- `supplier-payable:advance:<advanceId>:activate:success`
- `supplier-payable:advance:<advanceId>:activate:refresh:error`

Void:
- `supplier-payable:advance:<advanceId>:void:success`
- `supplier-payable:advance:<advanceId>:void:refresh:error`

## Verification contract

Added `tests/supplier-advance-partial-success-authority.contract.test.js` to lock synchronous ownership, immutable snapshots, observable reconciliation and dedicated partial-success events.

## Deferred residuals

The same workspace still has two independent mutation groups that should remain reviewable in later waves:

- payable creation from receipt candidates
- dispute open/resolve and adjustment create/void
