# Alpha-Tech Frontend Architecture Authority

Status: ACTIVE AUTHORITY  
Scope: `Arkcom5026/alpha-tech-client`  
Branch: `refactor/frontend-runtime-design-system-v1`  
Tracking: Issue #10 / Draft PR #11

## 1. Purpose

This document is the architecture authority for the Alpha-Tech frontend. It governs new development, repository-wide standardization, migration decisions, review, and legacy retirement.

The objective is not merely visual consistency. The objective is a dependable frontend platform in which every module keeps ownership of its business workflow while consuming one shared presentation language and one shared set of cross-cutting runtime policies.

## 2. Authority Order

When guidance conflicts, use this order:

1. approved business workflow and backend contract
2. this Frontend Architecture Authority
3. `FRONTEND_RUNTIME_DESIGN_SYSTEM_V1.md`
4. module-specific design and implementation notes
5. existing implementation patterns

Existing code is evidence of current behavior, not automatic architecture authority.

## 3. Non-Negotiable Migration Invariants

The first standardization pass must not change:

- routes or navigation destinations
- backend endpoints or payload contracts
- permission decisions
- business validation rules
- workflow order
- successful business results
- module-owned post-success behavior
- persisted data semantics

Presentation structure and cross-cutting runtime implementation may change only when these invariants remain preserved.

## 4. Layer Model

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

### 4.1 Business Modules

Each module owns its end-to-end user workflow, including:

- feature pages and routes
- workflow-specific forms
- business-specific validation composition
- module API orchestration
- module state and transitions
- success destinations, reset behavior, printing, continuation, and closing behavior
- module-specific tables, dialogs, cards, and components when their meaning is tied to the workflow

Examples include Product, Sales, Purchase, Repair, Claim, Customer, Supplier, Employee, and Settings.

### 4.2 Frontend Runtime

The runtime layer owns neutral cross-cutting behavior:

- notification delivery policy
- error normalization and presentation policy
- loading and pending-state policy
- confirmation mechanics
- duplicate-submit protection
- neutral form-state helpers
- neutral request lifecycle helpers

The runtime must not decide business outcomes.

### 4.3 Design System

The design system owns neutral reusable presentation primitives and patterns:

- buttons and action groups
- form controls and field presentation
- cards and surfaces
- badges and status presentation primitives
- dialogs and drawers
- table presentation primitives
- empty, loading, and error states
- page and section layout primitives

A shared component is allowed only when its API remains business-neutral.

### 4.4 Design Tokens

Tokens are the source of truth for semantic visual values:

- colors and surfaces
- typography
- spacing
- control sizes
- radius
- elevation and shadow
- focus treatment
- motion
- z-index
- breakpoints

## 5. Module Ownership Rule

A module must retain components that encode any of the following:

- domain terminology
- workflow order
- business decisions
- business permissions
- business-state transitions
- domain-specific validation meaning
- API payload construction
- module-specific success or failure handling

Do not move workflow-bound components into `shared`, `common`, or the design system merely because they look similar.

Reuse must follow proven neutrality, not visual resemblance alone.

## 6. Shared Boundary Test

Before moving code into a shared layer, all answers below must be yes:

1. Can the component be named without a business-domain term?
2. Can it be used by multiple modules without conditional domain logic?
3. Does it avoid importing module services, stores, routes, contracts, or policies?
4. Does the caller retain ownership of workflow decisions?
5. Can its behavior be described as presentation or cross-cutting runtime policy?
6. Would changing one module's workflow leave the shared API unchanged?

If any answer is no, the component remains module-owned.

## 7. Dependency Direction

Allowed direction:

```text
module feature
  -> shared runtime adapter
  -> shared design-system primitive
  -> tokens / platform dependency
```

Forbidden direction:

```text
shared runtime/design system
  -> business module
```

Shared code must not import module pages, feature services, module stores, module routes, or domain contracts.

## 8. UI Composition Rules

- Pages compose module-owned workflow sections from neutral primitives.
- One primary action should be visually dominant per interaction region.
- Destructive actions must be visually distinct and must not become the default focus.
- Form fields follow label, control, hint, and validation-message order.
- Validation feedback appears near the responsible field whenever possible.
- Tables must provide explicit loading, empty, error, and populated states.
- Dialogs are used for decisions or blocking workflow requirements, not routine success messages.
- Mobile layouts must preserve action accessibility and workflow order.

## 9. State Management Rules

- Local ephemeral UI state stays local when no cross-feature ownership exists.
- Module workflow state stays inside the owning module or its approved store.
- Server state uses the repository's established server-state mechanism.
- Shared runtime state is limited to cross-cutting concerns such as notification delivery.
- Do not create a global store merely to avoid prop composition.
- Derived UI state should be computed rather than duplicated where practical.

