# templateCandidate module

Frontend scaffold for Mission C — Local Product Evolution.

## Important

`schema.prisma` provided in this task does not currently contain a `ProductTemplateCandidate` model.  
This module is therefore FE-ready scaffolding with expected API contracts, not a guarantee that backend endpoints already exist.

## Suggested placement

```txt
src/features/product/templateCandidate/
```

## Expected backend API contract

```txt
GET    /api/products/template-candidates
GET    /api/products/template-candidates/:id
POST   /api/products/template-candidates
PATCH  /api/products/template-candidates/:id/status
POST   /api/products/template-candidates/:id/promote
POST   /api/products/template-candidates/:id/reject
POST   /api/products/template-candidates/:id/request-revision
POST   /api/products/template-candidates/:id/merge-existing
```

## Mission C doctrine

```txt
Local Operational Product = usable by branch immediately
Product Template Candidate = catalog proposal for later admin review
Template Catalog = central approved catalog
```

Branch receiving flow should not wait for Catalog approval.
