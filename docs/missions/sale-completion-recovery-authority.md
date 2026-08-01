# Sale Completion Recovery & Single Submission Authority

## Mission

Close the highest-value Sales/Payment runtime gap by making Sale Completion the single submission authority and exposing safe recovery for uncertain responses.

## Confirmed Existing Authority

- Client completion endpoint: `POST /sales/complete`
- durable completion identity is stored in `sessionStorage`
- completion identity is cleared only after a successful API response
- Server completion slice already owns atomic Sale/Payment/Stock mutation and idempotent replay

## Required Outcomes

1. Sale Completion owns submission locking as the single authority.
2. Deterministic failures are distinguished from uncertain responses.
3. The pending command identity is preserved and projected to the UI.
4. Retry reuses the same command identity and material payload.
5. Cart, payment, customer, and held-cart state are cleared only after a canonical `saleId` is returned.
6. Focused contracts cover duplicate clicks, timeout/retry, replay success, and changed-payload conflict projection.

## Safety Boundaries

- no Server transaction rewrite in this Increment
- no route or API compatibility removal
- no destructive reset before canonical success
- no new command identity during uncertain-response retry
- no merge until focused verification and final integrated certification are complete

## Working State

`IN PROGRESS`
