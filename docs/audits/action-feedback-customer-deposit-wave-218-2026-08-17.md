# Wave 218 — Customer Deposit shared context read authority

Date: 2026-08-17
Branch: `feature/action-feedback-residual-wave-218`
Base: `feature/action-feedback-residual-wave-217`

## Residual found

`customerDepositStore.js` had several asynchronous reads that all write the same selected customer/deposit context without request ownership: customer lookup by phone, name, customer id, deposit-total lookup, deposit detail lookup, and the phone reload helper. A slower request could overwrite a newer selected customer/deposit or release detail loading owned by a newer request. These reads could also race with deposit mutations and overwrite persisted usage/update state after the mutation succeeded.

## Change

- Added shared `customerDepositContextRequestSequence` for canonical selected customer/deposit context reads.
- Phone/name/customer/deposit identities are snapshotted before async calls.
- Stale success and stale error outcomes are discarded.
- Stale detail `finally` cannot release loading for a newer detail request.
- Customer/deposit reads do not start while deposit persistence is active.
- Create/update/cancel/apply-usage mutations invalidate outstanding context reads before persistence.
- Explicit set/clear/reset operations invalidate pending context reads so late responses cannot resurrect replaced state.

## Authority model

The newest customer/deposit context command owns `selectedCustomer`, `selectedDeposit`, `customerDeposits`, and `customerDepositAmount`. Persisted deposit mutations and explicit local selection/clear commands supersede older reads.

## Contract

`tests/customer-deposit-context-read-authority.contract.test.js` locks shared sequencing, immutable intent snapshots, stale outcome suppression, mutation supersession, and explicit clear/reset invalidation.

## Scope

Expected changed files only:

1. `src/features/customerDeposit/store/customerDepositStore.js`
2. `tests/customer-deposit-context-read-authority.contract.test.js`
3. `docs/audits/action-feedback-customer-deposit-wave-218-2026-08-17.md`
