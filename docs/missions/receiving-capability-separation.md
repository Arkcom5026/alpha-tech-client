# Receiving Capability Separation

## Mission
Continue the Receiving architecture agenda after the completed Quick Stock ownership migration.

## Current checkpoint
- `main` contains the merged Quick Stock runtime ownership migration.
- Quick Stock runtime ownership now belongs to `src/features/receiving`.
- Production build passed before this agenda was opened.

## Problem observed
`QuickStockPage.jsx` still coordinates discovery, product adoption, local product creation, intake controls, queue editing, receipt session state and final commit in one page. The page exposes a very large runtime-controller surface and contains several inline workflow sections. This keeps capability ownership mixed even though namespace ownership is now correct.

## Target architecture
Separate the page incrementally into cohesive Receiving capabilities while preserving runtime behavior:

- discovery — search and select a product
- product-adoption — adopt a template or create a local operational product
- intake — barcode/serial capture and editable queue
- receipt-session — supplier, delivery note and resumable draft
- commit — stock finalization controls
- summary — queue readiness projection

## First increment
Extract the inline product-adoption UI from `QuickStockPage.jsx` into focused components without changing controller logic or business behavior.

Expected boundaries:
- Template operational-product adoption panel
- Local operational-product creation panel

The page remains the composition root during this increment. State ownership stays in `useQuickStockRuntimeController` until a later evidence-supported extraction.

## Non-goals
- No API contract change
- No server behavior change
- No tax workflow change
- No receipt finalization rule change
- No redesign of Quick Receipt session semantics
- No broad folder migration in the same increment

## Verification
- Quick Stock page test
- Quick Receipt session test
- Relevant architecture/contract tests
- Production build

## Increment policy
Each extraction must be independently buildable, testable, reversible and committed before opening the next capability boundary.
