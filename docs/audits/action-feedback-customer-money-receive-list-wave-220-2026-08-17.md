# Wave 220 — Customer Money Receive list read authority

Date: 2026-08-17
Branch: `feature/action-feedback-residual-wave-220`
Base: `feature/action-feedback-residual-wave-219`

## Residual found

`CustomerMoneyReceiveListPage.jsx` still owned a second asynchronous list lifecycle that wrote `rows`, `error`, and `loading` without request sequencing. Rapid applied-filter changes or a manual refresh could allow an older response to replace newer list results or release the loading state for a newer request.

## Change

- Added local `loadRequestRef` sequencing for Customer Money Receive list loads.
- Each request freezes an immutable `filterSnapshot` before calling the list API.
- Stale success and stale error outcomes are discarded.
- Stale `finally` cannot release `loading` owned by a newer request.
- The effect cleanup invalidates the previous list request when the applied-filter context changes or the page unmounts.
- `loadRows()` now returns an observable `{ ok, stale, rows/error }` outcome for future reconciliation callers while preserving the existing UI behavior.

## Authority model

The newest applied-filter/manual-refresh request owns the rendered Customer Money Receive list, list error, and read-side loading release. Older responses cannot overwrite the active list context.

## Contract

`tests/customer-money-receive-list-read-authority.contract.test.js` locks request sequencing, immutable filter intent, stale outcome suppression, and cleanup invalidation.

## Scope

Expected changed files only:

1. `src/features/customerMoneyReceive/pages/CustomerMoneyReceiveListPage.jsx`
2. `tests/customer-money-receive-list-read-authority.contract.test.js`
3. `docs/audits/action-feedback-customer-money-receive-list-wave-220-2026-08-17.md`
