# ASSIGNMENT-031 — Mission B Backend Contract Review

Mission: Mission B
Role: BE-01 Backend Runtime Owner
Status: ACTIVE
Implementation: NOT APPROVED
Code Changes: FORBIDDEN

## Objective

Review backend contracts that still affect Mission B closure.

This is a review-only assignment.

## Context

FE-01 reported that Backend confirmation is still useful for:

```txt
Local product creation safeguards
Product Detail response shape
Operational product search query contract
```

## Scope

Inspect backend source and report facts for:

### 1. Local product creation safeguards

Confirm how `POST /api/products/pos/create-local` handles repeated or similar branch products.

### 2. Product Detail response shape

Confirm whether `GET /api/products/:id?v=full` returns the correct branch Operational Product shape for runtime Product Detail.

### 3. Operational search query contract

Confirm the canonical query parameter for `GET /api/products/pos/search`.

Clarify whether frontend should use:

```txt
search
searchText
both
```

## Constraints

```txt
Do not change code.
Do not create migration.
Do not alter QuickStock receive.
Do not implement Template Promotion.
Do not create assignments for other roles.
```

## Deliverable

Create report:

```txt
docs/mission-b/inbox/BE-01/RUNTIME-CONTRACT-CONFIRMATION-001.md
```

Report must include:

```txt
PASS/NEEDS_DECISION
Files inspected
Local product creation safeguard result
Product Detail response shape result
Operational search query contract result
Backend blockers for Mission B closure
Recommended next owner
```

## Completion Response

```txt
Report path:
PASS/NEEDS_DECISION:
Files inspected:
Backend blockers:
Next recommended owner:
```