# Wave 203 — Auth employee login cross-slug authority

## Scope

Audited `src/features/auth/components/RegisterCustomerForm.jsx` after Wave 202.

## Residual found

The login form already surfaced ADS success/error feedback, but the command lifecycle still relied on React `submitting` state and live route/form context:

- same-tick duplicate submit remained possible before React committed `submitting=true`;
- credentials were passed from live form state rather than an explicit immutable command snapshot;
- successful login navigated using the current route helper without proving the route still matched the context that initiated the login;
- an older request could release submitting state after the route changed.

This matters because authentication can succeed independently from navigation. A stale completion must not redirect a user into the shop slug that owned an earlier request.

## Change

- added synchronous `submittingRef` mutation authority;
- added `shopSlugRef` current-route authority;
- added `loginRequestRef` sequencing authority;
- snapshot credentials and target slug before persistence;
- invalidate old request ownership when shop slug changes;
- bind success/error events to the initiating slug;
- suppress stale error/finally state writes;
- stop stale post-login navigation and surface explicit partial-success/context-changed feedback;
- freeze form and register navigation while login ownership is active.

## Feedback identities

- `auth-employee-login:<slug>:success`
- `auth-employee-login:<slug>:error`
- `auth-employee-login:<slug>:context-changed:error`

## Contract

`tests/auth-employee-login-cross-slug-authority.contract.test.js`

The contract locks synchronous ownership, route/request sequencing, immutable credentials, scoped event identity, and render-visible interaction locking.

## Out of scope

No authentication API semantics, token storage, employee authorization policy, or backend changes were made.
