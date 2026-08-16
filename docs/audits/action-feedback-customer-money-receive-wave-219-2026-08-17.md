# Wave 219 — Customer Money Receive search request authority

Date: 2026-08-17
Branch: `feature/action-feedback-residual-wave-219`
Base: `feature/action-feedback-residual-wave-218`

## Residual found

`useCustomerMoneyReceiveCustomerSearch.js` kept a second local async search lifecycle on top of the shared customer store. Even after the store-level stale-search authority was added, the hook itself could still let an older submit finish after the user changed the query, selected a customer, or cleared the search. That stale local completion could replace results/error or release `loading` for a newer interaction context.

## Change

- Added local synchronous `requestRef` ownership for each submitted Customer Money Receive customer search.
- Each submit freezes the trimmed query before the async call.
- Stale success and stale error outcomes are discarded.
- Stale `finally` cannot release loading owned by a newer request/context.
- Query edits invalidate the outstanding submitted search.
- Customer selection and clear actions invalidate pending search ownership and explicitly release local loading.

## Authority model

The newest local customer-search interaction owns `results`, `selectedCustomer`, `error`, and `loading`. Store-level request sequencing protects shared search state; this hook-level authority protects the distinct local presentation state used by Customer Money Receive.

## Contract

`tests/customer-money-receive-search-authority.contract.test.js` locks synchronous request ownership, stale outcome suppression, and invalidation on query/select/clear context changes.

## Scope

Expected changed files only:

1. `src/features/customerMoneyReceive/customer/useCustomerMoneyReceiveCustomerSearch.js`
2. `tests/customer-money-receive-search-authority.contract.test.js`
3. `docs/audits/action-feedback-customer-money-receive-wave-219-2026-08-17.md`
