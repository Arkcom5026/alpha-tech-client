# Wave 196 — Supplier Receipt Payment receipt-search authority

## Scope
- `src/features/supplierPayment/components/SupplierReceiptPaymentForm.jsx`
- receipt-ready-to-pay discovery used by Supplier receipt-based payment

## Residual defect
The form destructured `loadReceiptsReadyToPayAction`, `receiptsReadyToPay`, and `isLoading` from `usePurchaseOrderReceiptStore`, but the current store exposes neither `loadReceiptsReadyToPayAction` nor an `isLoading` field. The API authority `getReceiptsReadyToPay()` exists, so the UI search path could fail before a request was started.

The form also had no request sequencing for supplier/date searches. A slow response for an older supplier/search could overwrite a newer search context.

## Hardening
- Bind receipt-ready-to-pay discovery directly to `getReceiptsReadyToPay()`.
- Keep receipt search state local to the payment form because the list is command-preparation state for this form.
- Add `supplierIdRef` and `receiptSearchRequestRef` authority.
- Snapshot supplier/date/limit before request.
- Reject stale responses when supplier context or request ownership changes.
- Keep `submittingRef` as the mutation boundary and prevent search while payment persistence is in flight.
- Use supplier-scoped feedback identity for receipt-search errors and payment persistence outcomes.

## Expected behavior
- Receipt search is executable against the existing API authority.
- Older async responses cannot replace the current supplier/search list.
- Search failures remain visible without contaminating payment persistence feedback.
- Supplier context changes invalidate old searches and clear command-preparation state.
- Payment persistence semantics remain isolated from search/read failures.

## Verification pending
Local contract/typecheck/build/runtime verification remains pending until the Git branch is pulled into the local verification workflow.
