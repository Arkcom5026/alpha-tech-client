# UX-OPERATIONAL-FIRST-REVIEW-001

PASS / NEEDS_DECISION: NEEDS_DECISION

## Current UX assessment

Displaying both an Operational Product and its corresponding Template for the same logical product increases operator decision load. Operators performing stock intake generally seek the receive-ready runtime object rather than catalog provenance. When two visually similar entries coexist, users must interpret system semantics instead of completing the operational task.

## Operational-first assessment

An Operational-first discovery model is consistent with the existing Mission B principle that the Operational Product is the branch runtime source of truth. If an Operational Product already exists and is valid for the current branch, surfacing it as the primary discoverable item aligns the UI with runtime responsibility. Template remains valuable as a catalog/search/clone source, but its operational importance decreases once a branch runtime object exists.

## Benefits

- Reduces duplicate choices.
- Reinforces Operational Product as runtime truth.
- Lowers cognitive load during receiving.
- Makes the receive path more predictable.
- Better matches Mission B Product Discovery intent.

## Risks and edge cases

- Users may lose awareness that a Template relationship exists.
- Branches with multiple Operational Products derived from one Template require clear governance.
- Migration must preserve discoverability where no Operational Product exists.
- Historical workflows that relied on visible Template entries may require updated guidance.
- Audit and support tools may still need Template visibility outside the primary operator flow.

## Migration considerations

A doctrine change should preserve Template as a catalog asset while clarifying that runtime discovery is centered on Operational Products whenever they already exist. Discovery behavior, documentation, audits, and acceptance criteria would need to remain internally consistent.

## Recommendation

FE-02 recommends ROLE-ARCH evaluate an explicit Operational-first Discovery Doctrine. The recommendation is architectural rather than implementation-specific:

- Operational Product should remain the preferred runtime discovery result.
- Template should continue to exist as catalog/search/clone source.
- UX should minimize unnecessary operator decisions while preserving governance.

Whether Template should be completely hidden in every circumstance requires architectural policy beyond UX alone and should therefore be decided by ROLE-ARCH.

## Next recommended owner

ROLE-ARCH
