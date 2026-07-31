# Quick Receipt Capability Ownership Audit

## Status

- Working branch: `refactor/stock-item-module-architecture-v2`
- Draft PR: #37
- Increment: Capability authority and runtime boundary audit
- Behavior policy: Zero behavior change

## Business Roles Preserved

Quick Receipt is not only a shortened PO receipt flow. It must continue to support three durable business roles:

1. **Product recovery** — recreate or adopt operational products while preserving existing barcode and serial identities.
2. **Initial stock onboarding** — allow a new store or company to bring existing physical inventory into Alpha-Tech without manufacturing historical purchase orders.
3. **Normal quick receipt** — receive goods from a supplier and delivery note without a PO, save a draft, resume later, and publish stock only when the receipt is finalized.

These roles share a workspace but do not have identical ownership.

## Current Runtime Finding

The current page composes two valid but insufficiently explicit runtime paths.

### A. Direct intake runtime

Owner today:

- `useQuickStockRuntimeController`
- `useQuickStockCommitController`
- `quickStockIntakeExistingAction`
- `QuickStockCommitBar`

Behavior:

- prepares or adopts an operational product;
- scans barcode and serial identity;
- validates prices and queue readiness;
- publishes stock immediately through the direct intake endpoint.

This path is a legitimate recovery/onboarding capability. It must not be deleted merely because Quick Receipt Session exists.

### B. Receipt-session runtime

Owner today:

- `QuickReceiptSessionPanel`
- `quickReceiptSessionApi`

Behavior:

- owns supplier and delivery-note header;
- persists an unsaved local draft;
- creates and updates server drafts;
- uploads receipt lines;
- resumes and cancels drafts;
- finalizes or completes the document;
- publishes stock only when the whole receipt is finalized.

This path is the normal resumable document capability.

## Main Architecture Problem

The problem is not that two runtimes exist. The problem is that their intent and authority are hidden by presentation-level composition.

Current ambiguity:

- Both paths consume the same product, prices, barcode queue, serial queue and note.
- `QuickStockCommitBar` means immediate inventory publication.
- `QuickReceiptSessionPanel` means add a line to a document and publish only at finalization.
- The page does not currently express these as two explicit business actions.

Therefore this refactor must clarify ownership before any compatibility path is retired.

## Capability Map

```text
quick-stock/
├── workspace/
│   └── compose product intake + receipt session capabilities
├── product-intake/
│   ├── discovery/
│   ├── operational-product-resolution/
│   ├── template-adoption/
│   ├── local-product-creation/
│   ├── product-maintenance/
│   ├── barcode-queue/
│   └── serial-capture/
├── direct-intake/
│   ├── validation/
│   ├── payload-projection/
│   └── commit/
└── receipt-session/
    ├── header/
    ├── tax-header/
    ├── local-draft/
    ├── draft-list/
    ├── create-update/
    ├── resume/
    ├── cancel/
    ├── lines/
    │   ├── projection/
    │   ├── add/
    │   └── delete/
    ├── finalize/
    └── projection/
```

## State Ownership

| State | Required owner | Notes |
|---|---|---|
| Product search filters/results | `product-intake/discovery` | Independent of receipt document |
| Operational product | `product-intake/operational-product-resolution` | Shared read-only input for both commit paths |
| Product and price forms | `product-intake/product-maintenance` | Produces normalized intake pricing |
| Barcode/serial queue | `product-intake/barcode-queue` | Shared prepared input; no inventory publication authority |
| Direct intake note | `direct-intake` | Belongs to immediate stock publication |
| Supplier/delivery note | `receipt-session/header` | Document identity and resume authority |
| Tax document fields | `receipt-session/tax-header` | Must not block receipt when tax document is absent |
| Local unsaved lines | `receipt-session/local-draft` | Browser recovery before server draft exists |
| Server receipt/items | `receipt-session` | Server authority after draft creation or resume |
| Draft search/list | `receipt-session/draft-list` | Supplier and delivery-note lookup |
| Finalize busy/error state | `receipt-session/finalize` | Document-wide stock publication |

## Dependency Direction

Allowed:

```text
workspace
  -> product-intake public runtime
  -> direct-intake public action
  -> receipt-session public runtime

receipt-session/lines
  <- normalized prepared line from product-intake

receipt-session/finalize
  -> receipt-session API boundary

direct-intake/commit
  -> stock-item intake public boundary
```

Disallowed:

- receipt-session importing direct-intake commit behavior;
- direct-intake mutating receipt-session state;
- product-intake publishing inventory;
- presentation components owning API orchestration and local persistence;
- cross-capability imports through internal implementation files once public boundaries exist.

## Migration Order

1. Extract pure receipt-session models and projections.
2. Extract local-draft persistence.
3. Extract draft query/create/update/resume/cancel orchestration.
4. Extract receipt-line add/delete orchestration.
5. Extract finalize/complete orchestration.
6. Reduce `QuickReceiptSessionPanel` to projection and event wiring.
7. Rename and isolate direct-intake ownership without changing its behavior.
8. Make the workspace expose the two business actions explicitly.
9. Add capability and consumer contracts.
10. Run repository, typecheck, build and operational verification before retiring any compatibility path.

## Acceptance Rules

- No endpoint changes.
- No payload changes.
- No inventory timing changes.
- Direct intake remains immediate.
- Receipt-session intake remains document-finalize based.
- Existing barcode and serial identities remain reusable under current validation rules.
- Local and server draft recovery remain supported.
- Every migrated capability has one public boundary and focused contract coverage.
