# Delivery Note Lifecycle — Wave 0 Client Contract Map

Status: WAVE 0 CLIENT ARCHAEOLOGY COMPLETE — NO RUNTIME MUTATION

## Purpose

Record the current Delivery Note client surfaces before the UI becomes document-lifecycle centric. This file is descriptive evidence and a compatibility map, not a UI implementation.

## Current client surface map

| Surface | Current behavior | Lifecycle implication |
| --- | --- | --- |
| `src/routes/partner/salesRoutes.jsx` | Non-consolidated Delivery Note print route is `delivery-note/print/:saleId`; consolidated delivery has a separate route. | Primary non-consolidated identity is still Sale-based. |
| `src/features/deliveryNote/pages/DeliveryNoteListPage.jsx` | Uses shared Sale document search policy, computes financial summary, routes rows to print. | List is an operational Sale/document projection, not immutable revision history. |
| `src/features/deliveryNote/components/workspace/DeliveryNoteResultTable.jsx` | Shows Sale number/customer/gross/paid/balance/aging and exposes only a Print action. | No lifecycle badge, lineage navigation, return action or replacement/consolidation trace yet. |
| `src/features/sales/documents/search/policies/deliveryNoteSearchPolicy.js` | Projects Sale-like rows and has fallback gross-minus-paid balance logic. | Search policy understands source type compatibility but not first-class Delivery Note lifecycle status. |
| `src/features/deliveryNote/pages/PrintDeliveryNotePage.jsx` | Loads Sale-backed Delivery Note or consolidated adapter; integrates preparation/replacement controls. | Print workspace currently mixes source document, presentation preparation and replacement under Sale identity. |
| `src/features/deliveryNote/components/workspace/DeliveryNoteReplacementPanel.jsx` | Replacement is editable only while DRAFT and must reconcile exactly to Financial Lock. | Existing replacement UX is presentation/recomposition, not a return-adjusted revision UX. |
| `src/features/sales/documents/replacement/api/saleDocumentReplacementApi.js` | Replacement API is rooted under `/sales/:saleId/document-replacement`. | Existing replacement lifecycle is preparation/Sale-scoped. |
| `src/features/deliveryNote/print/workspace/policies/deliveryNoteFinancialAuthority.js` | Printable total follows printable items only when preparation is LOCKED or replacement authority is active. | It is print/presentation authority, not the commercial return-adjusted lifecycle source. |
| `src/features/combinedBilling/api/combinedBillingApi.js` | Separate APIs exist for document workspace, consolidated delivery history/print and consolidated tax issuance. | Consolidation and tax surfaces already exist and should be linked into lifecycle navigation rather than duplicated. |

## UX gap confirmed by Wave 0

The current list answers “which Sale/consolidated source can I print?” It does not yet answer the lifecycle questions required by the new architecture:

- What is the document's own stable identity?
- Is this the current active revision or historical source?
- Was it adjusted by a Sale Return?
- Was it superseded by a newer Delivery Note?
- Was it consolidated, and into which document?
- Is it still eligible for replacement/consolidation/tax handoff?
- Which return/replacement/consolidation event changed its authority?

The future list must therefore separate **historical visibility** from **current action eligibility**.

## Existing replacement UX must remain semantically distinct

The current `DeliveryNoteReplacementPanel` explicitly tells the user that lines may be rearranged while IN_BUDGET / OUT_OF_BUDGET totals remain equal to the existing Financial Lock. That is a valid existing use case and must not be silently repurposed as the partial-return workflow.

A future return-adjusted action should be presented separately, for example “สร้างใบส่งของฉบับปรับปรุงหลังคืนสินค้า”, and should obtain its lines/value from server lifecycle authority rather than editable client arithmetic.

## Target row contract for later waves

The Delivery Note history row should eventually be able to consume a server-owned projection containing at least:

- `documentId`
- `documentNumber`
- `sourceSaleId`
- `revisionNumber`
- `lifecycleStatus` (`ACTIVE`, `ADJUSTED`, `SUPERSEDED`, `CONSOLIDATED`, `CANCELLED`)
- `grossAmount`
- `returnedAmount`
- `currentAmount`
- `paidAmount`
- `balanceAmount`
- `replacesDocumentId`
- `replacedByDocumentId`
- `consolidatedIntoDocumentId`
- tax-document summary/readiness
- server-owned allowed actions

Field names remain provisional until the server Wave 1 contract is frozen. The client must not independently infer lifecycle transitions from color/status heuristics.

## Compatibility rules

1. Existing `delivery-note/print/:saleId` URLs must remain usable during migration.
2. Existing consolidated delivery print routes remain valid.
3. Existing financial-lock replacement UI remains valid for its current purpose.
4. Client must not perform stock, receivable or tax calculations to decide lifecycle transitions.
5. Existing cash-sale Delivery Note terminal behavior remains isolated from credit Delivery Note settlement/consolidation behavior.
6. Later lifecycle actions must be driven by server-owned eligibility/actions.

## Wave 1 client dependency

No runtime UI mutation should begin until the server defines:

- lifecycle status resolver;
- current active document resolver;
- active remaining line projection;
- explicit action eligibility contract;
- compatibility identity for legacy Sale-backed Delivery Notes.

Once those exist, the client can evolve from a Sale-centric print list into a document-centric lifecycle history without duplicating business rules.
