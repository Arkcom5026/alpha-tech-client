# Wave 216 — Customer Search stale-query authority

Date: 2026-08-17
Branch: `feature/action-feedback-residual-wave-216`
Base: `feature/action-feedback-residual-wave-215`

## Residual found

`customerStore.js` still allowed overlapping customer searches to write shared `searchedCustomers`, `searchError`, and `isSearching` state without request ownership. A slower earlier query could therefore replace the results of a newer query, report an obsolete error, or clear the loading flag while the newer search was still running. The two search entry points (`searchStoreCustomersAction` and `searchCustomers`) also shared the same destination state without a shared sequencing authority.

## Change

- Added module-level `customerSearchRequestSequence` shared by both customer search modes.
- Each search obtains an immutable request id before persistence.
- Success, error, and finally mutate search state only while that request is still the current owner.
- A newer search in either mode invalidates the previous mode as well, matching the fact that both write the same result state.
- `clearSearchedCustomers()` now invalidates outstanding requests before clearing visible search state.
- Stale outcomes return `null` and do not overwrite the active query state.

## Authority

The latest customer search command owns:

- `searchedCustomers`
- `searchError`
- `isSearching`

until another search command or explicit clear operation increments `customerSearchRequestSequence`.

## Contract

`tests/customer-search-stale-query-authority.contract.test.js` locks shared sequencing, stale success/error discard, finally ownership, and explicit-clear invalidation.

## Scope

Expected changed files only:

1. `src/features/customer/store/customerStore.js`
2. `tests/customer-search-stale-query-authority.contract.test.js`
3. `docs/audits/action-feedback-customer-search-wave-216-2026-08-17.md`
