# Action Feedback Residual Hardening — Wave 3

Date: 2026-08-15
Baseline: `main` at `2b4460bda664c8d20a0d6018ddb1f43e538ffe1d`
Branch: `feature/action-feedback-residual-hardening-wave-3`

## Purpose

Close persistent-action feedback gaps that remained after Wave 2 because the prior automatic discovery primarily detected direct `apiClient` / `axios` mutations and could miss UI owners that mutate through stores or feature API abstractions.

## Confirmed residual gaps

### Product Edit

`src/features/product/pages/EditProductPage.jsx`

The previously prepared Product Edit feedback fix had never entered the `main` merge chain. Wave 3 restores:

- action success feedback after a successful product update,
- action error feedback for save failures,
- duplicate-submit protection while updating,
- separation between fatal page-load error state and recoverable save errors.

### Merchant Product Reservation lifecycle

`src/features/productReservation/merchant/pages/ProductReservationDetailPage.jsx`

- Adds action success/error feedback for ACCEPT/CANCEL lifecycle commands.
- Retains the existing inline status message.
- Retains idempotency-key protection.
- Adds an owner-level duplicate-command guard.

### Combined Billing document creation

`src/features/combinedBilling/pages/CombinedBillingPage.jsx`

- Adds action success/error feedback for consolidated document creation.
- Adds an owner-level guard against duplicate/invalid confirmation calls.
- Preserves the existing inline result and downstream print controls.

### Admin Branch lifecycle

`src/features/admin/components/FormBranch.jsx`

- Adds action feedback for branch creation and deletion.
- Adds duplicate-submit guards.
- Adds `ConfirmActionDialog` before destructive branch deletion.
- Preserves existing inline result messaging and Branch/Auth authority.

Note: this legacy file used CRLF line endings; GitHub Contents API normalization may make the textual diff appear larger than the behavioral change.

## Contract hardening

`tests/action-feedback-standardization.contract.test.js`

Wave 3 adds Product Edit, Product Reservation lifecycle, Combined Billing, and Admin Branch lifecycle as explicit action owners, and locks:

- Product Edit visible save feedback and non-fatal save failure handling,
- reservation idempotency and duplicate-command protection,
- Combined Billing confirmation guard,
- Admin Branch destructive confirmation and duplicate-submit protection.

## Intentionally not changed

- Stripe checkout already has loading protection and user-visible feedback; no payment-flow rewrite was warranted.
- Forgot-password and registration flows use persistent inline success/error states appropriate to their workflows.
- No direct `window.alert` usage was found during the residual search.

## Verification required after Local merge

1. `node tests/action-feedback-standardization.contract.test.js`
2. `npm run typecheck`
3. `npm run build`
4. `npm run test:run` / `npm run verify`
5. Manual smoke: Product Edit successful save must show `บันทึกการแก้ไขสินค้าเรียบร้อยแล้ว`.
6. Manual smoke: Admin Branch delete must show confirmation before the destructive request.
