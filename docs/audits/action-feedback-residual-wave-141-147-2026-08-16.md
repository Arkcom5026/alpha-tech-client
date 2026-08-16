# Action Feedback Residual Audit — Waves 141–147

Date: 2026-08-16

## Authority baseline

This residual pass continues from `reconcile/action-feedback-wave-140-on-main-07874c74` at `907e254fdee4f23a18360806614300bc56a04790`.

The audit applies the ADS Action Feedback Contract to persistent UI actions that can escape the existing direct transport scan, especially mutations routed through Zustand/store actions, imported API helpers, payment SDK calls, or shared mutation wrappers.

## Residual pattern discovered

The previous direct-mutation scan is useful but does not prove coverage for every persistent action owner. Residual owners commonly had one or more of these traits:

- persistence is hidden behind a store action or imported API helper rather than an inline `apiClient`/`axios` call;
- success/failure existed only as inline component state;
- React loading state existed, but there was no synchronous ref boundary protecting the first render gap from duplicate submission;
- form values remained editable while the request was in flight;
- a success message could disappear immediately because navigation or modal closure happened in the same success path.

## Wave 141 — Customer Deposit customer mutations

Owner: `src/features/customerDeposit/components/CustomerSelectorDeposit.jsx`

Hardened customer create/update with:

- synchronous `customerMutationRef` ownership;
- immutable payload snapshots;
- visible create/update progress;
- conflicting control freeze;
- `feedback.actionSuccess` / `feedback.actionError` event keys;
- contract test `tests/customer-deposit-customer-mutation-authority.contract.test.js`.

## Wave 142 — Quarantined legacy duplicate

Candidate: `src/features/sales/create/components/CustomerSection.jsx`

A first hardening attempt produced disproportionate full-file churn on a legacy/duplicate POS customer component. This path is intentionally quarantined and is **not** part of the clean integration chain. No production integration should use `feature/action-feedback-residual-wave-142` as a base.

## Wave 143 — Modern POS customer mutations

Owners:

- `src/features/sales/create/customer/SaleCustomerSection.jsx`
- `src/features/sales/create/customer/components/SaleCustomerDetailsForm.jsx`

The clean implementation was rebuilt directly from Wave 141 on `feature/action-feedback-residual-wave-143-clean`, avoiding Wave 142 churn.

Hardened create/update with synchronous mutation ownership, snapshots, ADS outcomes, editor freeze, and visible mutation labels.

Contract: `tests/sale-customer-modern-mutation-authority.contract.test.js`.

## Wave 144 — Repair customer mutations

Owner: `src/features/repair/components/RepairCustomerSection.jsx`

Hardened repair-customer create/update with:

- synchronous `mutationRef`;
- create/update payload snapshots;
- mutation-specific busy state;
- ADS success/error event keys;
- freeze of conflicting search, selection, edit, clear, cancel, and form controls.

Contract: `tests/repair-customer-mutation-authority.contract.test.js`.

## Wave 145 — Online registration mutation

Owner: `src/features/online/order/components/RegisterForm.jsx`

The previous inline `success` state was immediately hidden by returning to login. The mutation now has synchronous duplicate protection, immutable payload authority, visible progress, frozen controls, and ADS success/error before closing the registration view.

Contract: `tests/online-registration-mutation-authority.contract.test.js`.

## Wave 146 — Checkout financial mutation boundary

Owner: `src/features/customer/components/CheckoutForm.jsx`

Existing ADS payment/order outcomes were retained. The residual defect was duplicate-submit authority around Stripe confirmation and order persistence. Added a synchronous submit ref and snapshots for Stripe/elements/token so one checkout interaction owns the financial mutation boundary until completion.

Contract: `tests/checkout-payment-mutation-authority.contract.test.js`.

## Wave 147 — Canonical customer registration mutation

Owner: `src/features/auth/workspaces/RegisterWorkspace.jsx`

React Hook Form already exposed `isSubmitting`, but the persistent registration path did not have an explicit synchronous ownership ref. Added `submittingRef`, payload snapshot, full input freeze during submission, and retained existing ADS success/error outcomes.

Contract: `tests/auth-customer-registration-mutation-authority.contract.test.js`.

## Clean integration chain

The clean cumulative branch after Wave 147 is:

`feature/action-feedback-residual-wave-147`

It descends from the Wave 140 reconciliation through the clean Wave 143 branch and does not contain the quarantined Wave 142 legacy-file rewrite.

## Residual candidates discovered but not yet changed

### Repair subcontract lifecycle

`src/features/repair/components/RepairSubcontractPanel.jsx`

The shared `runMutation` wrapper currently uses inline `notice/error` state and React `loading`, but lacks an explicit synchronous mutation ref and ADS action outcomes. This is a strong candidate for the next residual wave because it governs send/update/request-return/receive-return lifecycle mutations.

### Forgot-password request

`src/features/auth/workspaces/ForgotPasswordWorkspace.jsx`

The request has visible loading and inline success/error, but no ADS action outcome or synchronous request ref. The file currently carries CRLF formatting and should be modified only with a source-safe strategy that avoids whole-file line-ending churn.

## Verification status

Git-side structural work and contract coverage have been added, but Local verification has **not** been run yet. Before integration into `main`, run the normal client verification gate (`npm run verify`) when Local becomes available.
