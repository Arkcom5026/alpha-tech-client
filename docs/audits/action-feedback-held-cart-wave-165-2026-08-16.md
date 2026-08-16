# Action Feedback Residual Audit — Wave 165

Date: 2026-08-16
Branch: `feature/action-feedback-residual-wave-165`
Base: `feature/action-feedback-residual-wave-164`

## Scope

Canonical sales held-cart owner:

- `src/features/sales/held-cart/components/PosHeldCartPanel.jsx`

Persistent mutations reviewed:

- create/save current held cart
- cancel held cart

## Residual found

The component already had a synchronous `mutationRef`, mutation-specific loading state, ADS success/error feedback, command payload construction, and control freezing. However, the persistence calls and their post-success `load()` refresh were inside the same error boundary.

That meant a committed create/cancel could still be reported through the create/cancel failure path if refreshing the held-cart list failed afterward.

## Wave 165 changes

- persistence failure is now handled before post-success refresh begins
- create success is announced immediately after `createPosHeldCart()` resolves
- cancel success is announced immediately after `cancelPosHeldCart()` resolves
- refresh failures use dedicated partial-success event keys and messages
- cancel command snapshots `heldCartId` and reason before persistence
- mutation ownership remains held until refresh/follow-up UI completion is finished
- initial panel load explicitly absorbs its already-reported rejection to avoid an unhandled promise

## Feedback authority

Create:

- persistence failure: `held-cart:create:error`
- persistence success: `held-cart:create:success`
- post-success refresh failure: `held-cart:create:refresh:error`

Cancel:

- persistence failure: `held-cart:cancel:<id>:error`
- persistence success: `held-cart:cancel:<id>:success`
- post-success refresh failure: `held-cart:cancel:<id>:refresh:error`

## Contract

Added:

`tests/held-cart-partial-success-authority.contract.test.js`

The contract locks synchronous ownership, command snapshots, and separation between persistence failures and post-success refresh failures.

## Verification status

Git-side implementation complete. Local typecheck/build/test verification remains pending until the Local workspace is available.
