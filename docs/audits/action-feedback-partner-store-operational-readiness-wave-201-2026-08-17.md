# Action Feedback Residual Audit — Wave 201

Date: 2026-08-17

## Scope

Partner Store Operational Readiness certification page only.

Target:

- `src/features/partnerStoreApplication/pages/PartnerStoreOperationalReadinessPage.jsx`

## Residual defect confirmed

The readiness page already had a synchronous `submittingRef` for certification, but its read authority was not bound to the current `shopSlug` route context.

The initial readiness request ran only once on mount. If the same page instance moved to another partner-store slug, the old request could still write its result into the new route context. The certification path also navigated after persistence success without verifying that the route still belonged to the same store context that initiated the command.

## Hardening applied

1. Added `shopSlugRef` as the current route-context authority.
2. Added `loadRequestRef` to sequence readiness reads.
3. `load()` now snapshots the route slug and rejects stale results before any state write.
4. `load()` returns an observable `{ ok, data/error, stale }` outcome.
5. Readiness reload now follows `shopSlug` changes instead of mount-only behavior.
6. Certification snapshots both route slug and canonical destination slug before persistence.
7. After successful certification, navigation occurs only if the route still matches the command owner.
8. If the route changed after persistence success, the page emits a partial-success feedback event instead of navigating the user from the new store context.
9. Render-visible locking now uses `submitting || submittingRef.current`.

## Feedback authority

Success:

- `partner-store:operational-readiness:<slug>:certify:success`

Persistence failure:

- `partner-store:operational-readiness:<slug>:certify:error`

Persistence succeeded but route context changed:

- `partner-store:operational-readiness:<slug>:certify:context-changed:error`

## Contract

Added:

- `tests/partner-store-operational-readiness-cross-slug-authority.contract.test.js`

The contract locks the route authority ref, request sequencing, stale-result discard, certification route snapshot, context-changed partial-success event, and synchronous mutation-visible lock.

## Scope discipline

No API contract, server mutation, provisioning rule, or readiness assessment rule was changed. This wave only hardens async ownership and action feedback semantics on the existing page.
