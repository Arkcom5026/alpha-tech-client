# Missing Cost Resolution — Frontend Capability Audit

Related issue: #59
Related PR: #60

## Purpose

Establish the exact client integration contract before implementing the user-facing Missing Cost Resolution workflow.

## Current Client Authority

- Router authority: `src/App.jsx` creates a `createBrowserRouter` from `src/routes/AppRouter.jsx`.
- POS route ownership: `src/routes/partner/posPartnerRoutes.jsx` mounts the authenticated POS tree behind `ProtectedRoute`.
- Stock route ownership: `src/routes/partner/stockRoutes.jsx` owns all stock workspace routes.
- Authenticated API authority: `src/utils/apiClient.js` provides bearer-token attachment, refresh coordination, bootstrap gating, cookie-safe requests, and normalized `/api` routing.
- UI stack: React 18, React Router 7, TanStack Query, Zustand, Tailwind/ADS-compatible primitives, MUI, Lucide, Vitest, Testing Library, and Playwright.

## Certified Backend API Surface

Base path:

`/api/inventory-recovery/missing-cost-resolutions`

### Read

- `GET /queue`
- `GET /:resolutionId`
- `GET /:resolutionId/audit-history`

### Mutation lifecycle

- `POST /`
- `POST /:resolutionId/evidence-versions`
- `POST /:resolutionId/transitions`

### Recovery

- `GET /:resolutionId/recovery-preview`
- `GET /:resolutionId/recovery-approval-plan`
- `POST /:resolutionId/recovery-execution`
- `GET /:resolutionId/recovery-audit`

All routes require authenticated branch authority through the server token middleware. The client must not submit or infer `branchId` as business authority.

## Frontend Ownership Decision

Create one dedicated vertical feature:

`src/features/inventoryRecovery/missingCostResolution/`

Proposed slices:

- `api/`
- `contracts/`
- `queue/`
- `detail/`
- `evidence/`
- `review/`
- `recovery-preview/`
- `recovery-execution/`
- `audit/`
- `shared/`

Workflow components remain inside this feature. Only neutral ADS primitives may be shared outside it.

## Route Contract

Mount under the existing stock route owner:

- `/:shopSlug/pos/stock/missing-cost-resolutions`
- `/:shopSlug/pos/stock/missing-cost-resolutions/:resolutionId`

The queue page owns filtering and navigation. The detail page owns lifecycle actions, preview, plan, execution confirmation, and audit projection.

## API Client Contract

Use only `src/utils/apiClient.js`.

Rules:

- Never call `axios` directly from feature pages.
- Never trust a client-cached plan for execution.
- Always request a fresh preview and plan immediately before confirmation.
- Generate a fresh idempotency key for each user-confirmed execution attempt and retain it across request retries.
- Map server error codes into explicit UI states: forbidden, stale, conflict, duplicate, validation, and non-leaking not-found.
- Invalidate queue/detail/audit queries after lifecycle transitions and successful execution.

## Permission Contract

The server remains the final authority. The UI may hide or disable actions using authenticated session role/capability data, but it must handle 403 responses without assuming the client permission check is sufficient.

Required action groups:

- Prepare: create draft, append evidence, submit.
- Review: start review, approve, reject, return.
- Recovery: preview, plan, explicit execution confirmation.
- Audit: read-only after execution.

## UX Contract

Required states:

- Loading
- Empty queue
- Non-leaking not found
- Forbidden
- Validation error
- Stale preview/plan
- Optimistic conflict
- Duplicate execution
- Successful transition
- Successful recovery execution

Desktop uses a queue/detail workspace. Mobile uses stacked cards and a sticky action area. No direct StockBalance editor is allowed.

## Safety Findings

1. The certified execution endpoint exists, but Production enablement remains a backend operational-policy gap. The frontend must not present execution as available until the server exposes an authorized Production-safe capability.
2. Queue/detail and lifecycle UI can be implemented without Production mutation.
3. Preview and approval-plan UI are read-only and safe to implement immediately.
4. Runtime E2E execution evidence must use controlled authority and must not perform an uncontrolled Production mutation during development or certification.

## Increment 1 Completion

Capability audit is complete when:

- Router owner is identified.
- Stock route owner is identified.
- Auth/API client authority is identified.
- Backend endpoint matrix is recorded.
- Feature ownership and route contract are fixed.
- Production execution gap is explicitly carried into the controlled-execution increment.

No runtime UI or database mutation is introduced by this increment.
