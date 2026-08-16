# Wave 222 — Customer Money Receipt print cross-record authority

Date: 2026-08-17
Branch: `feature/action-feedback-residual-wave-222`
Base: `feature/action-feedback-residual-wave-221`

## Residual found

`CustomerMoneyReceiptPrintPage.jsx` still kept receipt data and the one-shot auto-print flag across route changes. When the same component instance moved from Receipt A to Receipt B, the old receipt could remain rendered until B finished loading, and `autoPrinted.current` could remain true so an auto-print request for B was silently skipped. The load path also exposed only inline error text rather than governed feedback identity.

## Change

- Added `recordContextRef` and `loadRequestRef` so the current receipt id owns print-page read state.
- Receipt context changes clear the previous record/error immediately before the next read.
- Stale success/error completions are discarded and cleanup invalidates the request owner.
- `autoPrinted.current` is re-armed for each receipt context.
- Auto-print verifies that the loaded record id still matches the route id before calling `window.print()`.
- Query-selected print mode is synchronized when the print route context changes.
- Load failure now emits entity-scoped ADS feedback: `customer-money-receive:print:<recordId>:load:error`.

## Authority model

The current receipt route owns the visible print record, read error, print mode initialization, and one-shot auto-print lifecycle. A previous receipt request cannot render or trigger printing after ownership has moved to another receipt.

## Contract

`tests/customer-money-receipt-print-cross-record-authority.contract.test.js` locks request sequencing, route-id ownership, context reset, auto-print re-arming, stale completion suppression, and entity-scoped load feedback.

## Scope

Expected changed files only:

1. `src/features/customerMoneyReceive/pages/CustomerMoneyReceiptPrintPage.jsx`
2. `tests/customer-money-receipt-print-cross-record-authority.contract.test.js`
3. `docs/audits/action-feedback-customer-money-receive-print-wave-222-2026-08-17.md`
