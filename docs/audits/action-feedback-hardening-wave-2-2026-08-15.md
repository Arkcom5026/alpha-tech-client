# Action Feedback Hardening — Wave 2 Audit

Date: 2026-08-15
Repository: `Arkcom5026/alpha-tech-client`
Branch: `feature/action-feedback-hardening-wave-2`
Baseline: `6fb518d9dcab586797743c25f4e77a0d0c436c7c`

## Purpose

Close persistent-action feedback gaps that were outside the original curated audit and harden the contract so future direct UI mutations cannot silently bypass user feedback.

## Wave A — Critical / High-impact owners

### Product Profile

- Restored `ListProductProfilePage.jsx` as an actual list workspace. The baseline file incorrectly duplicated the edit page implementation.
- Create and edit now emit ADS `actionSuccess` before navigation and `actionError` on mutation failure.
- Edit and delete respect submitting state.
- Delete requires `ConfirmActionDialog` and keeps the dialog open when the mutation fails.

### Sales Tax Filing

- Prepare and submit now emit standardized action success/error feedback.
- Final filing submission requires explicit confirmation.
- Busy state prevents duplicate submission.

### Partner Store Application Review

- Start review, approve, reject, provision, activation invitation, and activation-link copy now expose user-facing success/error feedback.
- Approve, reject, and provision require explicit confirmation.
- Existing per-application acting lock is retained.
- Confirmation remains open after failed high-impact actions.

### Supplier Payments

- Advance payment and receipt-based payment now have explicit in-flight submit locks.
- Form controls are disabled while committing the payment.
- Successful financial mutations emit action success feedback; failures emit action error feedback while retaining inline error details.
- Existing success panels are retained.

## Wave B — Settings / Operational owners

### Printer Settings

- Save, test, clear, route configuration, route disable, printer profile creation, device assignment, and local-printer registration now use ADS action feedback.
- Clearing a preference and disabling a route require confirmation.
- Server error envelope normalization includes `response.data.error.message`.

### Tax Issuer Profile

- Load/save failures are user-visible through ADS feedback.
- Save success uses action feedback.
- Existing inline feedback remains and save is duplicate-protected.

### Partner Profile

- Load failures are no longer console-only.
- Save uses ADS action success/error feedback.
- Save is protected from duplicate submission.

## Wave C — Existing-feedback compatibility

### Product Create

- Existing processing dialog, success card, form validation, and save lock remain authoritative UI state.
- Persistent create success/failure additionally emit ADS action feedback.
- Validation-only failures remain inline and do not generate toast noise.

### Input Tax Filing

- Audited as already covered: all persistent mutations use ADS feedback and the workspace has a shared `submitting` guard.
- No high-value behavioral gap justified a large source rewrite solely to rename generic `feedback.success/error` calls.

### Supplier Payable

- Audited as already covered: persistent settlement, void, advance, dispute, adjustment, and payable actions already use the ADS feedback authority and shared saving state.
- Generic helper naming is retained in this wave to avoid a high-diff rewrite without a user-visible reliability gain.

## Wave D — Contract Hardening

`tests/action-feedback-standardization.contract.test.js` now:

1. Includes Wave 2 action owners in the curated critical-owner matrix.
2. Locks the Product Profile list structural regression.
3. Locks financial duplicate-submit guards.
4. Requires confirmation boundaries for Sales Tax Filing and Partner Store governance.
5. Automatically scans UI owner files for direct `apiClient`/`axios` `POST`, `PUT`, `PATCH`, and `DELETE` mutations and requires both success and error feedback.
6. Allows an explicit `ACTION_FEEDBACK_EXEMPT` marker only for intentionally exempt direct UI mutations.
7. Continues to reject direct `react-toastify` imports outside the design-system feedback authority.

## Intentional non-mutation exclusions

- Daily Closing summary/filter loading is read-only in the current implementation.
- Accounts Receivable filtering/loading is read-only in the current implementation.
- High-frequency local/transient scan interactions may continue to use inline/audio/local UI feedback when no persistent server mutation is committed.

## Verification Authority

GitHub branch implementation alone is not a GREEN release gate.

Required Local verification after merging this feature branch into Local `main`:

1. `node tests/action-feedback-standardization.contract.test.js`
2. Feedback unit tests.
3. Typecheck/build through the repository verification workflow.
4. Full `npm run verify`.
5. Manual smoke checks for Product Profile CRUD, Sales Tax filing confirmation, Partner Store governance, Supplier payment duplicate prevention, Printer Settings, Tax Issuer Profile, and Partner Profile.

Do not push Local `main` to `origin/main` until Local verification is GREEN.
