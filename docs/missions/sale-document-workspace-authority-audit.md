# Sale Document Workspace Authority Audit

## Mission

Establish one server-revalidated Sale authority for Bill and Delivery Note workspaces while preserving separate document projections and renderers.

## Problem

Current document entry paths are inconsistent:

- Bill Short and Bill Full resolve `saleId` from the route and load through `billStore`.
- Delivery Note may accept `location.state.sale` as an optimistic snapshot and conditionally skip server hydration.
- Bill and Delivery Note edit document lines through legacy `salesStore.updateSaleDocumentLinesAction`.
- Search/list entry and Sale Completion entry must converge on the same workspace authority after `saleId` is known.

## Product Decision

```text
MULTIPLE ENTRY PATHS
        -> saleId
        -> SERVER-REVALIDATED DOCUMENT WORKSPACE
        -> DOCUMENT-SPECIFIC PROJECTION
        -> DOCUMENT-SPECIFIC RENDERER
```

Navigation state may be used only as an optimistic preview hint. It must never be final document authority.

## Authority Rules

1. Route `saleId` is the document identity authority.
2. Server hydration is required before print readiness.
3. `location.state.sale` is non-authoritative and must not suppress server revalidation.
4. Document-line mutation belongs to the Document Workspace owner.
5. A successful document-line mutation must trigger server reload before print.
6. Bill and Delivery Note retain separate projections and renderers.
7. Search stores do not own the currently opened document.
8. Legacy stores remain compatibility surfaces until runtime evidence allows removal.

## Current Authority Matrix

| Workspace | Route saleId | Server load | Navigation snapshot | Document line mutation | Decision |
|---|---:|---:|---:|---:|---|
| Bill Short | yes | yes | no | legacy Sales Store | near-target; mutation extraction needed |
| Bill Full | yes | yes | no | legacy Sales Store | near-target; mutation extraction needed |
| Delivery Note | yes | conditional | yes | legacy Sales Store | hybrid authority; must revalidate always |

## Target Boundary

```text
src/features/sales/documents/workspace/
├── api/saleDocumentWorkspaceApi.js
├── contracts/saleDocumentWorkspaceAuthorityContract.js
├── controllers/saleDocumentLineUpdateController.js
├── services/saleDocumentWorkspaceIdentity.js
├── store/saleDocumentWorkspaceStore.js
├── hooks/useSaleDocumentWorkspace.js
└── index.js
```

## Increment Plan

1. Authority audit and contract — COMPLETE
2. Shared workspace API and identity service — NEXT
3. Shared document-line mutation controller — PENDING
4. Bill mutation cutover — PENDING
5. Delivery Note server-authority cutover — PENDING
6. Workspace compatibility bridge — PENDING
7. Legacy document actions removal — BLOCKED UNTIL RUNTIME EVIDENCE
8. Runtime and Operational verification — PENDING

## Non-goals

- merging Bill and Delivery Note layouts
- changing tax semantics
- redesigning print UI
- changing routes
- deleting `billStore` in the audit slice
- deleting legacy Sales Store actions without runtime evidence

## Verification Boundary

Repository evidence can prove authority contracts, public boundaries, server-revalidation wiring, and source cutovers. Runtime PASS and Operational PASS require executable evidence.