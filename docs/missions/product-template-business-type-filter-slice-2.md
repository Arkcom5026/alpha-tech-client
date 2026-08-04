# Product Template Business-Type Filter — Slice 2

## Goal

Make Business Type the first Superadmin decision boundary before loading or reviewing Product Template Candidates.

## Authority

- Backend filter authority: `GET /api/product-templates/candidates?businessType=<BusinessType>`
- Store `Branch.businessType` remains the source of truth.
- Frontend does not infer Business Type from Product names, categories or routes.

## Scope

- Require an explicit Business Type selection before queue loading.
- Send `businessType` with every queue request, including status, reviewer and pagination actions.
- Display the source store Business Type on every Candidate row.
- Preserve search, status, sorting, pagination and reviewer workload.
- Keep Candidate review read-only until an item is opened.

## Business Types

- GENERAL
- IT
- ELECTRONICS
- CONSTRUCTION
- GROCERY

## Deferred

- Automatic Product discovery and matching.
- Candidate grouping/fingerprinting.
- Template Catalog management.
- Business Type administration.

## Verification

`npx vitest run tests/product-template-business-type-filter-slice-2.contract.test.js`
