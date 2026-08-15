# Action Feedback Customer Receipt Hardening — Wave 5

Date: 2026-08-15

## Objective

Harden the Customer Receipt financial workflow so create, allocation, and cancellation mutations provide standardized ADS action feedback while preserving the existing inline financial-document state and duplicate-submit protections.

## Scope

- Customer Receipt create
- Customer Receipt allocation
- Customer Receipt cancellation
- Action feedback contract coverage

## Findings

The Customer Receipt store already exposes `submitting`, `successMessage`, and `error`, but the persistent financial mutations were only surfaced through inline state. This means users could miss completion/failure feedback when the relevant inline message is outside the current viewport.

## Standard

For Customer Receipt mutations:

1. Preserve the store as the data/state authority.
2. Preserve inline success/error state for document context.
3. Add owner-level `feedback.actionSuccess` / `feedback.actionError` for create, allocate, and cancel.
4. Keep the existing `submitting` duplicate-submit protection.
5. Do not move UI feedback into API/transport helpers.
6. Do not alter receipt accounting semantics, allocation authority, cancellation rollback semantics, or tenant boundaries.

## Batch workflow note

Wave 5 is stacked on Wave 4 and is intended to be accumulated with additional agendas before the next `origin/main` push / Production release checkpoint.
