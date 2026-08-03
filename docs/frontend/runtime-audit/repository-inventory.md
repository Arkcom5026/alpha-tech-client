# Verified Frontend Repository Inventory

Status: VERIFIED FROM PROVIDED `src` SNAPSHOT

## 1. Evidence Boundary

This inventory was produced from the uploaded frontend `src` snapshot and is intentionally limited to facts observable inside that snapshot. Package-manager metadata, build configuration outside `src`, and runtime behavior were not inferred.

Observed snapshot totals:

- 757 files
- 458 directories
- 55 top-level feature modules under `src/features`
- 484 `.jsx` files
- 264 `.js` files
- 4 `.css` files
- 1 `.tsx` file
- 1 `.ts` file

## 2. Top-Level Structure

```text
src/
├── assets/
├── components/
│   ├── auth/
│   ├── common/
│   ├── shared/
│   ├── ui/
│   └── upload/
├── config/
├── features/
├── hooks/
├── layouts/
├── lib/
├── pages/
├── routes/
├── store/
├── styles/
├── utils/
├── App.jsx
├── main.jsx
├── index.css
├── input.css
└── stripe.css
```

## 3. Architectural Classification

### Application Bootstrap

- `src/main.jsx`
- `src/App.jsx`
- `src/routes/AppRouter.jsx`

`main.jsx` currently performs a clean bootstrap role: global styles, application mount, and `App` render. Auth and branch lifecycle decisions are intentionally delegated away from bootstrap.

### Cross-Cutting Runtime Candidates

- `src/store/rootStore.js`
- `src/store/themeStore.js`
- `src/store/gateStore.js`
- `src/hooks/usePermission.js`
- `src/utils/apiClient.js`
- `src/utils/uiHelpers.js`
- `src/components/shared/error/ErrorBoundary.jsx`
- `src/components/shared/display/LoadingSpinner.jsx`
- shared dialogs under `src/components/shared/dialogs`

These are candidates for runtime standardization. They are not automatically authorized to own module workflow.

### Design-System Primitive Candidates

`src/components/ui` contains 19 files, including:

- button
- input
- label
- textarea
- select
- checkbox
- card
- badge
- table
- dialog
- alert-dialog
- tabs
- tooltip
- scroll-area
- skeleton
- calendar
- form
- icons

The implementation style is consistent with Radix/shadcn-derived primitives and semantic CSS variables.

### Shared Composition Candidates

`src/components/shared` contains 21 files covering:

- barcode rendering
- standard action buttons
- confirmation and information dialogs
- empty/loading states
- error boundary
- reusable form sections and cascading selections
- media management
- page header
- shared data table

Every item in this layer must be classified as either neutral composition or workflow-bound behavior before migration. Existing location alone does not prove that sharing is architecturally correct.

### Module-Owned Features

There are 55 top-level feature modules. Representative domains include:

- auth, branch, employee, position
- customer, supplier, bank
- product, category, brand, unit, barcode
- stock, stockItem, stockAudit
- sales, pos, payment, refund, saleReturn
- purchaseOrder, purchaseOrderReceipt, quickReceive
- repair
- finance and reports
- settings and superadmin

These modules retain ownership of their workflows, pages, forms, transitions, module-specific validation presentation, and operational decisions.

## 4. State Management

Observed Zustand usage:

- `zustand` imports across many feature stores
- `zustand/middleware` usage for persisted state
- root-level stores for theme, gates, bank, and root composition

Architecture decision:

- Feature state remains feature-owned.
- Cross-cutting runtime state is permitted only when behavior is truly repository-wide.
- No central store may absorb module workflow merely to make migration easier.

## 5. Routing and Permissions

Observed runtime surfaces:

- `src/routes/AppRouter.jsx`
- partner and superadmin route groups
- `src/hooks/usePermission.js`
- RBAC utilities and feature auth stores

Migration must preserve route identity, guard order, permission semantics, and redirect behavior.

## 6. Styling and UI Technology

Observed technologies and patterns:

- Tailwind directives in `src/index.css`
- semantic CSS variables for light/dark themes
- Radix UI primitives
- class-variance-authority
- `clsx` + `tailwind-merge`
- Lucide icons
- React Icons
- limited Material UI usage
- feature and surface-specific CSS files

Observed evidence counts:

- 212 files contain raw `<button>` usage
- 19 files contain hard-coded hexadecimal colors
- 7 files contain Tailwind arbitrary hexadecimal color classes
- 5 files import Material UI
- 11 files reference Radix packages

These values identify migration surface; they do not prove defects individually.

## 7. Feedback and Async Runtime

Observed evidence:

- `react-toastify` appears in 12 files
- loading text, spinner components, or `animate-spin` patterns appear in 111 files
- shared processing and confirmation dialogs exist
- error normalization currently exists partly in `parseApiError`

Current risk:

Feedback, loading, duplicate-submit prevention, API error projection, and confirmation behavior are distributed rather than governed by one runtime contract.

## 8. Existing Strengths

- Clear feature-module structure
- Existing neutral primitive foundation
- Semantic light/dark CSS variables already present
- Established Zustand pattern
- Shared error, loading, dialog, page-header, and table building blocks
- Bootstrap comments already reinforce lifecycle ownership boundaries

The migration should evolve these foundations rather than replace them wholesale.

## 9. Primary Structural Risks

1. `components/common`, `components/shared`, and `components/ui` overlap semantically.
2. Raw buttons remain widespread despite a primitive `Button`.
3. Multiple feedback and loading patterns can produce inconsistent behavior.
4. Limited MUI usage introduces a second component language.
5. Theme state toggles the DOM class but initial hydration behavior requires verification.
6. Shared components may contain workflow coupling that must not be generalized further.
7. Mixed `.jsx`, `.js`, `.tsx`, and `.ts` sources require compatibility-first migration.

## 10. Target Ownership Map

```text
src/features/*
  owns workflow-specific UI and behavior

src/components/ui/*
  owns neutral low-level primitives

src/components/shared/*
  owns proven neutral compositions only

src/runtime/* (planned)
  owns cross-cutting presentation/runtime policy

src/styles/* and semantic CSS variables
  own tokens and global presentation rules
```

`src/runtime` is a planned boundary, not evidence of an existing directory.

## 11. Migration Entry Decision

The repository is suitable for an evolutionary migration:

1. formalize semantic tokens around the existing variable foundation
2. stabilize neutral primitives
3. introduce runtime adapters for feedback, errors, loading, and confirmations
4. prove the approach on representative low-risk surfaces
5. migrate horizontally by UI concern
6. migrate high-risk transactional workflows only with runtime and operational evidence

## 12. Verification Status

Repository structure: VERIFIED

Source-level usage counts: VERIFIED

Package versions: NOT VERIFIED FROM THIS SNAPSHOT

Build/typecheck/tests: NOT EXECUTED

Browser/mobile behavior: NOT VERIFIED

Backend/API compatibility: NOT CHANGED
