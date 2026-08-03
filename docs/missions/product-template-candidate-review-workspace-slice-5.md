# ProductTemplate Candidate Review Workspace — Slice 5

## Base authority

- Client base SHA: `9faf3df5c8bd88ea7794fc4b2d157f7c611c9972`
- Backend dependency: ProductTemplate Candidate Review Queue Slice 4 contract PASS at `0aa6ea08318d1e4da73b2de525a86401c5568927`

## Goal

Replace the legacy Candidate review surface with a SUPERADMIN workspace aligned to the current backend contract:

- `DRAFT -> UNDER_REVIEW`
- `UNDER_REVIEW -> REJECTED`
- `UNDER_REVIEW -> MERGED`
- `UNDER_REVIEW -> PROMOTED`

## Current mismatch to retire

The existing client page uses obsolete status/action semantics such as `SUBMITTED` and `REQUEST_REVISION`. These must not remain runtime authority for ProductTemplateCandidate.

## Slice order

1. API client and query state aligned to `/api/product-templates/candidates`
2. Review queue shell with summary, search, filters, sorting and pagination
3. Candidate detail workspace with catalog-safe snapshot and event timeline
4. Start Review and Reject actions
5. Merge and Promote actions with explicit forms and confirmation
6. Targeted contract verification

## Route authority

- `/superadmin/catalog/candidates`
- `/superadmin/catalog/candidates/:id`
- Preserve optional tenant-prefixed Superadmin route behavior already supported by the application shell.

## Safety boundaries

- SUPERADMIN-only UI surface
- Never display stock, serial instance, price, cost, supplier, customer, sale, purchase, tax, repair, claim, reservation or media transaction data
- Do not mutate source Product
- Do not fabricate `APPROVED`, `SUBMITTED` or `REQUEST_REVISION` states
- No Prisma or backend changes in this PR
- No merge/deploy before exact-SHA verification

## Deliverables

- Candidate API module
- Candidate review store/hook aligned to current response contract
- Queue page
- Detail page
- Reject/Merge/Promote dialogs or forms
- Route integration
- Targeted contract test
