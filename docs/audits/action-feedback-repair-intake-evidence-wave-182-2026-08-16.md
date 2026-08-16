# Action Feedback Residual Audit — Wave 182

Date: 2026-08-16
Branch: `feature/action-feedback-residual-wave-182`
Scope: Repair Intake Evidence reconciliation authority

## Residual found

`IntakeEvidencePanel.jsx` already had synchronous `savingRef`, immutable repair-job/draft snapshots, ADS success/error feedback, and a dedicated post-save refresh error event.

One lifecycle gap remained: the component released `savingRef` and `saving` immediately after `saveIntakeEvidence()` completed, then invoked `onSaved()` afterward. This reopened editing/re-save interaction while the parent repair-job reconciliation was still running.

A second edge case was that `onSaved()` could report a non-throwing `{ ok: false }` outcome; the panel only detected thrown errors, so that reconciliation failure could be silent.

## Wave 182 changes

- Keep synchronous mutation ownership active through parent reconciliation.
- Include `savingRef.current` in the render-visible interaction lock.
- Preserve immutable `repairJobId` and intake-evidence draft snapshots for persistence identity.
- Emit persistence success immediately after the Server confirms the evidence save.
- Invoke `onSaved(saved)` while ownership is still held.
- Treat both thrown refresh failures and non-throwing `{ ok: false }` outcomes as partial success.
- Release `savingRef` / `saving` only after reconciliation completes.

## Outcome semantics

Persistence failure continues to use:

`repair:intake-evidence:<repairJobId>:save:error`

Persistence success continues to use:

`repair:intake-evidence:<repairJobId>:save:success`

Parent reconciliation failure after persistence success uses:

`repair:intake-evidence:<repairJobId>:refresh:error`

The user is therefore not told that evidence persistence failed when only the parent repair-job refresh failed.

## Contract evidence

Added:

`tests/repair-intake-evidence-reconciliation-authority.contract.test.js`

The contract locks synchronous authority, immutable command identity, persistence-before-refresh ordering, non-throwing refresh-failure detection, partial-success feedback, and release-after-reconciliation ordering.

## Scope discipline

No API route, Server behavior, schema, evidence policy, or repair workflow transition changed. Wave 182 only hardens Client-side mutation/reconciliation authority and feedback semantics.

## Verification status

Git-side source/contract/audit changes are complete. Local contract execution, typecheck, build, and runtime verification remain pending until Local execution is available.
