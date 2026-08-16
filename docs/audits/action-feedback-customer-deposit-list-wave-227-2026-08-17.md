# Action Feedback Residual Audit — Wave 227

Date: 2026-08-17
Scope: Customer Deposit list read authority
Branch: `feature/action-feedback-residual-wave-227`

## Residual found

The broad financial-reader checkpoint found one remaining material authority gap in `customerDepositStore.js`.

`fetchCustomerDepositsAction()` wrote the canonical `deposits` list and shared `isLoading` state without request ownership. A slower earlier list request could therefore overwrite a newer result. The same in-flight response could also repopulate stale list state after a manual `setDeposits`, a deposit mutation, or `resetAllDepositState()`.

This is materially relevant because customer deposits are financial state and the list can represent amounts/statuses that change after create, update, cancel, or usage operations.

## Change

Added an independent `customerDepositListRequestSequence` authority for the canonical deposit list.

The list loader now:

- establishes request ownership before the request;
- rejects stale success and stale error writes;
- allows only the current owner to release `isLoading`;
- returns the accepted list for observable caller behavior.

List ownership is invalidated when the canonical list can change independently of the read:

- manual `setDeposits`;
- create deposit;
- update deposit;
- cancel deposit;
- apply deposit usage;
- full store reset.

The existing customer/deposit context authority remains separate, so list reads do not unnecessarily cancel customer-context lookups and vice versa.

## Contract

Added `tests/customer-deposit-list-read-authority.contract.test.js` to lock:

- serialized list ownership;
- stale success/error/finally rejection;
- invalidation across manual list writes, persistence operations, and reset.

## Checkpoint result

Wave 227 is justified by a concrete residual; it is not a numbering-only wave. The next checkpoint should continue only if another material shared financial-state reader/writer is found. If the next broad scan finds no material residual, recommend closing the Action Feedback / Notification Standardization agenda instead of creating another wave.