## 10. Async and Submission Rules

Standard lifecycle:

```text
validate
-> prevent duplicate submission
-> enter pending state
-> call module-owned operation
-> normalize technical failure
-> present feedback
-> execute module-owned success transition
-> leave pending state
```

Requirements:

- pending actions expose a visible state
- repeated clicks cannot issue unintended duplicate operations
- controls are disabled only as broadly as required for safety
- stale responses must not overwrite newer user intent where concurrency is possible
- loading must not erase meaningful page context

## 11. Error Handling Rules

Shared error runtime may normalize technical categories such as:

- validation failure
- unauthenticated or expired session
- forbidden operation
- missing resource
- conflict or duplicate
- server failure
- network failure
- timeout
- offline state

The module remains responsible for domain-specific interpretation and recovery choices.

User-facing messages should be actionable Thai text. Raw stack traces or backend internals must not be the primary user message.

## 12. Notification Rules

- modules call an Alpha-Tech notification adapter, not a third-party engine directly
- success and informational feedback normally use auto-dismissing notifications
- validation feedback normally stays inline
- recoverable errors remain visible long enough to act upon
- confirmation dialogs are reserved for decisions
- informational success dialogs are deprecated unless acknowledgment is a real workflow requirement

## 13. Confirmation Rules

Confirmation is appropriate for:

- deletion
- irreversible removal
- reset that discards meaningful work
- archive or close operations
- irreversible state transitions
- dangerous stock or financial actions

The caller supplies business wording and owns the action. The shared layer owns only neutral dialog mechanics, focus behavior, and result delivery.

## 14. Accessibility Rules

All new and migrated UI must preserve or improve:

- keyboard access
- visible focus
- semantic labels
- programmatic form associations
- sufficient touch targets
- dialog focus containment and return
- status announcement where appropriate
- non-color-only communication of critical state
- responsive readability and action access

## 15. Responsive Rules

- mobile is a first-class runtime surface
- controls must remain inside their containers
- action groups may wrap without changing workflow priority
- tables need an explicit narrow-screen strategy
- dialogs must fit the viewport and allow internal scrolling
- safe-area and on-screen keyboard behavior must be considered for operational forms
- desktop behavior must not regress during mobile standardization

## 16. Naming and Folder Direction

Target direction, subject to repository inventory:

```text
src/shared/
  design-system/
    tokens/
    primitives/
    patterns/
  runtime/
    notification/
    error/
    loading/
    confirm/
    form/
    request/
```

Names must describe neutral responsibility. Domain terms belong under their owning modules.

## 17. Migration Method

Migration proceeds horizontally and incrementally:

1. repository audit and architecture authority
2. token foundation
3. neutral primitives
4. runtime adapters
5. controlled module migration
6. legacy retirement
7. repository, runtime, and operational verification

Each intermediate commit must remain reviewable and should remain deployable.

## 18. Legacy Retirement Rule

Legacy code may be removed only when:

- all runtime consumers have migrated
- no production import remains
- replacement behavior is verified
- routes and business outcomes remain preserved
- rollback evidence is available through Git history

Do not retain parallel standards indefinitely. During migration, mark ownership and retirement status explicitly.

## 19. Verification Gates

### Gate A — Repository

- changed paths are within approved scope
- no workflow ownership leaked into shared code
- dependency direction is valid
- public exports are intentional
- direct third-party runtime calls are reduced according to the migration plan
- legacy removal has no remaining imports

### Gate B — Runtime

- install state is valid
- lint/typecheck/build pass according to repository scripts
- automated tests pass
- no new console/runtime errors are introduced

### Gate C — Operational

- representative desktop and mobile flows pass
- create/update/delete or equivalent actions preserve outcomes
- validation and API failure paths remain usable
- duplicate-submit protection works
- loading and notification behavior is consistent
- dialog keyboard and focus behavior works
- module-owned post-success transitions remain unchanged

Repository review must not be described as Runtime or Operational completion without corresponding evidence.

## 20. Review Rejection Conditions

A change must be rejected or revised when it:

- changes business workflow under a standardization label
- introduces module conditions inside shared primitives
- replaces one arbitrary style with another undocumented arbitrary style
- creates a second competing runtime path
- removes legacy code before all consumers migrate
- claims full verification without runtime evidence
- moves workflow UI into shared code solely to reduce file count

## 21. Completion Definition

Frontend Runtime + Design System v1 is complete only when:

- repository inventory has accounted for production surfaces
- approved tokens and primitives are active
- cross-cutting runtime adapters are active
- modules retain workflow ownership
- direct legacy patterns are retired or explicitly documented as exceptions
- repository, runtime, and operational gates have accepted evidence
- future features have one clear standard to follow
