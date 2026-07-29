# Sale Payment Workflow Responsibility Extraction

## Mission

Transform `PaymentSection.jsx` from a payment God Component into a presentation/composition surface backed by explicit feature-owned payment services, controller, hook, and projection.

## Stacked Authority

This increment is stacked on:

```text
agent/sale-create-workflow-responsibility-extraction
```

It must not merge before PR #28 is accepted.

## Target Architecture

```text
PaymentSection
  -> useSalePaymentWorkflow
      -> projectSalePaymentCalculation
      -> validateSalePaymentConfirmation
      -> mapSalePaymentIntent
      -> executeSalePaymentConfirmation
      -> projectSalePaymentWorkflow
```

## Ownership Target

### Payment Calculation

Owns framework-independent projections for:

- original item total
- item discount total
- bill discount
- final payable amount
- VAT inclusive projection
- deposit application
- cash applied
- other payment total
- remaining amount
- change amount
- net/grand paid amount

### Payment Validation

Owns payment confirmation preconditions for:

- non-empty cart
- submission lock
- sufficient cash-mode payment
- bill discount ceiling
- credit customer requirement
- credit immediate-payment prohibition
- payment evidence requirement

### Payment Intent Mapping

Owns backend payment-contract mapping for:

- `CARD` UI method to `CREDIT` backend method
- applied cash after change
- deposit payment row
- filtering zero-value payment evidence
- card reference and customer deposit identity

### Payment Confirmation Controller

Owns framework-independent confirmation execution and normalized result/error projection.

### Payment Workflow Hook

Owns React lifecycle only:

- local payment error
- deposit touched state
- confirm lock
- workflow composition
- success reset coordination delegation

### PaymentSection

Remains a presentation/composition surface. It may render controls and bind projected state/commands, but must not own payment calculation, validation, intent mapping, or confirmation execution.

## Atomic Cutover Rule

Do not partially migrate `PaymentSection.jsx`. All target owners must exist and be contract-checked before the final component cutover removes duplicate legacy ownership.

## Preserved Behavior

- cash, transfer, card, and deposit payment semantics
- card-to-credit backend mapping
- cash change calculation
- VAT-inclusive display
- credit-sale restrictions
- deposit cap and selected deposit identity
- payment evidence construction
- confirm locking
- completed-sale callback
- print-window cleanup on failure
- post-sale reset coordination

## Verification Boundary

Repository source evidence may prove ownership, isolation, public boundaries, and atomic cutover. Runtime PASS and Operational PASS require executable evidence and must remain pending until that evidence exists.
