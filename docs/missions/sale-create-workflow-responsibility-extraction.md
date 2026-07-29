# Sale Create Workflow Responsibility Extraction

## Mission

Transform `CreateSalePage.jsx` into a Sale Create composition page by extracting workflow responsibilities into explicit feature-owned owners, following the established Purchase Order and Sale Held Cart orchestration patterns.

## Stacked Authority

This increment is stacked on:

```text
agent/sale-held-cart-responsibility-extraction
```

It must not merge before PR #27 is accepted because the new Sale Create workflow composes the Held Cart public boundary introduced there.

## Architecture Goal

```text
CreateSalePage
  -> useCreateSaleWorkflow
      -> useSaleCartEditor
      -> useSaleItemSearch
      -> useSaleCompletion
      -> useSaleDocumentHandoff
      -> useSaleHeldCartWorkflow
      -> projectCreateSaleWorkflow
```

`CreateSalePage.jsx` remains the route-level composition surface. It must not own business workflow state, payload construction, search execution, completion orchestration, or document-opening authority.

## Responsibility Owners

### Sale Cart Editor Owner

Owns sale lines, add/update/remove commands, duplicate-line projection, and Held Cart final-line removal policy delegation.

### Sale Item Search Owner

Owns barcode intent, search execution, mapping search results into sale lines, duplicate detection feedback, unsupported-line handling, input reset, and focus handoff.

### Sale Completion Owner

Owns submission state, completion validation, sale payload construction, VAT/discount calculations, Held Cart persistence/revalidation guard, execution of sale completion, and normalized completion result/error.

### Sale Document Handoff Owner

Owns print/document option, duplicate-open protection, completed-sale document opening, and navigation handoff.

### Sale Create Workflow Owner

Composes all owners and feature boundaries without duplicating their state. Exposes one projected view model and command surface to `CreateSalePage.jsx`.

### Projection Owner

Flattens owner state into stable page-facing areas:

```text
customer
pricing
itemSearch
cart
heldCart
payment
completion
document
feedback
commands
```

## Required Invariants

1. Existing barcode search behavior remains.
2. Duplicate barcode prevention remains.
3. Stock and Simple product mapping remains.
4. Existing Sale Item editing/removal behavior remains.
5. Held Cart final-line protection remains delegated to Held Cart policy.
6. Existing VAT, discount, credit-sale, and SimpleLot validation remain.
7. Held Cart persistence and revalidation before completion remain.
8. `sourceHeldCartId` remains in the completion payload.
9. Existing payment and completed-document behavior remain.
10. Customer workflow remains independently owned and is only composed here.
11. No backend, API, database, route, or visual redesign is authorized.

## Increment Plan

1. Repository ownership audit and atomic-cutover contract.
2. Extract Sale Cart Editor owner.
3. Extract Sale Item Search owner.
4. Extract Sale Completion controller/hook.
5. Extract Sale Document Handoff owner.
6. Add `useCreateSaleWorkflow` orchestration boundary.
7. Add `projectCreateSaleWorkflow`.
8. Perform one atomic `CreateSalePage.jsx` cutover.
9. Remove duplicate page ownership.
10. Run repository contract verification.
11. Obtain Runtime and Operational evidence separately.

## Non-goals

- Payment UI redesign
- Customer workflow redesign
- Held Cart redesign
- Sale API contract changes
- backend or Prisma changes
- visual redesign
- runtime or operational certification without executable evidence

## Verification Boundary

Repository evidence may prove ownership, module boundaries, public exports, atomic cutover, and legacy ownership removal. Runtime PASS and Operational PASS require executable evidence from the runtime environment.
