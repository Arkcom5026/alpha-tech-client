# Frontend Runtime + Design System Migration Roadmap

Status: ACTIVE PLAN
Branch: `refactor/frontend-runtime-design-system-v1`
Tracking: Issue #10, Draft PR #11

## 1. Migration Objective

Move the production frontend toward one consistent design language and cross-cutting runtime policy while preserving module-owned workflows, routes, API contracts, permissions and business outcomes.

The migration follows this dependency direction:

```text
Design Tokens
  -> Neutral Primitives
  -> Cross-cutting Runtime Adapters
  -> Module-owned Composition
  -> Page and Workflow Verification
  -> Legacy Retirement
```

Higher layers may depend on lower layers. Lower layers must not import or decide module workflow.

## 2. Program Waves

### W1 — Repository Audit and Architecture Authority

Deliver:

- architecture authority
- architecture overview
- repository inventory
- component inventory
- runtime inventory
- design-token audit
- migration roadmap
- risk analysis

Gate:

- documentation only
- all material claims grounded in repository evidence
- no production runtime behavior changed

### W2 — Design Token Foundation

Introduce semantic tokens for:

- colors and surfaces
- typography roles
- spacing
- control dimensions
- radius
- elevation and shadow
- focus state
- motion
- z-index
- breakpoints

Rules:

- first commit adds foundations without mass replacement
- existing UI remains functional during transition
- token names express semantic purpose, not module names
- no workflow-specific token is promoted to global scope without cross-module proof

Gate:

- repository exports are stable
- theme/provider integration is explicit
- build and typecheck pass locally
- representative desktop and mobile surfaces preserve behavior

### W3 — Neutral Primitive Foundation

Introduce or normalize:

- Button
- Input
- Textarea
- Select
- Checkbox and radio controls
- Badge and chip
- Card and surface
- Spinner and skeleton
- Empty and error presentation primitives

Rules:

- primitives contain no Product, Sales, Purchase, Repair, Claim, Customer, Supplier, Employee or Settings workflow logic
- each primitive supports accessibility, disabled state and focus-visible behavior
- async submit behavior is composed through runtime policy rather than hidden business decisions

Gate:

- component API documented
- variant and state coverage tested
- no module workflow moved into shared code

### W4 — Cross-cutting Runtime Foundation

Introduce or normalize adapters for:

- notification
- error normalization
- loading and pending state
- confirmation
- form submission
- validation presentation
- async request safety

Rules:

- modules call Alpha-Tech adapters, not third-party engines directly
- adapters normalize presentation policy but do not choose workflow transitions
- successful reset, redirect, print, drawer close or continuation remains module-owned

Gate:

- tests cover success, recoverable failure and duplicate-submit behavior
- adapter public exports are explicit
- no direct runtime-engine import remains in migrated paths

### W5 — Horizontal Migration

Migrate by cross-cutting category before attempting visual redesign by module:

1. action buttons and action groups
2. notifications and error presentation
3. pending and duplicate-submit safety
4. fields and validation presentation
5. confirmations and dialogs
6. cards, tables, filters, empty states and loading states
7. typography, spacing and responsive alignment

Each category moves through representative low-risk surfaces first, then medium-risk surfaces, then high-risk transactional workflows.

Gate per increment:

- deployable commit
- unchanged API and route contract
- unchanged workflow result
- changed-path inventory
- runtime evidence for affected surfaces

### W6 — Module Completion

Complete repository coverage module by module only after horizontal foundations are stable.

Suggested order, subject to verified W1 risk evidence:

1. static and settings surfaces
2. customer and supplier support surfaces
3. employee and administrative surfaces
4. product and inventory surfaces
5. purchase flows
6. repair and claim flows
7. sales and POS transaction flows

A module is complete only when its production paths no longer depend on superseded patterns covered by the migration.

### W7 — Legacy Retirement and Final Verification

Remove only after replacements are active and verified:

- duplicate shared components
- direct notification-engine calls
- obsolete informational success dialogs
- duplicate error parsing
- dead CSS and abandoned theme fragments
- local button variants replaced by approved primitives
- unused runtime utilities

Final gates:

- Repository Gate PASS
- Runtime Gate PASS
- Operational Gate PASS
- desktop and mobile smoke coverage
- create, update, delete and validation failure evidence
- transactional workflow evidence for sales, purchase, repair and claim

## 3. Increment Shape

Every implementation increment should remain small enough to review and rollback:

```text
Authority reference
-> narrowly defined paths
-> implementation
-> repository verification
-> local runtime verification
-> operational evidence where required
-> commit
-> next increment
```

Do not combine unrelated module migrations merely to increase file count.

## 4. Representative-first Policy

Before repository-wide replacement, prove each foundation against:

- one simple form
- one list/table page
- one dialog flow
- one async save flow
- one destructive confirmation
- one mobile-constrained surface

Only expand after the representative set passes its required gates.

## 5. Compatibility Policy

During migration:

- new and legacy implementations may coexist temporarily
- compatibility adapters may be used when removal would force a risky big-bang change
- compatibility code must be marked with an owner, replacement path and retirement condition
- no compatibility layer may become a second permanent architecture

## 6. Stop Conditions

Pause an increment when any of the following occurs:

- workflow ownership moves into shared code
- route, API or permission behavior changes unintentionally
- runtime evidence contradicts repository assumptions
- a shared abstraction requires module-specific branching
- migration causes broad visual change without a verified rollback boundary
- build, typecheck or critical workflow verification fails

Record the evidence, restore a safe boundary and continue with a targeted patch rather than a repository-wide rewrite.

## 7. Wave 2 Entry Requirement

Wave 2 begins only after W1 inventories identify the actual theme entry points, styling systems, providers, shared component locations and high-impact dependencies. Architecture documents alone do not authorize implementation based on guessed paths.
