# Action Feedback Audit — Wave 190

Date: 2026-08-16
Branch: `feature/action-feedback-residual-wave-190`
Owner: `src/features/settings/pages/PartnerProfilePage.jsx`

## Scope

Wave 190 audits Partner Profile async authority when the tenant/shop slug changes while a save request is still in flight.

## Residual found

The page already had a synchronous `savingRef`, immutable save payload and guarded load cleanup. However, save ownership itself was not bound to the current `shopSlug` context.

If a save for Shop A was still in flight and navigation switched the same mounted page to Shop B, the old request could later release the shared saving state or emit generic save feedback without identifying which tenant actually owned the persistence outcome. The shared `savingRef` could also unnecessarily block the new tenant context until the old request completed.

## Hardening

- Added `shopSlugRef` as current tenant authority.
- Added `saveRequestRef` as save request sequencing authority.
- Slug changes invalidate the previous save UI ownership and release the new tenant workspace from the old request lock.
- Save commands snapshot `shopSlug` before persistence.
- Success and error event keys are tenant-scoped.
- An old request may still report its persistence result, but its `finally` block may not clear saving state belonging to a newer tenant/request.
- Load error events are now tenant-scoped as well.

## Event authority

Load failure:

`partner-profile:<shopSlug>:load:error`

Save success:

`partner-profile:<shopSlug>:save:success`

Save failure:

`partner-profile:<shopSlug>:save:error`

## Verification contract

Added:

`tests/partner-profile-cross-slug-authority.contract.test.js`

The contract locks current-slug authority, request sequencing, immutable slug snapshots, context-aware finalization and tenant-scoped feedback identity.

## Residual continuation

Supplier Payable dispute/adjustment remains a confirmed residual candidate from Wave 189, but it is intentionally deferred to a dedicated wave because it is a larger financial mutation group. The residual scan should continue from Wave 190 and return to that group with a narrow reviewable change set.
