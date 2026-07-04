# P1 Backend Migration Playbook — คู่มือปฏิบัติการย้าย Backend Legacy

Status: APPROVED / PLAYBOOK

Source: Mission B Product Runtime migration

Companion docs:

- `docs/blueprint/P1-RUNTIME-MIGRATION-DOCTRINE.md`
- `docs/blueprint/P1-BACKEND-MODULE-STANDARD.md`

---

## 1. Purpose

This playbook describes how to migrate a backend workflow from legacy route/controller-heavy structure into the P1 module architecture.

It is not only a doctrine. It is the practical step-by-step process proven during Mission B.

Use this playbook when migrating backend modules such as Product, Stock, Purchase, Sales, Customer, Supplier, or Finance.

---

## 2. Non-Negotiable Rules

During migration:

- Do not rewrite a working workflow from zero.
- Do not change API contract unless explicitly assigned.
- Do not move all files at once.
- Do not introduce unrelated features.
- Do not mix Mission boundaries.
- Do not commit unrelated files.
- Do not let route/controller keep business logic after service extraction.
- Do not create repository too early if service responsibility is still unclear.

---

## 3. Playbook Overview

Default migration flow:

```txt
Boot
-> Scope Lock
-> Legacy Scan
-> Capability Map
-> Service Extraction
-> Adapter Conversion
-> Route Cleanup
-> Repository Extraction
-> Checkpoint
-> Audit
-> Module Relocation
-> Legacy Retirement
```

Each phase should be small enough to review and rollback.

---

## 4. Phase 0 — Boot

Read before editing:

- Active Blueprint
- mission workspace / blackboard if applicable
- runtime migration doctrine
- backend module standard
- current assignment / scope
- relevant source files

Goal:

```txt
Understand the current runtime truth before changing code.
```

Output:

- confirmed scope
- target workflow
- affected files
- non-goals

---

## 5. Phase 1 — Scope Lock

Define exactly what this migration round owns.

Example:

```txt
This round migrates Product Runtime Search only.
It does not change QuickStock receive.
It does not change Candidate governance.
It does not change FE routes.
```

Scope lock prevents a safe refactor from becoming a broad rewrite.

---

## 6. Phase 2 — Legacy Scan

Inspect legacy route/controller/service files.

Look for:

- Prisma queries in controller
- transactions in route/controller
- response mapping in controller
- business validation in route/controller
- duplicated runtime helper functions
- branch scoping rules
- hidden API contract expectations

Document findings by capability, not by file.

Bad grouping:

```txt
productController.js is large
```

Good grouping:

```txt
Operational Product Search still owns query/mapping in controller
Local Product Create still owns transaction in route
Ready-to-Sell still owns runtime query in controller
```

---

## 7. Phase 3 — Capability Map

Group legacy logic into capabilities.

Mission B example:

```txt
Operational Product Search
Operational Product Detail
Runtime Lookup by Template
Local Operational Product Create
Template Clone to Operational Product
Ready-to-Sell Runtime
Barcode / Serial Runtime Lookup
```

Choose the next capability by:

- highest legacy complexity reduction
- lowest contract risk
- clearest ownership
- easiest verification

---

## 8. Phase 4 — Service Extraction

Create or extend module service:

```txt
src/modules/<domain>/services/<capability>Service.js
```

or central runtime service when one capability group owns the domain:

```txt
src/modules/product/services/operationalProductRuntimeService.js
```

Move into service:

- business validation
- runtime decision
- orchestration
- response meaning
- temporary response shaping helpers
- Prisma calls only until repository boundary is clear

Keep public API response identical.

Do not move controller file yet.

---

## 9. Phase 5 — Adapter Conversion

After moving a capability into service, turn the legacy controller/route function into an adapter.

Adapter allowed behavior:

```txt
read req
call service
choose status
return JSON
normalize known errors
```

Adapter forbidden behavior:

```txt
Prisma query
transaction
business decision
runtime mapping
large validation blocks
```

---

## 10. Phase 6 — Route Cleanup

After route-level capabilities move into services, remove dead helpers from route files.

Remove only when verified unused:

- local mapper
- local select helper
- local fetch helper
- direct Prisma import
- duplicate parser/normalizer

Mission B example:

After `create-local` and `create-from-template` were moved into service, `routes/productRoutes.js` was cleaned so route became routing + adapter only.

