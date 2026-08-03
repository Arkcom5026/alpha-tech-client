# Frontend Runtime Audit — Architecture Overview

Status: W1 IN PROGRESS  
Mission: Repository Audit & Architecture Authority  
Scope: documentation and analysis only

## 1. Audit Objective

Establish a verified map of the current Alpha-Tech frontend before changing runtime behavior or visual implementation.

This wave does not authorize changes to business logic, API contracts, workflow order, routes, permissions, or business validation rules.

## 2. Current Authority Baseline

The frontend standardization program is governed by:

- `docs/frontend/FRONTEND_ARCHITECTURE_AUTHORITY.md`
- `docs/frontend/FRONTEND_RUNTIME_DESIGN_SYSTEM_V1.md`

The architecture target is:

```text
Business Modules
        |
        v
Frontend Runtime
        |
        v
Design System
        |
        v
Design Tokens
```

## 3. Audit Domains

Wave 1 audits the repository across the following domains:

### 3.1 Application Composition

- application entry points
- route registration
- page shells and layouts
- provider composition
- module boundaries
- shared/common directories

### 3.2 UI Foundation

- theme configuration
- global CSS
- Tailwind configuration and usage
- MUI usage
- Radix usage
- icon libraries
- local style utilities
- hardcoded visual values

### 3.3 Component Foundation

- buttons
- form controls
- cards
- tables
- dialogs and drawers
- badges and status indicators
- empty states
- loading states
- page/section headers
- action groups

### 3.4 Runtime Foundation

- notifications
- error parsing and presentation
- loading and pending state
- confirmation
- form submission lifecycle
- validation presentation
- duplicate-submit protection
- request lifecycle helpers

### 3.5 Supporting Infrastructure

- hooks
- providers
- contexts
- state stores
- utilities
- API clients
- feature-level adapters

## 4. Audit Method

Each discovered artifact will be classified by:

| Field | Meaning |
|---|---|
| Path | Repository path |
| Category | Component, runtime, token, utility, provider, module surface |
| Owner | Shared or named business module |
| Consumers | Known importing features/modules |
| Runtime role | Presentation, orchestration, business workflow, infrastructure |
| Duplication | None, similar, duplicate, competing implementation |
| Migration risk | Low, medium, high |
| Target | Keep, adapt, replace, merge, retire, investigate |
| Evidence status | Verified, partial, pending |

No inventory count will be presented as complete until repository evidence supports it.

## 5. Ownership Classification

### Shared-eligible

An artifact is shared-eligible when it is neutral, reusable without domain conditions, and does not own workflow decisions.

Examples:

- neutral button primitive
- neutral input presentation
- notification adapter
- technical error normalizer
- generic confirmation mechanics
- semantic tokens

### Module-owned

An artifact remains module-owned when it contains domain language, workflow order, business permissions, API payload decisions, business-state transitions, or module-specific success behavior.

Examples:

- sales payment form
- repair intake workflow
- product stock conversion dialog
- claim approval action group

### Investigate

An artifact is marked investigate when visual neutrality appears possible but dependency or behavior evidence is incomplete.

## 6. Dependency Model

The audit will map both allowed and observed dependencies.

Target dependency direction:

```text
Token
  -> Primitive
  -> Runtime/Pattern
  -> Feature
  -> Module Page
```

A simplified impact chain for migration planning:

```text
Button
  -> Form
  -> Dialog
  -> Feature
  -> Module
```

High-impact artifacts are those with broad fan-out, cross-module imports, provider-level placement, or responsibility for submissions, confirmations, errors, or route-level rendering.

## 7. Risk Model

### Low Risk

- documentation-only changes
- additive tokens not yet consumed
- isolated neutral primitive with no production replacement
- test or story coverage additions

### Medium Risk

- replacement of repeated visual components
- notification adapter introduction
- form-field presentation migration
- table and card standardization
- shared provider adjustment with limited behavior change

### High Risk

- POS/sales payment surfaces
- stock mutation and inventory operations
- destructive confirmations
- authentication/session behavior
- route shells and global providers
- request/error behavior used by many modules
- components with mixed presentation and business ownership

Risk is based on business impact and dependency fan-out, not file size alone.

## 8. Runtime Coverage Matrix Model

Coverage will be recorded per module using:

- `STANDARD` — uses an approved common path
- `PARTIAL` — mixed approved and legacy paths
- `LEGACY` — uses a known competing implementation
- `MISSING` — no explicit handling exists where required
- `N/A` — runtime concern does not apply
- `PENDING` — evidence not yet collected

Initial matrix structure:

| Runtime | Product | Sales | Purchase | Repair | Claim | Customer | Supplier | Employee | Settings |
|---|---|---|---|---|---|---|---|---|---|
| Notification | PENDING | PENDING | PENDING | PENDING | PENDING | PENDING | PENDING | PENDING | PENDING |
| Loading | PENDING | PENDING | PENDING | PENDING | PENDING | PENDING | PENDING | PENDING | PENDING |
| Error | PENDING | PENDING | PENDING | PENDING | PENDING | PENDING | PENDING | PENDING | PENDING |
| Confirm | PENDING | PENDING | PENDING | PENDING | PENDING | PENDING | PENDING | PENDING | PENDING |
| Form submission | PENDING | PENDING | PENDING | PENDING | PENDING | PENDING | PENDING | PENDING | PENDING |
| Validation UI | PENDING | PENDING | PENDING | PENDING | PENDING | PENDING | PENDING | PENDING | PENDING |

## 9. Planned W1 Deliverables

```text
docs/frontend/runtime-audit/
  architecture-overview.md
  repository-inventory.md
  component-inventory.md
  runtime-inventory.md
  design-token-audit.md
  migration-roadmap.md
  risk-analysis.md
```

Authority document:

```text
docs/frontend/FRONTEND_ARCHITECTURE_AUTHORITY.md
```

## 10. W1 Exit Criteria

Wave 1 is ready for architecture review when:

- every required document exists
- inventory claims are tied to repository evidence
- shared/module ownership is explicitly classified
- runtime coverage gaps are visible
- high-impact dependencies are identified
- migration ordering is justified by dependency and risk
- no production runtime file has been modified as part of W1

## 11. Current Progress

Completed:

- architecture authority established
- audit scope and classification model established
- risk and runtime coverage vocabulary established

Pending:

- repository path inventory
- component inventory
- runtime implementation inventory
- token and hardcoded-style audit
- dependency evidence
- migration roadmap
- consolidated risk analysis
