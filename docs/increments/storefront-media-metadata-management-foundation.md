# Storefront Media Metadata & Safe Management Foundation

## Mission

Give merchants a branch-scoped media management view that exposes searchable asset metadata and clearly shows whether an image is used by the current Draft or Published Storefront before any delete authority exists.

## Scope

- Media management panel within Store Experience.
- Search by provider public-id fragment.
- Filter by logo, cover, hero, and promotion purpose.
- Display dimensions, file size, format, created time, provider, and public id.
- Display usage badges: Draft, Published, both, or unused.
- Reuse an existing asset in the corresponding Draft field.
- Loading, empty, error, retry, and bounded pagination states.
- Clearly disable destructive actions in this read-only foundation.
- Preserve Draft versus Published isolation.
- Contract, typecheck, and build gates.

## Out of scope

- No delete/destroy action.
- No bulk actions.
- No folders, tags, crop, resize, transformations, or BYOS UI.
- No client-supplied `branchId`.

## Safety invariants

1. UI must render only assets returned by the authenticated branch-scoped Server authority.
2. Published usage must be visually distinct from Draft-only usage.
3. The UI must never describe an in-use asset as safe to delete.
4. Selection updates Draft only until explicit publish.

## Paired server work

Server branch: `feature/storefront-media-metadata-management-foundation`
Server Issue #317 — Storage Provider Abstraction Foundation.

## Integration authority

Assistant pushes feature branches only. The user performs local two-repository verification, merges into local `main`, verifies again, and pushes `main`.
