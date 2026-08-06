# Online Store Live Draft Editing

## Mission

Allow a merchant whose storefront is already live to continue editing store identity, brand content, hero content, promotion content, and section visibility without taking the public storefront offline.

## Root Cause

`StoreHomepageEditorPage` treated `draft.status === 'PUBLISHED'` as a read-only state:

- all merchant inputs and section controls were disabled;
- the save and publish actions were hidden;
- only the unpublish action remained available;
- the existing save path forced `storefrontEnabled` to `false`.

This contradicted the backend published-snapshot architecture, where editable draft fields may change while the public storefront continues reading the last published snapshot.

## Architecture Contract

- A LIVE storefront remains editable.
- Saving changes updates draft-era fields only.
- Saving a LIVE draft preserves `storefrontEnabled`.
- The public storefront continues serving the current published snapshot.
- The merchant explicitly selects **เผยแพร่การเปลี่ยนแปลง** to replace the public snapshot.
- Unpublish remains a separate explicit action.
- Platform theme and layout authority remain locked.

## Scope

- Remove LIVE-state disabling from merchant-editable fields.
- Keep Save Draft available in both DRAFT and LIVE states.
- Keep Publish available in both states, with a republish label for LIVE stores.
- Preserve public availability when saving a LIVE draft.
- Explain published-snapshot isolation in the UI.
- Extend the existing brand-content contract gate.

## Out of Scope

- Database or Prisma changes
- Media upload infrastructure
- Theme-token editing
- Drag-and-drop section ordering
- ALDE certification

## Verification

```powershell
npm run test:online-store-brand-content-studio
npm run typecheck
npm run build
```

## Runtime Acceptance

1. Open a storefront whose status is LIVE.
2. Confirm merchant content fields and section controls are editable.
3. Change the Hero headline and save the draft.
4. Confirm the public storefront remains available and still shows the previous published headline.
5. Select **เผยแพร่การเปลี่ยนแปลง**.
6. Confirm the public storefront shows the new headline.
