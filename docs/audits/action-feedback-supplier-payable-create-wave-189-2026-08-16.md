# Action Feedback Audit — Wave 189

Date: 2026-08-16
Branch: `feature/action-feedback-residual-wave-189`
Owner: `src/features/supplierPayable/pages/SupplierPayableWorkspacePage.jsx`

## Scope

Wave 189 isolates payable creation from receipt candidates:

- select one or more receipt candidates for a single Supplier
- create the payable from the selected receipts
- reconcile the Supplier Payable workspace after persistence

Supplier settlement and Supplier Advance were hardened in Waves 187–188. Dispute and adjustment mutations remain separate residual candidates.

## Residual found

The payable-create flow still relied on render-visible `saving` as its only duplicate-submit guard, read live receipt/form state when persistence began, and kept the persistence call plus `load()` reconciliation inside the same `try/catch` boundary.

This left three authority risks:

1. A same-tick duplicate create command could enter before React propagated `saving`.
2. Receipt selection or form values could change while the request was in flight, even though the persisted command should represent one immutable intent.
3. If payable creation succeeded but the workspace refresh failed, the catch path could make the user believe payable creation failed even though Server persistence had already committed.

## Hardening

- Added synchronous `payableMutationRef` ownership.
- Snapshotted Supplier id, receipt ids and payable form before persistence.
- Bound the API payload and feedback identity to those snapshots.
- Announced persistence success before post-success reconciliation.
- Reused observable `load({ reportError: false })` from Wave 187.
- Added dedicated partial-success feedback when reconciliation fails.
- Disabled receipt candidate selection and payable form editing while any workspace financial mutation is active.
- Existing manual refresh remains locked by `saving` during mutation ownership.

## Event authority

Create success:

`supplier-payable:<supplierId>:payable:create:success`

Create persistence failure:

`supplier-payable:<supplierId>:payable:create:error`

Create succeeded but refresh failed:

`supplier-payable:<supplierId>:payable:create:refresh:error`

## Verification contract

Added:

`tests/supplier-payable-create-partial-success-authority.contract.test.js`

The contract locks synchronous ownership, immutable snapshots, observable reconciliation, partial-success event separation and create-form interaction locking.

## Deferred residual

The same workspace still contains dispute and adjustment lifecycle mutations:

- open dispute
- resolve dispute, optionally with an adjustment
- create direct credit/debit adjustment
- void adjustment

These remain the strongest local candidate for Wave 190.