---

## 11. Phase 7 — Repository Extraction

Start repository extraction only when service responsibility is stable.

Create:

```txt
src/modules/<domain>/repositories/<capability>Repository.js
```

Move into repository:

- Prisma find/create/update/upsert
- select/include fragments
- transaction wrapper/helper
- persistence helpers
- query fragments

Keep in service:

- business rule
- runtime decision
- validation
- orchestration
- response meaning

Recommended sequence:

```txt
Repository foundation
-> read query extraction
-> persistence helper extraction
-> transaction boundary extraction
```

Do not move all queries and transactions in one uncontrolled pass.

---

## 12. Phase 8 — Checkpoint

After each meaningful phase:

```txt
git status
git diff --cached --stat
git commit -m "..."
git push
```

Before commit, verify that only scoped files are staged.

Do not commit:

- database backups
- temporary files
- scratch files
- unrelated modules
- generated files unless explicitly required

If a broad accidental commit is created:

```txt
git reset --soft HEAD~1
git reset
git add <scoped files only>
git commit -m "scoped message"
```

---

## 13. Phase 9 — Audit

Audit after service/repository migration before module relocation.

Audit dimensions:

### Route audit

- Does route contain Prisma?
- Does route contain business helper?
- Does route only register endpoints and call adapters?

### Controller audit

- Does controller contain Prisma?
- Does controller contain business decisions?
- Is controller mostly HTTP adapter?

### Service audit

- Does service contain direct HTTP concerns?
- Does service own business/runtime decision?
- Are remaining Prisma calls justified or ready for repository extraction?

### Repository audit

- Does repository contain business rule?
- Does repository only handle data access and persistence?
- Are select/include definitions centralized?

### Runtime boundary audit

- Is Operational Runtime separate from Template Catalog?
- Is Candidate governance separate from branch runtime?
- Is branch scoping preserved?

---

## 14. Phase 10 — Module Relocation

Move controller into module only after it is already thin:

```txt
controllers/<legacyController>.js
-> src/modules/<domain>/controllers/<controller>.js
```

Move route into module only after route-level business logic is gone:

```txt
routes/<legacyRoutes>.js
-> src/modules/<domain>/routes/<routes>.js
```

At this phase, changes should be mostly structural.

Avoid behavior change during relocation.

---

## 15. Phase 11 — Legacy Retirement

Retire legacy only after module route/controller works and parity is verified.

Remove:

- unused legacy exports
- dead helper functions
- unused imports
- duplicate route registrations
- compatibility adapters no longer needed

Do not remove compatibility endpoints if FE or external callers may still use them.

Mark compatibility endpoint first if needed.

---

## 16. Verification Checklist

For every migration checkpoint, test the workflow that was touched and one adjacent workflow.

Minimum backend verification:

- server starts
- target endpoint works
- expected success response shape remains stable
- expected error response still works
- branch scoping still works
- adjacent endpoint still works

Mission B examples:

```txt
GET /api/products/pos/search
GET /api/products/pos/runtime-by-template/:templateProductId
POST /api/products/pos/create-local
POST /api/products/pos/create-from-template
GET /api/products/ready-to-sell
GET /api/products/ready-to-sell/structured/:productId
```

---

## 17. Naming Guidance

Name services by capability:

```txt
OperationalProductRuntimeService
ProductReceiveService
BranchPricingService
CandidateProductService
```

Name repositories by data boundary:

```txt
OperationalProductRuntimeRepository
ProductReceiveRepository
BranchPricingRepository
CandidateProductRepository
```

Avoid generic names:

```txt
CommonService
ProductControllerService
ProductApiService
HelperService
```

---

## 18. Mission B Reference Timeline

Mission B migration checkpoints:

1. Runtime lookup extraction
2. Operational product search/detail extraction
3. Local operational product create extraction
4. Template clone extraction
5. Product routes cleanup
6. Ready-to-sell runtime extraction
7. Repository foundation
8. Repository read-query expansion
9. Repository persistence helper expansion
10. Final architecture audit
11. Module relocation
12. Legacy retirement

Use this timeline as the default model for future migrations.

---

## 19. Final Rule

The goal of backend migration is not to make files look new.

The goal is to move responsibility into the correct runtime layer while preserving proven behavior.

Capability first.

Layer second.

Relocation last.
