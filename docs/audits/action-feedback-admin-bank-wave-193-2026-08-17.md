# Action Feedback Audit — Wave 193

Date: 2026-08-17
Branch: `feature/action-feedback-residual-wave-193`
Owners:
- `src/features/admin/components/FormBank.jsx`
- `src/store/bankStore.js`

## Scope

Wave 193 audits Admin Bank create/delete feedback reconciliation after Server persistence.

## Residual found

`FormBank.jsx` already separated create/delete persistence success from refresh failure using nested `try/catch` blocks. However, `useBankStore.fetchBanks()` swallowed GET failures internally and resolved normally.

That meant the nested refresh `catch` blocks were not observable in practice: create/delete could persist successfully, the list refresh could fail, and the UI would show only success while leaving a stale bank list.

## Hardening

- `fetchBanks()` now returns an observable outcome:
  - `{ ok: true, data }` on success
  - `{ ok: false, error }` on failure
- Store refresh still does not reject, preserving safe fire-and-forget initial loading behavior.
- Store error state is cleared at refresh start and after a successful refresh.
- `FormBank` now inspects the returned refresh outcome after create and delete persistence.
- Partial-success feedback remains distinct from persistence failure:
  - create persisted but refresh failed
  - delete persisted but refresh failed
- Initial effect wraps the store call with `Promise.resolve(...).catch(() => {})` as an additional boundary.

## Event authority

Create persisted but refresh failed:

`admin-bank:create:<bankIdOrName>:refresh:error`

Delete persisted but refresh failed:

`admin-bank:<bankId>:delete:refresh:error`

These remain separate from create/delete persistence error events.

## Verification contract

Added:

`tests/admin-bank-refresh-outcome-authority.contract.test.js`

The contract locks observable store outcomes and explicit partial-success handling in the page owner.

## Result

The Admin Bank flow now exposes refresh failures to the mutation owner instead of silently swallowing them, so a successful Server mutation cannot masquerade as a fully reconciled UI state.
