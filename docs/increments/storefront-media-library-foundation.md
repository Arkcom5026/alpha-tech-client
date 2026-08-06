# Storefront Media Library Foundation

## Mission

Allow a merchant to browse and reuse storefront images already uploaded for the current store instead of uploading duplicate files.

## Scope

- Media Library picker within the Store Experience editor
- List branch-scoped assets through the paired Server authority
- Filter by logo, cover, hero, and promotion purpose
- Select an existing asset and bind its `secureUrl` to the relevant draft field
- Keep the existing upload-new action available
- Loading, empty, provider-error, and retry states
- Preserve Draft versus Published isolation
- Contract test, typecheck, and build gates

## Non-goals

- No delete action
- No cross-store browsing
- No folder management, tags, search indexing, crop, resize, watermark, AI processing, recycle bin, or version history
- No provider credential UI
- No BYOS implementation in this increment

## Authority

- Client never sends `branchId`
- Client consumes normalized media assets only
- Selection changes Draft content only until the merchant publishes
- Public Storefront continues to consume Published Snapshot only

## Paired server work

The Server increment lists only Cloudinary image resources beneath the authenticated branch prefix and normalizes provider pagination and errors.

## Workflow

Assistant changes feature branches only. The user performs local two-repository verification, merges into local `main`, verifies again, and pushes `main`.