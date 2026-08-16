# Action Feedback Audit — Wave 187

Date: 2026-08-16
Branch: `feature/action-feedback-residual-wave-187`
Owner: `src/features/supplierPayable/pages/SupplierPayableWorkspacePage.jsx`

## Scope

Wave 187 narrows the Supplier Payable residual to the financial settlement lifecycle only:

- create Supplier settlement / payment allocation
- void Supplier settlement / reversal
- post-success workspace reconciliation

Supplier Advance, payable creation, dispute and adjustment mutations remain separate residual candidates for later waves.

## Residual found

The settlement create and void flows used React `saving` as the only interaction guard and kept persistence plus `load()` reconciliation inside the same `try/catch` boundary.

This created two authority risks:

1. Same-tick duplicate commands could enter before render-visible `saving` propagated.
2. If Server persistence succeeded but the subsequent workspace refresh failed, the catch path could report the financial mutation as failed even though the settlement or reversal had already committed.

The commands also read mutable payment allocations/form data directly when persistence started instead of binding the transaction to an immutable snapshot.

## Hardening

- Added synchronous `settlementMutationRef` ownership shared by settlement create and reversal.
- `load()` now returns observable `{ ok, error }` results while preserving existing read-error feedback by default.
- Settlement creation snapshots supplier id, payment form, payable ids and allocation amounts before persistence.
- Settlement reversal snapshots settlement id and reversal reason before persistence.
- Persistence success is announced before reconciliation.
- Refresh failure after persistence uses dedicated partial-success events rather than persistence failure events.
- Manual workspace refresh is disabled while a financial mutation owns the boundary.

### Event authority

Create success:
` supplier-payable:<supplierId>:settlement:create:success `

Create refresh failure:
` supplier-payable:<supplierId>:settlement:create:refresh:error `

Void success:
` supplier-payable:settlement:<paymentId>:void:success `

Void refresh failure:
` supplier-payable:settlement:<paymentId>:void:refresh:error `

## Verification contract

Added:
`tests/supplier-payable-settlement-partial-success-authority.contract.test.js`

The contract locks synchronous settlement ownership, observable refresh results, immutable command snapshots, partial-success event boundaries and refresh interaction locking.

## Deferred residuals

The same workspace still contains separate mutation groups for:

- payable creation from receipts
- Supplier Advance create/apply/activate/void
- dispute open/resolve
- adjustment create/void

These are intentionally not broadened into Wave 187 so the financial settlement change remains reviewable and independently verifiable.
