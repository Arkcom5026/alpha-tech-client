# Expected Outcome

## Before evidence

- Job status is `RECEIVED`.
- `COMPLETED` is absent from the next-state selector.
- Submitting `IN_PROGRESS` is rejected with `REPAIR_INTAKE_EVIDENCE_INCOMPLETE` or the equivalent Thai user message.
- The database remains unchanged for job status and status timeline.

## After evidence

- One intake-condition image is persisted.
- Customer confirmation is persisted with the supplied signature.
- The same employee can submit `IN_PROGRESS`.
- Browser displays `กำลังตรวจ/ซ่อม` after the server response.
- The Test-DB verifier reports `PASS`, `databaseModified: false`, matching branch IDs, and the matching timeline event.
