# Wave 228 — Delivery Credit Settlement list read authority

Date: 2026-08-17
Branch: `feature/action-feedback-residual-wave-228`
Base: `feature/action-feedback-residual-wave-227`

## Residual found

`DeliveryCreditSettlementListPage.jsx` owns presentation-local canonical financial history state (`rows`, `error`, `loading`) but previously allowed every `listDeliveryCreditSettlements()` response to write state unconditionally.

That created a stale-read race when an initial load and a manual refresh overlapped. An older response could replace newer settlement history, an older error could clear/replace newer data, and an older `finally` could release the loading state of a newer request.

Because the rows represent Customer Money settlement documents and amounts, this is a material financial presentation defect rather than a cosmetic race.

## Authority change

- Added synchronous `loadRequestRef` sequencing.
- Each load receives an immutable request id.
- Success, error, and finally writes are accepted only by the latest owner.
- Stale responses return an observable `{ ok: false, stale: true }` outcome without mutating page state.
- Successful/non-stale failures return observable outcomes for future reconciliation callers.
- Effect cleanup invalidates any in-flight request when the page unmounts.

## Scope

Implementation:
- `src/features/customerMoneySettlement/pages/DeliveryCreditSettlementListPage.jsx`

Contract:
- `tests/delivery-credit-settlement-list-read-authority.contract.test.js`

No settlement mutation or API contract was changed.

## Closure assessment

Wave 228 is justified because the checkpoint found a material stale financial-list defect. Continue one further broad residual checkpoint. Do not create another wave unless a new material defect is demonstrated.
