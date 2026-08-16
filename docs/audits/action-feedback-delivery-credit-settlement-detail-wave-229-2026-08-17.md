# Wave 229 — Delivery Credit Settlement detail cross-record authority

Date: 2026-08-17
Branch: `feature/action-feedback-residual-wave-229`
Base: `feature/action-feedback-residual-wave-228`

## Residual found

`DeliveryCreditSettlementDetailPage.jsx` had an effect-local active flag for the initial read, but the page did not maintain an explicit settlement-record authority across route changes and cancellation mutation completion.

Material failure modes:

- Detail A could remain visible while route context moved to Detail B until the new request completed.
- A cancellation started on Settlement A could complete after navigation to Settlement B and write A into B's page state.
- A stale cancellation `finally` could release cancellation UI state belonging to a newer record context.
- Detail load failure was inline-only and did not emit governed ADS feedback.

## Change

- Added `recordContextRef` as the current settlement identity authority.
- Added `loadRequestRef` to sequence detail reads and discard stale success/error results.
- Clears record, error, cancel modal state, reason, action error, and cancellation UI state when the route settlement changes.
- Added `cancelRequestRef` and `ownsCancelRequest()` so cancellation completion can write local state only while the originating settlement remains current.
- If persistence succeeds after the user changed settlement context, the old request does not overwrite the new record and emits a context-changed feedback event.
- Stale cancellation failures and stale `finally` blocks do not write or release the new record's local mutation state.
- Detail read failures now emit entity-scoped ADS feedback.

## Feedback identities

- `customer-money-settlement:detail:<settlementId>:load:error`
- `customer-money-settlement:cancel:<settlementId>:success`
- `customer-money-settlement:cancel:<settlementId>:error`
- `customer-money-settlement:cancel:<settlementId>:context-changed:error`

## Contract

`tests/delivery-credit-settlement-detail-cross-record-authority.contract.test.js`

The contract locks read sequencing, record-context comparison, cancellation request ownership, context-changed feedback, and stale-finally protection.

## Scope

Only the Delivery Credit Settlement detail page plus its contract and audit are changed in Wave 229. Print/Create remain separate checkpoint candidates and are not modified here.
