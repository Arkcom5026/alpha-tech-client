# Action Feedback Standardization Audit — 2026-08-15

## Objective

สำรวจ persistent user actions ที่เปลี่ยนข้อมูลหรือ workflow state และทำให้ outcome feedback เป็นมาตรฐานเดียวกันผ่าน Alpha-Tech Design System (ADS)

## Authority

- Feedback authority: `src/design-system/feedback/feedback.js`
- Error normalization: `src/design-system/feedback/errorPresentation.js`
- Contract: `docs/frontend-architecture/ADS-Action-Feedback-Contract-v1.md`
- Regression gate: `tests/action-feedback-standardization.contract.test.js`

## Standardized in this agenda

### Master data / CRUD

- Unit: create, edit, delete
- Brand: create, edit, activate/deactivate
- Category: create, edit, archive/restore
- Position: create, edit, deactivate/restore
- Product Type: create, edit, archive/restore
- Product: permanent delete
- Bank: activate/deactivate
- Branch Price: bulk price save

### People / governance

- Employee: edit, legacy edit, activate/suspend
- Employee Role Management: role change, activate/suspend
- Supplier: create, edit, delete, legacy update
- Customer: claim unassigned customer into current store

### Operational workflows

- Product Template: upload image, delete image, set cover
- Repair: workflow transition and cancel workflow confirmation behavior
- Stock Audit: mark lost, close as pending, cancel audit session

## Pre-existing feedback coverage confirmed during audit

The following surfaces already use ADS feedback or equivalent project feedback and were intentionally not duplicated:

- Quick Stock product create/edit/delete recovery flow
- Quick Stock receive/commit flow
- Admin user status/role actions
- Admin online-order status actions
- Tax Expense mutation flows
- Customer Deposit mutation flows
- Tax Period Management mutation flows

## Intentional exceptions

### High-frequency scanner events

Per-item barcode/SN scanning in Quick Stock and Stock Audit intentionally continues to use audio and inline scanner feedback rather than a toast for every scan. A toast for every scan would create notification noise and reduce throughput.

Session-level persistent actions such as commit, close, mark lost, or cancel must still use success/error toast feedback.

### Temporary UI-only interactions

No toast is required for actions that do not persist data and already have an immediate visible result, such as:

- remove row from an unsaved cart/draft
- change filter/tab/page
- open/close dialogs
- select a local draft option

## Important fixes found while standardizing feedback

- Server operational error envelope (`response.data.error.message`) is now normalized centrally.
- Product permanent delete now detects `deleteProductAction()` returning `false`; previously the page could continue through the success path after the store had rejected the delete.
- Failed destructive confirmations no longer close as if successful in migrated flows.
- Several legacy create/edit workspaces referenced `shopSlug` without resolving it from route params; affected migrated flows were corrected while preserving their route intent.

## Verification status

GitHub branch changes are source-level only at this stage. GitHub Actions did not automatically run for this feature branch. Per ALPHA-TECH release workflow, the branch must be merged into Local `main` and pass local contract/typecheck/build/test gates before Local `main` may be pushed to `origin/main`.
