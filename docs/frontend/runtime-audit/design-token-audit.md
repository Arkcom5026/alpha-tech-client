# Design Token Audit and Target Model

Status: INITIAL DESIGN — VERIFIED AGAINST PROVIDED `src` SNAPSHOT

## 1. Current Foundation

`src/index.css` already defines semantic light/dark variables for:

- background and foreground
- card and popover
- primary and secondary
- muted and accent
- destructive
- border and input
- focus ring
- chart colors
- radius

This is a strong foundation and should be extended rather than replaced.

## 2. Current Gaps

The existing variables are primarily color primitives for shadcn-style components. The repository does not yet expose a complete operational design-token contract for:

- success, warning, information, and pending states
- interactive hover/pressed/selected states
- page and surface hierarchy
- spacing and layout rhythm
- typography roles
- elevation/shadow roles
- control heights
- responsive density
- table states
- form states
- operational status colors
- focus and accessibility policy

Hard-coded color evidence remains in 19 files, with arbitrary Tailwind hexadecimal classes in 7 files.

## 3. Token Architecture

The target token system has three levels.

```text
Foundation Tokens
↓
Semantic Tokens
↓
Component Tokens
```

### Foundation Tokens

Raw scales. They must not normally be consumed directly by feature modules.

Examples:

- neutral color scale
- brand color scale
- red, amber, green, blue scales
- spacing scale
- radius scale
- shadow scale
- font-size and line-height scale

### Semantic Tokens

Meaningful repository-wide roles.

Examples:

- `surface-page`
- `surface-card`
- `surface-raised`
- `text-primary`
- `text-secondary`
- `text-muted`
- `border-default`
- `border-strong`
- `action-primary`
- `action-danger`
- `feedback-success`
- `feedback-warning`
- `feedback-info`
- `feedback-error`

Feature modules should consume semantic meaning rather than raw palette values.

### Component Tokens

Controlled aliases used by neutral primitives.

Examples:

- button height and padding
- input height and border
- dialog radius and shadow
- table header background
- badge tone
- focus ring width

Component tokens must not encode business workflow.

## 4. Proposed CSS Variable Contract

The first implementation should preserve existing variables and add aliases incrementally.

```css
:root {
  /* surfaces */
  --surface-page: var(--background);
  --surface-card: var(--card);
  --surface-popover: var(--popover);
  --surface-muted: var(--muted);

  /* text */
  --text-primary: var(--foreground);
  --text-on-primary: var(--primary-foreground);
  --text-muted: var(--muted-foreground);

  /* borders and focus */
  --border-default: var(--border);
  --control-border: var(--input);
  --focus-ring: var(--ring);

  /* feedback */
  --success: 142 71% 45%;
  --success-foreground: 0 0% 100%;
  --warning: 38 92% 50%;
  --warning-foreground: 24 10% 10%;
  --info: 217 91% 60%;
  --info-foreground: 0 0% 100%;

  /* geometry */
  --radius-sm: calc(var(--radius) - 0.25rem);
  --radius-md: var(--radius);
  --radius-lg: calc(var(--radius) + 0.25rem);

  /* control sizing */
  --control-height-sm: 2rem;
  --control-height-md: 2.5rem;
  --control-height-lg: 2.75rem;
}
```

Exact color values remain provisional until representative screens are visually verified in light and dark modes.

## 5. Operational Status Policy

Business statuses must not directly select arbitrary colors. Modules map their domain status to a limited semantic tone:

```text
neutral
info
success
warning
danger
pending
```

Example:

```text
PAID       → success
PENDING    → pending
CANCELLED  → neutral or danger depending on actionability
FAILED     → danger
PROCESSING → info
```

The mapping remains module-owned because domain meaning belongs to the module. Rendering of each tone belongs to the design system.

## 6. Button Contract

The existing `Button` primitive is retained and evolved.

Required semantic variants:

- primary/default
- secondary
- outline
- ghost
- destructive
- link

Required sizes:

- small
- default
- large
- icon

Required runtime states:

- idle
- hover
- focus-visible
- disabled
- loading

A loading state should preserve width where practical, disable repeated submission, expose accessible status, and avoid requiring every feature to rebuild spinner layout.

Raw `<button>` usage is widespread across 212 files. Migration must therefore be incremental and representative-first.

## 7. Form Contract

All form controls should converge on:

```text
Label
Control
Description (optional)
Validation message (optional)
```

Required presentation states:

- default
- focused
- disabled
- read-only
- invalid
- loading/dependent

Business validation rules remain module-owned. The design system standardizes only how validation is displayed.

## 8. Feedback Contract

Feedback tones:

- success
- error
- warning
- information

Toast policy:

- toast is for transient, non-blocking feedback
- blocking decisions use dialogs
- field validation stays near the field
- page-load failure uses an inline/page error surface
- destructive confirmation must not rely on toast

`react-toastify` is currently distributed across 12 files. A runtime adapter should become the only authorized application-facing API before library replacement or consolidation.

## 9. Loading Contract

Loading must be expressed at the smallest truthful scope:

- button loading for mutation submission
- field loading for dependent options
- section loading for partial data
- page loading for route-level data
- processing dialog only for genuinely blocking operations

The snapshot contains loading-related patterns in 111 files, so migration requires normalization without changing operation timing.

## 10. Responsive Contract

The design system establishes presentation rules, while modules retain workflow layout decisions.

Minimum standards:

- controls remain usable at phone widths
- action groups wrap safely
- dialogs fit viewport height and scroll internally
- tables provide an intentional mobile strategy
- touch targets should generally meet 44px where operationally appropriate
- sticky actions must account for safe areas

No global responsive rewrite should be applied to transactional modules without representative runtime proof.

## 11. Accessibility Contract

Required baseline:

- visible keyboard focus
- semantic button and form elements
- labels linked to controls
- icon-only actions have accessible names
- dialogs preserve focus management
- loading state is conveyed beyond animation alone
- color is never the sole status signal

Radix-based primitives should continue to provide accessible interaction foundations where already present.

## 12. Planned Implementation Files

Proposed structure:

```text
src/styles/
  tokens.css
  globals.css (optional later extraction)

src/components/ui/
  existing primitives evolved in place

src/runtime/
  feedback/
  errors/
  loading/
  confirmations/
```

The structure is planned. No runtime directory should be created until its public API and ownership rules are approved.

## 13. First Representative Proof

The initial implementation should avoid Sales, Payment, Stock movement, Purchase receiving, Repair, and Claim workflows.

Preferred proof surfaces:

1. a low-risk settings/list page
2. one standard create/edit form
3. one data table with empty/loading/error states
4. one confirmation flow

Proof criteria:

- no API or route change
- no workflow result change
- light/dark visual consistency
- mobile-safe layout
- keyboard/focus behavior preserved or improved
- rollback is limited to the representative slice

## 14. Exit Criteria for Token Foundation

Wave 2 is complete only when:

- semantic token contract is committed
- existing primitives consume semantic tokens
- no feature workflow is moved into shared code
- representative screens pass repository review
- build and runtime evidence are captured locally
- legacy hard-coded values have an explicit migration path
