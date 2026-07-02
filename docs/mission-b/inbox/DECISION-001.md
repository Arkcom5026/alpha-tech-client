# DECISION-001 — Canonical Frontend Onboarding Path Decision

Mission: Mission B
Owner: ROLE-ARCH
Status: APPROVED FOR PLANNING
Implementation: STILL LOCKED

## Canonical Entry Point
QuickStockPage is the single frontend entry point for Product Onboarding.

## Canonical State Owner
QuickStockPage should own the onboarding state machine and orchestrate transitions. productStore should expose actions but should not own UI workflow.

## Canonical Action Flow
Template Search → Determine Operational Product → If missing: Create Operational Product → Create BranchPrice → Operational Ready → Stock Intake.

## Ordered File Modification Plan
1. QuickStockPage (introduce explicit onboarding state machine)
2. ProductFinderPanel (emit clear selection intent)
3. productStore (align actions with state machine)
4. productApi (consume canonical API sequence)

No additional frontend files should be modified before validating each previous step.

## Risks
- Expanding changes across multiple files simultaneously.
- Mixing onboarding and existing-stock intake logic.
- Allowing Template state to bypass Operational Ready.

## Go / No-Go
Current Decision: NO-GO for implementation.

Implementation may begin only after an implementation work package is approved and scoped to a single file.

## Next Phase
WP-005: QuickStockPage Implementation Plan (One File at a Time).