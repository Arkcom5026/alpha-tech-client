# Wave 221 — Customer Money Receive detail cross-record authority

Date: 2026-08-17
Branch: `feature/action-feedback-residual-wave-221`
Base: `feature/action-feedback-residual-wave-220`

## Residual found

`CustomerMoneyReceiveDetailPage.jsx` already protected the initial route load with an effect-local `active` flag and used a synchronous cancellation guard, but the cancellation lifecycle still lacked durable ownership of the current receipt id. If the route changed from receipt A to receipt B while cancellation or post-cancel refresh for A was in flight, A could still write cancellation errors, refresh state, or the refreshed record into B's page context. The helper `loadRecord()` also wrote directly without request sequencing.

## Change

- Added `recordContextRef` as the current route-record authority.
- Added `loadRequestRef` so every detail read owns its success/error outcome and stale reads are discarded.
- Replaced the separate initial-load promise lifecycle with the same sequenced `loadRecord()` authority.
- Route changes invalidate both load and cancellation request ownership and reset transient cancellation UI.
- Added `cancelRequestRef` so persistence error, success-side UI, refresh reconciliation, and mutation release only affect the receipt context that started the command.
- Cancellation freezes the receipt id and reason before persistence.
- If cancellation succeeds after the user has moved to another receipt, no stale local state is written; a scoped partial-success/context-changed feedback event is emitted instead.
- Post-cancel refresh now returns an observable outcome so refresh failure is distinguished from stale context.

## Authority model

The current route receipt id plus the latest request id owns detail state. Cancellation persistence may complete for an older receipt, but only the still-current receipt context may receive its local UI reconciliation. A persisted success is never reclassified as a persistence failure merely because the user navigated to another receipt.

## Contract

`tests/customer-money-receive-detail-cross-record-authority.contract.test.js` locks route-record ownership, sequenced detail reads, cancellation ownership, context-changed partial success, and post-persistence refresh reconciliation.

## Scope

Expected changed files only:

1. `src/features/customerMoneyReceive/pages/CustomerMoneyReceiveDetailPage.jsx`
2. `tests/customer-money-receive-detail-cross-record-authority.contract.test.js`
3. `docs/audits/action-feedback-customer-money-receive-detail-wave-221-2026-08-17.md`
