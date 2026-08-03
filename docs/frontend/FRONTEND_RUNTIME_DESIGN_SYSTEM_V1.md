# Alpha-Tech Frontend Runtime + Design System v1

Status: ACTIVE MIGRATION
Tracking: #10
Branch: `refactor/frontend-runtime-design-system-v1`

## 1. Mission

Standardize the complete production frontend so every page and form shares consistent visual language and runtime behavior without transferring business workflow ownership into shared code.

The target includes every save, create, update, delete, archive, reset, upload, import, export, approval, rejection, retry, and navigation action.

## 2. Permanent Architecture Rule

Each business module owns its workflow-specific UI and behavior. Shared infrastructure may own only neutral primitives and cross-cutting runtime policy.

```text
Business Module
  -> module-owned page/form/workflow
  -> neutral UI primitive or runtime adapter
  -> browser / API client
```

Shared components must not decide Product, Sales, Purchase, Repair, Claim, Customer, Supplier, Employee, or Settings workflow.

## 3. Standard Layers

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
```

Existing repository conventions may require path adjustment after inventory. Ownership rules remain unchanged.

## 4. Design Tokens

All production UI must consume semantic tokens instead of introducing local arbitrary values where a token exists.

Required token groups:

- semantic colors
- surfaces and borders
- typography roles
- spacing scale
- control height and density
- border radius
- elevation and shadow
- focus ring
- motion duration and easing
- z-index layers
- responsive breakpoints

## 5. Button Standard

Required variants:

- primary: save, create, confirm, continue
- secondary: alternate non-destructive action
- outline: lower-emphasis contextual action
- ghost: toolbar and compact action
- danger: delete, irreversible removal
- warning: exceptional risk action only
- link: navigation-style action

Required sizes:

- compact
- standard
- large/touch
- icon-only

Every button must consistently support:

- loading state
- disabled state
- focus-visible state
- keyboard activation
- icon alignment
- minimum touch target
- text wrapping policy
- mobile full-width behavior when appropriate
- duplicate-submit protection when used for async submission

Business pages must not encode new button colors or sizes directly after migration.

## 6. Form Standard

Each field follows:

```text
Label
Control
Hint (optional)
Validation message (optional)
```

Form submission lifecycle:

```text
validate
-> prevent duplicate submit
-> enter pending state
-> call API
-> normalize result/error
-> notify user
-> execute module-owned success transition
-> leave pending state
```

The shared runtime does not decide whether a successful module flow resets, redirects, closes, prints, or continues.

## 7. Feedback Policy

- success: toast; auto dismiss
- info: toast; auto dismiss
- warning: toast unless user decision is required
- recoverable error: persistent toast or inline error
- validation error: inline near the responsible field, with optional summary
- destructive confirmation: modal/alert dialog
- critical blocking failure: modal only when the workflow cannot safely continue

All modules call the Alpha-Tech notification adapter, never the notification engine directly.

## 8. Error Runtime

Normalize at least:

- validation response
- authentication expiration
- forbidden operation
- missing resource
- conflict / duplicate
- server failure
- network failure
- timeout
- offline state

Human-readable Thai messaging must remain specific enough for the user to act. Technical details remain available for diagnostics without exposing raw internal errors as the primary UI.

## 9. Loading and Async Safety

Standardize:

- page loading
- section loading
- button pending
- skeleton
- blocking overlay only when truly required
- duplicate-submit prevention
- stale response protection where relevant

Loading must not erase module context or unexpectedly move the user.

## 10. Confirmation Policy

Confirmation dialogs are reserved for actions requiring a decision, especially:

- delete
- archive
- reset
- close shift/session
- stock mode conversion
- irreversible state transition

Informational success dialogs are retired unless a business workflow explicitly requires acknowledgment.

## 11. Standard Page Surfaces

Standardize neutral presentation for:

- page headers
- section headers
- cards
- toolbars
- tables
- pagination
- search/filter regions
- empty states
- error states
- dialogs/drawers
- responsive action groups

Module-specific workflow composition remains module-owned.

## 12. Migration Strategy

### Stage A — Inventory

Find every production occurrence of:

- native button and locally styled button
- submit handlers
- alert/confirm
- modal success/error feedback
- react-toastify or other notification calls
- loading flags and overlays
- inline API error extraction
- locally defined colors, control heights, radius, shadow
- forms and validation messages

### Stage B — Foundation

Introduce tokens, neutral primitives, runtime adapters, and tests without changing workflow results.

### Stage C — Horizontal Migration

Migrate cross-cutting behavior by category:

1. buttons and action groups
2. notifications and errors
3. submit/loading safety
4. form controls and validation
5. dialogs and confirmations
6. tables, cards, empty/loading states

### Stage D — Module Completion

Verify every module and remove its legacy patterns only after replacements are active.

### Stage E — Legacy Retirement

Remove unused styles, duplicate button implementations, direct notification-engine calls, obsolete success dialogs, and duplicate error parsing.

## 13. Required Evidence

Repository Gate:

- complete changed-path inventory
- public exports
- no workflow ownership leakage
- no direct engine imports outside adapter
- no new arbitrary button styles in migrated paths
- tests for variants and runtime adapters

Runtime Gate:

- typecheck
- production build
- unit/integration tests
- lint where current baseline permits

Operational Gate:

- desktop and mobile smoke tests
- create/update/delete flows
- validation failures
- API failures
- network failure
- duplicate-click prevention
- dialog keyboard/focus behavior
- module-owned post-success transitions preserved

## 14. Merge Rule

This migration remains on a dedicated branch and Draft PR until repository-wide coverage and accepted runtime evidence are complete. Intermediate commits remain deployable and reviewable.
