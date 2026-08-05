# Sale Completion E2E Mission

## Objective

Prove the merchant can complete a real POS sale through the user interface with real backend runtime authority.

## Scope

- open authenticated merchant sale workspace
- select in-branch customer
- select sellable product
- complete payment
- create sale completion
- hand off to receipt/bill document
- verify completion evidence

## Non-goals

- API mocking
- UI store injection
- direct database manipulation from browser

The paired Server verifier owns database post-condition validation.