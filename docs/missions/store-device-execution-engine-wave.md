# Store Device Execution Engine — Parallel Wave

## Mission
Create an in-memory execution engine contract that can later bind to server persistence without changing gateway or adapter contracts.

## Required lifecycle
- Create job
- Validate target capability
- Lease job
- Acknowledge lease
- Start execution
- Report progress
- Complete or fail
- Retry with bounded policy
- Expire lease
- Dead-letter terminal failure

## Invariants
- Every job, lease and result is branch-scoped.
- One active lease per job.
- Repeated idempotency key resolves to the same logical job.
- Revoked gateway/session cannot lease or complete work.
- Terminal results are immutable.
- Physical execution remains disabled; adapters are mocked.

## Verification
- Happy-path lifecycle test.
- Cross-branch rejection test.
- Duplicate lease/idempotency test.
- Retry, timeout and dead-letter tests.
- Reconnect/resume test.
