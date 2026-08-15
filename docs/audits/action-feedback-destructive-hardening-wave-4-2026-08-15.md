# Action Feedback Destructive Hardening — Wave 4

Date: 2026-08-15
Baseline: `c72feb4f89fe278bf3a1ebebe5e7e05163abd48e`
Branch: `feature/action-feedback-destructive-hardening-wave-4`

## Objective

Close residual destructive-action UX gaps left after Waves 1–3, focusing on browser-prompt cancellations, missing action feedback, and duplicate destructive submissions.

## Hardened owners

### POS Held Cart
File: `src/features/sales/held-cart/components/PosHeldCartPanel.jsx`

- Removed `window.prompt()` cancellation reason collection.
- Added in-context cancellation reason form.
- Added per-item cancellation pending/busy state.
- Added duplicate cancellation guard.
- Migrated create/list/cancel persistent feedback to ADS action helpers where applicable.

### Customer Money Receive
File: `src/features/customerMoneyReceive/pages/CustomerMoneyReceiveDetailPage.jsx`

- Removed `window.prompt()` from cancellation of received-money documents.
- Added explicit in-context destructive confirmation state with required reason.
- Added duplicate cancellation guard.
- Added success and normalized error action feedback while retaining inline detail.

### Product Reservation
File: `src/features/productReservation/merchant/pages/ProductReservationDetailPage.jsx`

- Removed `window.prompt()` from reservation cancellation.
- Added in-context cancellation reason/confirmation UI.
- Preserved lifecycle idempotency keys.
- Preserved duplicate-command guard and Wave 3 ADS success/error feedback.
- Cancellation UI closes only after the lifecycle command succeeds.

## Contract hardening

`tests/action-feedback-standardization.contract.test.js` now locks:

- Held Cart and Customer Money Receive as persistent action owners.
- No browser prompt for the three cancellation flows.
- Explicit cancellation state exists for each flow.
- Duplicate destructive submissions remain blocked.
- Product Reservation idempotency remains intact.

## Local verification gate

Required after merging into Local `main`:

1. `node tests/action-feedback-standardization.contract.test.js`
2. `npm run typecheck`
3. `npm run build`
4. `npm run verify`

Recommended manual smoke:

- Held Cart: cancel requires reason and successful cancellation shows feedback.
- Customer Money Receive: cancel requires reason; failure leaves confirmation visible; success refreshes cancelled state and shows feedback.
- Product Reservation: cancel requires reason; success closes cancellation form and lifecycle timeline remains valid.

Do not push `main` or release Production until the Local verification gate is GREEN.