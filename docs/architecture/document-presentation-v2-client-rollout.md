# Client Rollout Map: Store Document Presentation V2

Date: 2026-08-19
Branch: `feature/document-presentation-architecture-v2`

This document maps the current Client print surfaces to the Store Document Presentation V2 architecture. It is intentionally implementation-oriented and assumes the Server ADR `docs/architecture/document-presentation-v2.md` is the authority for cross-repository rules.

## 1. Current reusable foundations

Reuse rather than replace:

- `src/features/branch/documentHeader/documentHeaderConfig.js`
- `src/features/branch/documentHeader/StoreDocumentHeaderScope.jsx` as a compatibility adapter
- `DocumentFormatSettingsPage.jsx` as the single entry point for store document design
- existing document projection/policy layers where present
- existing A4/thermal print shells and pagination logic
- existing Document Purpose / printer-preference infrastructure
- existing local print job snapshot transport

## 2. UI direction

The current `รูปแบบเอกสาร` page remains the single Document Design Center.

Target navigation model:

```text
Document Design Center
  Store defaults
  Document purpose
    Header
    Content presentation
    Footer / terms / payment accounts / signatures
  Live preview
```

Per-document-purpose settings are sparse overrides. The UI must visibly distinguish inherited values from explicit overrides and provide a reset-to-store-default action.

Preview must use the selected document's real renderer family where practical rather than one generic mock document.

## 3. Presentation controls

Initial safe controls:

- show/hide optional blocks
- typography token (`xs`..`xl`)
- alignment
- spacing token
- constrained width variant
- order inside allowed zones
- logo position and validated numeric logo size
- store-owned text content
- store payment-account selection

Do not expose arbitrary CSS, HTML, x/y coordinates, or unrestricted font sizes.

## 4. Semantic primitives candidate set

Introduce shared primitives incrementally; do not force a big-bang renderer rewrite.

Candidates:

- `StoreHeaderBlock`
- `CommercialTermsBlock`
- `PaymentTermsBlock`
- `PaymentAccountBlock`
- `NotesBlock`
- `SignatureBlock`
- `SystemNoticeBlock`
- `CustomFooterBlock`
- presentation typography/layout token helpers

Physical document shells retain composition and pagination ownership.

## 5. Coverage matrix

| Document | Renderer family | Current header | Priority | Capability class | Notes |
|---|---|---|---|---|---|
| Quotation | A4 | V1 header + issued snapshot | Wave 1 | Commercial/high | Reference implementation; historical semantics already strongest |
| Delivery Note | A4 | V1 header | Wave 2 | Commercial/high | Has print policy/projection boundary |
| Customer Receipt | A4 | V1 + legacy receiptConfig | Wave 2 | Commercial/medium | Remove legacy presentation residue carefully |
| Purchase Order | A4 | hard-coded shell | Wave 3 | Commercial/high | Good Page -> Policy -> Shell boundary |
| Combined Billing | A4 | hard-coded sample issuer | Wave 3 | Commercial/high | High-value cleanup target |
| Full Tax Invoice | A4 | V1 header | Wave 4 | Statutory/restricted | Preserve pagination/tax authority |
| Credit Note | A4 | no shared header | Wave 4 | Statutory/restricted | Projection authority already strong |
| Short Tax / Sale Receipt | Thermal | separate renderer | Wave 4 | Statutory/restricted | Adaptive typography already exists |
| Customer Money Receipt | A4 + thermal | A4 V1 only | Wave 5 | Finance/medium | System-owned footer notices |
| Delivery Credit Settlement | A4 + thermal | A4 V1 only | Wave 5 | Finance/medium | System-owned footer notice |
| Refund Receipt | legacy A4/pixel | hard-coded | Wave 5 | Finance/medium | Normalize physical shell gradually |
| Repair Intake/Return | operational | print contract exists | Wave 6/future | Operational/medium | Renderer maturity differs from sales docs |
| Receiving | operational | no clear canonical renderer | Future | Operational/low | Keep out of initial scope |
| Tax reports | report | N/A | Excluded | Very low | Not a store template problem |
| Barcode labels | utility | N/A | Excluded | Separate | Keep in barcode/printing domain |

## 6. Client identity adapter

Do not add a fourth set of document names.

Current names differ across:

- Document Purpose catalog
- print job authority
- local print bridge
- individual document features

Create one thin presentation identity adapter that resolves existing aliases to the canonical document-purpose identity without mass-renaming old subsystems.

## 7. V1 compatibility

`StoreDocumentHeaderScope` currently styles multiple legacy DOM structures with selector-specific CSS. Keep it working but freeze its architectural role as compatibility-only.

New V2-capable renderers should consume resolved presentation data/semantic primitives directly. Avoid adding new document-specific DOM selector branches to `StoreDocumentHeaderScope` unless required for temporary compatibility.

## 8. Media-family rules

A4 and thermal must map the same semantic typography/layout tokens to different safe physical values.

Examples:

- `md` store name can map to a fixed A4 size but adaptive thermal size.
- block order may be configurable on A4 but fixed on thermal.
- payment-account details may use a compact variant on thermal.

Renderer family owns overflow and pagination safety.

## 9. Protected content

The Client editor must derive allowed controls from a capability registry rather than hard-coded ad-hoc checks in every settings component.

Examples:

- Quotation commercial terms: editable content/style/order.
- Full Tax tax totals: protected.
- Credit Note legal issuer identity: protected.
- Customer Money `not a tax invoice` notice: required/system-owned.
- Delivery Credit Settlement workflow notice: required/system-owned.

## 10. Snapshot consumption

For issued/finalized documents, print pages must prefer the persisted presentation snapshot supplied by the Server lifecycle authority. Draft/editor previews may resolve current store settings.

The Client must not reconstruct historical presentation from current branch settings when a valid issued snapshot exists.

## 11. Rollout order

### Foundation
- canonical identity adapter
- V2 client normalizer/resolver projection
- capability registry
- token definitions
- V1 compatibility bridge
- settings editor architecture

### Wave 1: Quotation
Prove the complete loop: store defaults -> quotation override -> terms/payment account/footer -> preview -> issued snapshot -> historical print.

### Wave 2: Delivery Note / Customer Receipt
Migrate existing V1 consumers without changing physical document behavior.

### Wave 3: PO / Combined Billing
Remove hard-coded issuer presentation and adopt resolved store identity.

### Wave 4: statutory surfaces
Full Tax, Credit Note, Short Tax with restricted capabilities and regression-heavy verification.

### Wave 5: finance surfaces
Customer Money, Delivery Credit Settlement, Refund Receipt; preserve system-owned notices.

## 12. Required client tests

Add/extend focused contracts for:

- inheritance resolution
- sparse override reset behavior
- capability enforcement in settings UI
- canonical identity aliases
- V1 header fallback compatibility
- document-specific preview selection
- A4 physical-shell invariants
- thermal adaptive behavior
- historical snapshot precedence
- system-owned notice immutability

Existing A4 standardization and document-header consistency tests remain mandatory regression gates.

## 13. Client architecture invariants

1. One Document Design Center, not one settings page per document.
2. One presentation identity adapter, not a new registry.
3. Renderer families own physical layout safety.
4. Shared primitives are semantic, not a universal renderer.
5. V1 remains operational throughout migration.
6. Settings UI exposes only server-supported capabilities.
7. Issued snapshots take precedence over current settings.
