# Action Feedback Audit — Wave 192

Date: 2026-08-16
Branch: `feature/action-feedback-residual-wave-192`
Owner: `src/features/tax/intake/hooks/useTaxIntakeWorkspaceController.js`

## Scope

Wave 192 hardens Tax Intake document mutation and reconciliation authority for:

- document status transitions
- output-tax document issuance
- post-success document detail refresh
- post-success Tax Intake list refresh
- stale list responses when branch/filter context changes

## Residual found

The controller already serialized transitions with `transitionRef`, but persistence outcome and reconciliation outcome were not separated strongly enough.

`refreshAfterMutation()` announced generic success, attempted a detail refresh, then called `loadData()`. `loadData()` swallowed its own failure and returned no observable result. This meant a document transition or issuance could persist successfully while the list reconciliation failed without a dedicated partial-success outcome.

Mutation callbacks also relied on the live `branchId` captured by the refresh callback rather than carrying one explicit branch snapshot across persistence and reconciliation. A branch change while a request was in flight could therefore make post-success reads ambiguous.

Finally, list reads had no request sequencing authority, so an older async list response could overwrite a newer branch/filter workspace.

## Hardening

- Added `branchIdRef` as current branch authority.
- Added `loadRequestRef` to sequence Tax Intake list reads.
- `loadData()` now snapshots branch and filters and returns observable `{ ok, error, stale }` outcomes.
- Stale list responses are discarded instead of writing into a newer workspace.
- Transition commands snapshot `branchId`, `taxDocumentId` and target status before persistence.
- Issue commands snapshot `branchId`, `taxDocumentId` and invoice kind before persistence.
- Persistence success is announced before reconciliation.
- Detail refresh failure has its own partial-success event.
- List refresh failure has its own partial-success event.
- A branch change after persistence is reported separately and prevents cross-branch reconciliation.
- Persistence failure remains distinct from all post-success refresh failures.

## Event authority

Transition base event:

`tax-intake:<branchId>:document:<taxDocumentId>:transition:<targetStatus>`

Issue base event:

`tax-intake:<branchId>:document:<taxDocumentId>:issue:<taxInvoiceKind>`

Each base event can emit:

- `:success` — persistence confirmed
- `:error` — persistence failed
- `:detail-refresh:error` — persistence succeeded but detail refresh failed
- `:refresh:error` — persistence succeeded but list refresh failed
- `:context-changed:error` — persistence succeeded but branch context changed before reconciliation

## Verification contract

Added:

`tests/tax-intake-mutation-reconciliation-authority.contract.test.js`

The contract locks branch/request authority, observable list outcomes, immutable mutation snapshots and distinct persistence-versus-reconciliation feedback identities.

## Deferred residual

`loadPeriods()` and `openDocument()` still use simpler read semantics. They do not perform persistence and are therefore lower risk than the mutation/reconciliation boundary addressed in this wave. They remain candidates only if later residual scanning finds a concrete cross-context defect that warrants a dedicated wave.
