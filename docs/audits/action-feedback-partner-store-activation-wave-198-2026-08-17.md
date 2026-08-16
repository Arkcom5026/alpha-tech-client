# Wave 198 — Partner Store Activation token-context authority

Date: 2026-08-17
Branch: `feature/action-feedback-residual-wave-198`
Base: `feature/action-feedback-residual-wave-197`

## Residual found

`PartnerStoreActivationPage.jsx` already had a synchronous submit ref and immutable password/token snapshots, but the async lifecycle was not bound to the current activation-token context.

If the URL token changed while `claimPartnerStoreActivation()` was in flight, the old response could still:

- render the activation-complete state under the new URL context;
- clear the new form state;
- release the shared submitting state for a newer context;
- emit generic success/error feedback with no request ownership.

This is a cross-context async authority defect because activation is a one-time persistence mutation.

## Hardening

- Added `tokenRef` as current activation-context authority.
- Added monotonic `requestRef` sequencing.
- Token changes invalidate prior request ownership and reset activation-local UI state.
- Persistence remains bound to immutable `activationToken` and password snapshots.
- Success/error/finally state writes now require both the original token and request id to still own the page.
- If persistence succeeds after the page moved to another activation token, the old response does not render success into the new context; instead a partial-success context-changed event is emitted.
- Feedback event ids are request-scoped without exposing the secret activation token.
- Render lock uses both React state and the synchronous ref.

## Contract

`tests/partner-store-activation-token-authority.contract.test.js`

The contract locks:

- token authority ref;
- request sequencing;
- immutable activation token snapshot;
- stale-context rejection;
- context-changed partial-success event;
- owner-only finally release;
- synchronous render lock.

## Scope

Only the activation page, one contract test, and this audit are changed. No activation API, provisioning policy, authentication authority, or server behavior is modified.

Local typecheck/build/runtime verification remains pending under the current Git-first workflow.
