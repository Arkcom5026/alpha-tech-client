# Wave 217 — Customer shared record read authority

Date: 2026-08-17
Branch: `feature/action-feedback-residual-wave-217`
Base: `feature/action-feedback-residual-wave-216`

## Residual found

`customerStore.js` still had three asynchronous read paths that write the same `customer`, `error`, and `isLoading` state without request ownership: phone lookup, current Online profile load, and current POS profile load. A slower older read could overwrite a newer customer context or release the loading state for a newer request. These reads could also race with create/update mutations and overwrite a mutation result after persistence succeeded.

## Change

- Added shared `customerRecordRequestSequence` for all reads that write the canonical `customer` state.
- Phone lookup freezes a normalized `phoneSnapshot` before the request.
- Phone / Online profile / POS profile reads discard stale success and stale error outcomes.
- Stale `finally` blocks cannot release `isLoading` owned by a newer record request.
- Record reads do not start while a customer mutation is active.
- Create and both profile-update mutations invalidate outstanding record reads before persistence begins.
- Explicit `setCustomer` and `resetCustomer` also invalidate pending reads so a late response cannot resurrect replaced or cleared customer state.

## Authority model

The latest canonical customer-record command owns `customer`, `error`, and its read-side loading release. Mutations supersede outstanding reads because persisted mutation outcomes are authoritative over earlier discovery/profile requests.

## Contract

`tests/customer-record-read-authority.contract.test.js` locks shared sequencing, immutable phone intent, stale response/finally suppression, mutation invalidation, and explicit state-replacement invalidation.

## Scope

Expected changed files only:

1. `src/features/customer/store/customerStore.js`
2. `tests/customer-record-read-authority.contract.test.js`
3. `docs/audits/action-feedback-customer-record-wave-217-2026-08-17.md`
