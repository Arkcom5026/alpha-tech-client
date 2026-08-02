# Mission

Certify the real Repair Intake Completion flow from Browser action to Test-DB post-condition.

## Browser obligations

1. Authenticate as the fixture employee and land inside the fixture store.
2. Open the fixture RepairJob in `RECEIVED`.
3. Prove `COMPLETED` is not offered as a direct next state.
4. Attempt `IN_PROGRESS` before intake evidence exists and observe the server-owned rejection.
5. Add one intake-condition image and customer confirmation through the visible UI.
6. Change the job to `IN_PROGRESS` through the visible UI.
7. Observe the new state from the real server response.

## Database obligations

The paired read-only verifier must prove:

- RepairJob remains in the fixture branch.
- DeviceIntake, consent, and intake-condition photo belong to that RepairJob.
- RepairJob status is `IN_PROGRESS` only after evidence completion.
- A matching status timeline event exists.
- No cross-store record is accepted as evidence.
