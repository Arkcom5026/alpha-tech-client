# Wave 225 — Payment printable history read authority

Date: 2026-08-17
Branch: `feature/action-feedback-residual-wave-225`
Base: `feature/action-feedback-residual-wave-224`

## Finding

`loadPrintablePaymentsAction()` owns the canonical `printablePayments`, `printablePaymentsError`, and `isLoadingPrintablePayments` state for payment print history, but previously had no request sequencing.

A slower request for an older filter/search context could therefore:
- replace the latest printable payment list,
- replace the latest error state,
- release loading while a newer request was still active.

This is a material stale-read authority defect because users can rapidly change print-history filters or manually refresh the same view.

## Remediation

Added a module-level `printablePaymentsRequestSequence` and immutable query snapshot per request.

Only the latest request may now mutate canonical printable-history state. Stale success/error/finally paths return observable stale outcomes without writing store state.

The action now returns one of:
- `{ ok: true, stale: false, items }`
- `{ ok: false, stale: false, error }`
- `{ ok: false, stale: true, items/error }`

## Scope

Changed only:
- `src/features/payment/store/paymentStore.js`
- `tests/payment-printable-history-read-authority.contract.test.js`
- this audit document

No payment submission payload, payment persistence authority, receipt rendering, tax logic, or API endpoint was changed.
