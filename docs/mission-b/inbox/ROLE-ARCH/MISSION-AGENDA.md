# MISSION-AGENDA — Mission B

Mission: Mission B
Owner: ROLE-ARCH
Status: APPROVED
Purpose: Control the remaining Mission B execution until completion.

## Mission Definition

Mission B is a workflow mission:

```txt
Template Search
-> Operational Product Onboarding
-> Branch Runtime Ready
```

Mission B is complete only when a branch operator can bring a product into branch runtime through the approved workflow and the product is usable in branch operations.

## Operating Rule

Mission work must follow this agenda.

Assignments must advance the current phase and must be written in the assigned Role workspace.

Reports must be written in the assigned Role inbox.

## Phase 1 — Backend Runtime Completion

Owner: BE-01 Backend Runtime Owner

Goal:

```txt
Complete the approved Flow 3 backend contract.
```

Current approved backend contract:

```txt
POST /api/products/pos/create-local
```

Required result:

```txt
Local Operational Product create
-> adoption-ready Operational Product runtime shape
-> receive through /api/quick-stock/existing using operationalProduct.id
```

Expected report:

```txt
docs/mission-b/inbox/BE-01/LOCAL-CREATE-IMPLEMENTATION-001.md
```

Gate:

```txt
ROLE-ARCH audit of backend implementation report
```

## Phase 2 — Frontend Runtime Integration

Owner: FE-01 Runtime Owner

Goal:

```txt
Integrate Flow 3 into QuickStock runtime after backend contract passes audit.
```

Expected direction:

```txt
Template Search
-> Operational Lookup
-> Local Create when no suitable Template exists
-> Adopt returned Operational Product
-> Receive through /quick-stock/existing using operationalProduct.id
```

Expected report:

```txt
docs/mission-b/inbox/FE-01/FLOW-INTEGRATION-001.md
```

Gate:

```txt
ROLE-ARCH audit of FE runtime integration report
```

## Phase 3 — UX Validation

Owner: FE-02 UX Owner

Goal:

```txt
Validate operator-facing QuickStock workflow, state labels, empty result path, error handling, and local product creation UX.
```

Expected report:

```txt
docs/mission-b/inbox/FE-02/UX-VALIDATION-001.md
```

Gate:

```txt
ROLE-ARCH audit of UX validation report
```

## Phase 4 — End-to-End Verification

Owner: Verification owner assigned by ROLE-ARCH

Goal:

```txt
Verify Mission B as an end-to-end operational workflow.
```

Verification target:

```txt
Template Search
-> Template Product path
-> Local Product path
-> Operational Product ready
-> BranchPrice ready
-> Stock intake
-> Product visible and usable in branch runtime
```

Expected report:

```txt
docs/mission-b/inbox/<ROLE>/VERIFY-E2E-002.md
```

## Phase 5 — ROLE-ARCH Audit

Owner: ROLE-ARCH

Inputs:

```txt
BE-01 implementation report
FE-01 integration report
FE-02 UX validation report
E2E verification report
Relevant Decisions
```

Audit result must be one of:

```txt
PASS
PASS WITH DEBT
FAIL
```

## Phase 6 — Mission B Certification

Owner: ROLE-ARCH

If audit passes, issue:

```txt
docs/mission-b/inbox/ROLE-ARCH/CERTIFICATION-002.md
```

Certification meaning:

```txt
Mission B Operationally Complete
```

## Phase 7 — Mission Closeout

Owner: ROLE-ARCH

Closeout includes:

```txt
Final Mission Status
Self Handover
Audit
Certification
Successor Boot if required
Known Debt
Known Risks
Next Mission recommendation
```

## Current Phase

```txt
Phase 1 — Backend Runtime Completion
```

Current blocker:

```txt
ROLE-ARCH is waiting for BE-01 implementation report at docs/mission-b/inbox/BE-01/LOCAL-CREATE-IMPLEMENTATION-001.md
```

## Architecture Backlog After Mission B

Do not execute during Mission B unless explicitly approved:

```txt
Move global ROLE-ARCH docs out of mission-b.
Normalize Mission Agenda as a reusable P1-EOS standard.
Update backend maps if create-local changes Mission B runtime path.
```