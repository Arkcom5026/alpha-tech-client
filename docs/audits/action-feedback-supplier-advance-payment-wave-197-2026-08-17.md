# Wave 197 — Supplier Advance Payment cross-supplier authority

Date: 2026-08-17

## Scope

Owner: `src/features/supplierPayment/components/SupplierAdvancePaymentForm.jsx`

The residual audit found that advance-payment history and post-create UI ownership were not fully bound to the active Supplier identity.

## Residual defect

`fetchAdvancePaymentsBySupplierAction()` already stores keyed history in `advancePaymentsBySupplier`, but the form rendered the generic `advancePayments` list. When Supplier context changed while an older history request was still in flight, the generic list could be replaced by the older response and displayed under the new Supplier.

The create flow also snapshotted `supplier.id` for persistence but always wrote `successPayload` after the request completed. If the component remained mounted while Supplier context changed, the completed payment for Supplier A could therefore render the success view while the workspace was already showing Supplier B.

Feedback event keys were generic and did not identify the Supplier that owned the outcome.

## Change

- Render advance-payment history from `advancePaymentsBySupplier[supplierId]` instead of the generic compatibility list.
- Add `supplierIdRef` as current Supplier authority.
- Add `historyRequestRef` to sequence history loads and suppress stale-context error feedback.
- Snapshot Supplier identity for persistence and bind create/refresh feedback to that identity.
- After persistence succeeds, refuse to write the previous Supplier's success payload into a new Supplier context.
- Emit explicit partial-success feedback when Supplier context changes after persistence.

## Evidence keys

- `supplier-payment:advance:<supplierId>:history:error`
- `supplier-payment:advance:<supplierId>:create:success`
- `supplier-payment:advance:<supplierId>:create:error`
- `supplier-payment:advance:<supplierId>:history-after-create:error`
- `supplier-payment:advance:<supplierId>:context-changed-after-create:error`

## Contract

`tests/supplier-advance-payment-cross-supplier-authority.contract.test.js`

The contract locks supplier-scoped history selection, current-Supplier authority, request sequencing, stale-context suppression, and supplier-scoped mutation/reconciliation event identity.

## Verification boundary

Git-side structural verification is complete. Local runtime/typecheck/build verification remains pending under the current Git-first workflow.
