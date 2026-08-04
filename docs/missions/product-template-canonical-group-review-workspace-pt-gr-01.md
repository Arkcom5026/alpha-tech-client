# Product Template Canonical Group Review Workspace — PT-GR-01 Client

## Goal
Replace the per-Product Candidate queue with a read-only Canonical Group Review workspace for Superadmin.

## Server Authority
- Endpoint: `GET /api/product-templates/candidates/groups`
- Server merge authority: `f0b1623e05e455551c11cefef098da40abb45280`

## Client Scope
- Load Canonical Groups only after Business Type selection.
- Display group summary, Template Branch code, and category evidence.
- Filter by review status and search text.
- Show canonical name, brand, Product Type, Product count, Store count, fingerprint, and review reasons.
- Paginate using the Server projection.

## Safety
- Read-only UI.
- No Candidate creation or review mutation.
- No Template creation, merge, split, ignore, promotion, or Product linking.
- No stock, price, serial, tax, or transaction mutation.

## Verification
`npx vitest run tests/product-template-canonical-group-review-workspace-pt-gr-01.contract.test.js`
