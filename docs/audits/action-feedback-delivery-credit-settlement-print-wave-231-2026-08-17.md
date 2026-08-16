# Wave 231 — Delivery Credit Settlement Print Cross-record Authority

Date: 2026-08-17
Branch: `feature/action-feedback-residual-wave-231`
Base: `feature/action-feedback-residual-wave-230`

## Residual found

`DeliveryCreditSettlementPrintPage.jsx` used an effect-local `active` flag for its async document read, but retained the previous `record` and `error` while the route id changed. The read also had no explicit record/request identity shared by the print page lifecycle.

This left a material cross-record presentation risk: while navigating from Settlement A to Settlement B in the same mounted route, A could remain visible until B finished loading. The lifecycle also had no governed feedback event for print-document load failure.

## Authority added

- Added `recordContextRef` as the current settlement identity authority.
- Added `loadRequestRef` as the sequenced read owner.
- Snapshot the route id as `settlementIdSnapshot` before the async request.
- Clear previous `record` and `error` immediately when the route context changes.
- Permit success/error state writes only while both request id and settlement context still match.
- Invalidate ownership during effect cleanup/unmount.
- Added entity-scoped ADS failure feedback:
  - `customer-money-settlement:print:<settlementId>:load:error`

## Scope discipline

No print layout, amount calculation, cancellation semantics, settlement persistence, or routing structure was changed. The wave is limited to print-page async ownership and feedback.

## Contract

`tests/delivery-credit-settlement-print-cross-record-authority.contract.test.js`

The contract locks request sequencing, record-context identity, stale-response guards, route-change state reset, cleanup invalidation, and governed load-error feedback.

## Closure signal

With Waves 228–231, the Delivery Credit Settlement surface has now been audited and hardened across List, Detail, Create, and Print. The next step should be a broad closure checkpoint rather than creating another wave automatically. If that checkpoint finds no material residual, the Action Feedback / Notification Standardization agenda is ready for formal closure.
