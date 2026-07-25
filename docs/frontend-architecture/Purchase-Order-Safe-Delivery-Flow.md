# Purchase Order Safe Delivery Flow

## Authority

All Purchase Order frontend architecture work after the current stabilization baseline must use the following delivery flow:

```text
Feature Branch
→ Draft Pull Request
→ Scope / Diff / CI Review
→ Runtime or Online Verification
→ Ready for Review
→ Merge Commit into main
→ Production Verification
→ Revert Merge Commit if required
```

## Active Branch

```text
refactor/purchase-order-reference-module
```

This branch was created from the current `main` baseline after the initial Purchase Order ownership extraction commits had already landed directly on `main`.

Those earlier commits are treated as the stabilization baseline. Their history must not be rewritten or force-reset because unrelated work is interleaved on `main`.

## Mandatory Rules

1. Do not create, update, or delete development files on the default branch.
2. Every GitHub file mutation must explicitly name the active feature branch.
3. Keep the pull request in Draft while implementation or verification is incomplete.
4. Review changed-file scope before merging.
5. Preserve public routes, API contracts, permissions, and business behavior unless an approved slice explicitly changes them.
6. Use merge commits so each delivery slice has a single rollback authority.
7. Production or online behavior is the Operational Gate when local server access is unavailable.
8. If production verification fails, revert the merge commit instead of patching directly on `main`.

## Gates

### Repository Gate

- ownership is explicit
- changed paths match the approved slice
- imports and public exports are coherent
- no unrelated module changes
- PR diff reviewed

### Runtime Gate

- lint/build/test or available CI checks pass
- no import or bundle regression

### Operational Gate

- list, create, edit, detail, print, and receive handoff continue to behave correctly online
- failures are documented before merge or trigger a merge-commit revert after deployment

## Current Status

```text
Stabilization baseline on main          ACCEPTED AS-IS
Safe feature branch                     ACTIVE
Draft PR                                OPEN
Future direct writes to main            PROHIBITED
Runtime / online certification          PENDING
```
