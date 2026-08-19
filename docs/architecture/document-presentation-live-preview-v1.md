# ALPHA-TECH Document Presentation Live Preview V1

Status: ACTIVE IMPLEMENTATION

Base architecture: Document Presentation Architecture V2

Baseline main SHA when the agenda opened: `7ad166ee2489aa4e9f40669e0487ce4231c646d0`

## Purpose

The document format settings workspace must let a store see the effect of presentation changes before saving. The preview is a presentation aid only; it must never become a second source of business, legal, tax, issuance, snapshot, or print-routing authority.

## Core rule

Live Preview projects the same presentation inputs used by real documents onto deterministic sample fixtures:

`Current Branch + Unsaved Draft Presentation Layer -> V2 Presentation Merge -> Document Header Resolver -> Preview Renderer Family + Semantic Footer Primitive`

The preview intentionally uses sample document data. It does not query or mutate real transactions.

## Non-goals

Live Preview must not:

- issue or finalize documents;
- create presentation snapshots;
- mutate business records;
- alter document totals, tax authority, refund authority, stock authority, or payment authority;
- route print jobs;
- load arbitrary HTML/CSS/JavaScript;
- replace the real production renderer as document authority.

## Preview foundation

### Canonical fixture registry

`src/features/settings/documentPreview/documentPreviewFixtures.js`

Fixtures are keyed by canonical Document Purpose. Each fixture carries presentation-only sample facts:

- renderer family;
- document title;
- sample document number/date;
- sample counterparty;
- sample rows/totals;
- signature labels;
- statutory lock marker.

Current purposes:

- `QUOTATION`
- `DELIVERY_NOTE`
- `CUSTOMER_RECEIPT`
- `CUSTOMER_MONEY_RECEIPT`
- `DELIVERY_CREDIT_SETTLEMENT`
- `REFUND_RECEIPT`
- `PURCHASE_ORDER`
- `COMBINED_BILLING`
- `FULL_TAX_INVOICE`
- `CREDIT_NOTE`
- `SHORT_TAX_INVOICE`

`SHORT_TAX_INVOICE` is `THERMAL`; the remaining current workspaces are previewed as `A4`.

### Shared live preview frame

`src/features/settings/documentPreview/DocumentPresentationLivePreview.jsx`

Responsibilities:

1. receive `branch`, canonical `documentPurpose`, an optional unsaved `draftLayer`, and an optional semantic footer;
2. overlay the draft layer with `upsertDocumentPresentationLayer` without persisting it;
3. resolve the effective header with `buildStoreDocumentHeader`;
4. select the correct preview geometry from the fixture renderer family;
5. render a deterministic sample canvas;
6. render the document-owned semantic footer component supplied by the settings card.

This keeps unsaved edits live while retaining V2 canonical merge semantics.

## Settings ownership

`DocumentFormatSettingsPage.jsx` remains the single settings entry point. The single-workspace dropdown remains authoritative for choosing which document settings surface is visible.

Settings cards continue to own their constrained editable state and save action. They project the same local state into `draftLayer` for the preview before persistence.

## Renderer reuse boundary

V1 deliberately reuses the safest presentation primitives that are already pure and document-owned:

- `buildStoreDocumentHeader`
- V2 presentation layer merge
- `QuotationPresentationFooter`
- `DeliveryNotePresentationFooter`
- `CustomerReceiptPresentationFooter`
- `PurchaseOrderPresentationFooter`
- `CombinedBillingPresentationFooter`
- `FinanceOperationalPresentationFooter`
- `StatutoryTaxPresentationFooter`

The current production print pages contain routing, fetching, lifecycle actions, editing, and other runtime responsibilities. Live Preview must not mount those pages inside Settings.

If a future renderer is decomposed into a pure document canvas/shell, the preview may replace the generic sample body with that pure canvas. The authority rule remains unchanged: preview data stays a fixture; presentation logic stays canonical.

## Statutory safety

Statutory fixtures display a visible lock notice. Legal/tax fields in preview data are illustrative only and are not editable presentation values.

`FULL_TAX_INVOICE` and `CREDIT_NOTE` use A4 preview geometry.

`SHORT_TAX_INVOICE` uses dedicated Thermal 80mm geometry and must never inherit A4 dimensions.

## Unsaved-state semantics

Changing a field must update the preview immediately without requiring save.

A preview render must not call `updateBranch` or otherwise persist the draft.

The normal save action remains the only persistence path.

## Store header workspace

The store header workspace already has a full visual preview driven by unsaved `react-hook-form` state. Live Preview V1 does not replace it. Document-specific workspaces align to that user experience while preserving the existing store-header implementation.

## Adding a new document in the future

When a new Document Purpose is added to Presentation V2:

1. add the canonical purpose and capability using the V2 extension path;
2. add the document settings workspace/card if the store can configure presentation;
3. add one fixture entry to `DOCUMENT_PREVIEW_FIXTURES` with the correct renderer family;
4. project the card's unsaved state into `draftLayer`;
5. render `DocumentPresentationLivePreview` and pass document-owned pure presentation primitives where available;
6. add contract coverage for fixture presence, renderer family, and live draft projection;
7. verify Settings manually and compare with the real print renderer.

Do not create a second preview registry for the same purpose, do not read real transactions merely to make Settings look realistic, and do not move business authority into fixture data.

## Acceptance gates

Before publish:

- all document workspaces show a full preview canvas;
- typing/editing updates the preview without save;
- `SHORT_TAX_INVOICE` is visibly Thermal 80mm;
- statutory previews retain legal lock messaging;
- store header workspace remains unchanged and functional;
- existing save/snapshot/business authority contracts remain green;
- focused preview contracts pass;
- full Vitest suite passes;
- typecheck passes;
- production build passes;
- manual visual inspection passes on desktop settings layout.
