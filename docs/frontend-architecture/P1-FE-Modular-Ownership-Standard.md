# P1 Frontend Modular Ownership Standard

## Status
Architecture program baseline for the P1 frontend elevation.

## Reference Module
Purchase Order is the first production module used to prove this standard.

## Core Principle
One responsibility has one canonical owner. Owners communicate through explicit contracts and must not reach across another owner's boundary to perform its work directly.

## Ownership Model

### UI / Pages / Components
Own user interaction and presentation.

Allowed:
- render UI
- collect input
- show loading, errors, and results
- send user intent to the workflow owner

Not allowed:
- call transport clients directly
- construct persistence-shaped payloads
- decide business policy in JSX
- own cross-page runtime state without a clear reason

### Controllers / Workflow Hooks
Own workflow coordination.

Allowed:
- coordinate local state, API calls, navigation, and feedback
- invoke builders, policies, mappers, and projections
- expose UI-ready commands and state

Not allowed:
- duplicate API transport
- embed reusable domain rules
- render workflow UI

### API
Own communication with backend services.

Allowed:
- endpoint paths
- HTTP verbs
- request transport
- response/error transport normalization

Not allowed:
- UI formatting
- domain policy decisions
- page navigation

### Contracts
Own communication shapes between layers and external systems.

Examples:
- create command input
- update command input
- API result shape
- normalized failure shape

### Builders
Own construction of commands and API payloads from internal state.

A builder must not call APIs or mutate React state.

### Policies
Own decisions and permission rules.

Examples:
- can edit a purchase order
- can receive a purchase order
- can cancel or print

Policies must be pure wherever possible.

### Mappers
Own transformation between external/API records and internal module models.

Mappers must not format data specifically for one visual surface.

### Projections
Own transformation from internal models into UI-ready view models.

Examples:
- list row projection
- detail summary projection
- status label projection

### Models
Own stable internal concepts and normalized module data structures.

### Stores / Runtime
Own shared client runtime state only when multiple consumers truly need the same state across component or route boundaries.

A store must not become the default home for form state, API transport, domain rules, and presentation logic simultaneously.

### Shared Components
Workflow-bound components stay inside the owning module or workflow.

A component may become shared only when it is a neutral primitive and reuse is proven not to introduce coupling or side effects.

## Dependency Direction

Preferred direction:

```text
Page / Component
    -> Controller / Workflow Hook
        -> Policy / Builder / Mapper / Projection
        -> API
```

Data returns through normalization and projection before rendering.

Prohibited examples:
- UI -> raw HTTP client
- UI -> persistence DTO
- Repository-shaped data rules inside JSX
- API module -> React state or navigation
- mapper -> UI component
- policy -> API side effect

## Workflow Ownership
A workflow may own its page, controller, hooks, components, and validation when those artifacts are specific to that workflow.

Examples:

```text
purchaseOrder/
  list/
  create/
  edit/
  detail/
  print/
```

Cross-workflow code moves to a module-level owner only when it represents a genuinely shared module responsibility.

## Migration Rule

```text
Behavior remains.
Ownership may move.
Public routes remain.
Backend contracts remain.
Legacy paths are removed only after consumers are verified.
```

Temporary compatibility bridges are allowed during migration but must have a removal condition and must not become permanent architecture.

## Verification Gates

### Repository Gate
- canonical owner exists
- dependency direction is correct
- public exports and routes are preserved
- legacy consumers are accounted for
- no duplicate owner remains

### Runtime Gate
- install/build/lint/typecheck/tests as applicable
- route imports resolve
- workflow executes without runtime errors

### Operational Gate
- browser/user flow reaches the backend and persistence boundary correctly
- status policy and data results are correct
- related downstream workflows remain intact

Repository review must never be represented as runtime or operational certification.

## Reference Outcome
After Purchase Order passes all gates, its proven structure and migration evidence will become the reference used to elevate other P1 frontend modules.
