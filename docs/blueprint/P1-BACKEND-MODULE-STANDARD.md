# P1 Backend Module Standard — มาตรฐานโครงสร้าง Backend Module

Status: APPROVED / REFERENCE STANDARD

Source: Mission B Product Runtime migration

Scope: P1 backend modules and future runtime migrations

---

## 1. Purpose

This standard defines the target backend module structure for P1.

It is extracted from the proven Mission B migration, where Product Runtime was migrated from legacy route/controller logic into a layered runtime module without changing API contracts.

This standard should be used as the default reference for future backend module migration and new backend module development.

---

## 2. Target Module Shape

Preferred structure:

```txt
src/modules/<domain>/
  routes/
  controllers/
  services/
  repositories/
  validators/
  constants/
  utils/
  index.js
```

Not every folder is required from the beginning.

Create folders only when the responsibility exists.

Minimum migrated runtime module usually starts with:

```txt
src/modules/<domain>/
  services/
  repositories/
```

Then controllers/routes are moved later after legacy adapters are thin enough.

---

## 3. Layer Responsibilities

### routes

Responsibility:

- Register HTTP endpoints.
- Attach middleware.
- Connect endpoint path to controller or temporary adapter.

Allowed:

- `router.get/post/patch/delete(...)`
- route-level middleware wiring
- thin temporary adapter during migration

Forbidden:

- Prisma queries
- transactions
- runtime mapping
- business decisions
- response-shaping logic beyond temporary migration adapter

---

### controllers

Responsibility:

- Act as HTTP adapter.
- Read `req`.
- Call service.
- Choose HTTP status when needed.
- Return response.
- Normalize known errors.

Allowed:

- request parameter extraction
- `req.user` / auth context extraction
- `res.status(...).json(...)`
- mapping service errors to HTTP responses

Forbidden:

- Prisma queries
- database transactions
- domain business rules
- runtime decision logic
- heavy response shaping

---

### services

Responsibility:

- Business rule
- runtime decision
- orchestration
- validation at workflow level
- response meaning
- capability ownership

Allowed:

- deciding mode/state/flow
- enforcing branch runtime rules
- composing repository calls
- building runtime response meaning
- mapping domain objects to runtime contract when no shared mapper is needed

Forbidden:

- direct HTTP dependency
- direct `req` / `res`
- transport-specific status handling
- broad raw Prisma logic once repository exists

Service names should be capability-based, not controller-based.

Good examples:

```txt
OperationalProductRuntimeService
ProductReceiveService
CandidateProductService
BranchPricingService
```

Avoid:

```txt
ProductControllerService
ProductApiService
TempService
```

---

### repositories

Responsibility:

- Data access boundary.
- Prisma query.
- select/include definitions.
- persistence helpers.
- transaction helpers.

Allowed:

- Prisma model calls
- `findFirst`, `findMany`, `create`, `update`, `upsert`
- transaction wrapper/helper
- select/include fragments
- query fragments

Forbidden:

- HTTP logic
- `req` / `res`
- user-facing response shape
- business decision such as whether a workflow is allowed
- operational runtime meaning beyond data retrieval/persistence

Repository functions should be named by data intent.

Examples:

```txt
findOperationalProductDetailById
findOperationalProductList
createLocalOperationalProductRecord
upsertBranchPriceForProduct
```

---

### validators

Responsibility:

- Request/body/query validation.
- Field-level validation.
- Input normalization where appropriate.

Allowed:

- schema validation
- parsing primitives
- field requirement checks

Forbidden:

- data access
- workflow decisions
- persistence

Validators may be introduced only when repeated input validation becomes large enough to justify separation.

---

### constants

Responsibility:

- Domain constants.
- enums not already represented by Prisma.
- stable runtime codes.

Allowed:

- status constants
- error code constants
- mode constants

Forbidden:

- mutable runtime state
- functions with data access

---

### utils

Responsibility:

- Pure helper functions scoped to the domain.

Allowed:

- pure transformation
- number/string normalization
- safe date/quantity calculations

Forbidden:

- Prisma
- HTTP
- runtime state mutation
- business orchestration

---

### index.js

Responsibility:

- Optional module entry point.
- Export routes or module metadata when the module is ready.

Do not introduce `index.js` early if it does not simplify module mounting.

---

## 4. Dependency Rule

Default dependency direction:

```txt
Route
  -> Controller
    -> Service
      -> Repository
        -> Prisma
```

Allowed temporary migration path:

```txt
Legacy Route
  -> Legacy Controller or Adapter
    -> Module Service
      -> Module Repository
        -> Prisma
```

Forbidden dependencies:

```txt
Route -> Repository
Route -> Prisma
Controller -> Repository
Controller -> Prisma
Repository -> Service
Repository -> Controller
Repository -> HTTP response
```

Service may call multiple repositories when orchestration needs it.

Repository must not call service.

---

## 5. Runtime Boundary Rule

Operational Runtime, Template Catalog, and Candidate Governance must remain separate.

Operational runtime modules may read or write operational products and branch runtime state.

Template catalog modules may search or manage approved template records.

Candidate modules may create and review proposals, but should not block branch operational use.

Mission B reference boundary:

```txt
Operational Product Runtime = branch runtime source of truth
Template Product = search/clone source only
Candidate = Mission C governance proposal
```

---

## 6. Capability First, Layer Second

Migration should start by extracting a business capability, not by mechanically splitting files.

Preferred order:

```txt
Capability identification
-> Service extraction
-> Adapter conversion
-> Route cleanup
-> Repository extraction
-> Controller relocation
-> Route relocation
-> Legacy retirement
```

Do not start by creating all folders and moving all files at once.

A module becomes clean by moving real responsibility step by step.

---

## 7. Migration Acceptance Criteria

A backend module migration checkpoint is acceptable when:

- route path is unchanged unless explicitly assigned
- API response keys are preserved
- HTTP status behavior is preserved
- branch scoping is preserved
- service owns business/runtime decision
- repository owns Prisma access
- controller is thin adapter
- route has no business logic
- unrelated files are not staged
- rollback checkpoint exists

---

## 8. Mission B Reference Implementation

Mission B Product Runtime is the first reference implementation of this standard.

Reference files in `alpha-tech-server`:

```txt
src/modules/product/services/operationalProductRuntimeService.js
src/modules/product/repositories/operationalProductRuntimeRepository.js
controllers/productController.js
routes/productRoutes.js
```

Mission B proved that legacy runtime migration can be done without a big-bang rewrite.

The route/controller remained stable while runtime capability moved into service and repository layers.

---

## 9. Default Rule for Future Modules

Future backend modules should follow Mission B unless there is a clear reason not to.

The default migration question is:

```txt
What capability is this workflow responsible for?
```

not:

```txt
Which old file should be moved first?
```

This keeps migration aligned with runtime truth rather than legacy file shape.
