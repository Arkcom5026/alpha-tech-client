# Wave 223 — Customer Money Receive create navigation authority

Date: 2026-08-17
Branch: `feature/action-feedback-residual-wave-223`
Base: `feature/action-feedback-residual-wave-222`

## Residual found

`CustomerMoneyReceivePage.jsx` already had a synchronous `savingRef` and immutable create payload, but the async create lifecycle was not owned by the current page instance. If the user navigated away while `createCustomerMoneyReceive()` was pending, the completed request could still call `navigate()` from the stale create page and its `catch/finally` could still write local error/saving state after the page had lost ownership.

## Change

- Added page-instance `mountedRef` ownership and a sequenced `createRequestRef`.
- Each submit freezes the create command and request id before persistence.
- Successful persistence keeps the global success feedback, but navigation only occurs while the originating page/request still owns the lifecycle.
- A stale create completion cannot redirect the user back into the old Customer Money Receive flow.
- Stale failure/finally paths do not write page-local error/saving state after unmount or supersession.
- Unmount invalidates the outstanding create request.

## Authority model

Server persistence outcome remains authoritative and may still emit global feedback. Page-local state changes and post-create navigation require both the current mounted page instance and the matching create request id.

## Contract

`tests/customer-money-receive-create-navigation-authority.contract.test.js` locks page-instance ownership, request sequencing, stale navigation suppression, and stale local-state suppression.

## Scope

Expected changed files only:

1. `src/features/customerMoneyReceive/pages/CustomerMoneyReceivePage.jsx`
2. `tests/customer-money-receive-create-navigation-authority.contract.test.js`
3. `docs/audits/action-feedback-customer-money-receive-create-wave-223-2026-08-17.md`
