# Wave 204 — Employee Registration cross-slug authority audit

Date: 2026-08-17
Branch: `feature/action-feedback-residual-wave-204`
Base: `feature/action-feedback-residual-wave-203`

## Scope

Audited `src/features/auth/components/RegisterEmployeeForm.jsx` only for action-feedback, duplicate mutation protection, immutable command intent, and route-context ownership during employee registration.

## Residual defect

The form already exposed ADS success/error feedback, but mutation ownership still depended on React `submitting` state. A same-tick second submit could therefore enter before the next render. The registration command also read the live form directly and redirected using the route slug available after the request completed.

If the route changed from Shop A to Shop B while employee registration for A was still in flight, the response from A could navigate the user to A's login screen from B's context. The old request's `finally` could also release submitting state belonging to the newer route context.

## Changes

- Added synchronous `submittingRef` guard.
- Added `shopSlugRef` as current route authority.
- Added `registerRequestRef` for request sequencing and stale-response invalidation.
- Snapshot name, normalized email, password, branch id, and target slug before persistence.
- Freeze all registration inputs while the synchronous mutation owner is active.
- Invalidate old request ownership and reset local draft when the shop slug changes.
- Only success/error/finally state writes are allowed while the original request still owns the current slug.
- After successful persistence, suppress stale navigation when route context has changed and emit a partial-success/context event instead.
- Scope ADS events by target store slug.

## Event authority

- `auth-employee-register:<slug>:success`
- `auth-employee-register:<slug>:error`
- `auth-employee-register:<slug>:context-changed:error`

The event key intentionally does not contain employee email or password.

## Contract

`tests/auth-employee-register-cross-slug-authority.contract.test.js`

The contract locks synchronous mutation ownership, route/request sequencing, immutable command snapshots, context validation, entity-scoped ADS events, and render-visible interaction locking.

## Result

Wave 204 closes the cross-store registration navigation/state race without expanding scope outside the employee registration form.
