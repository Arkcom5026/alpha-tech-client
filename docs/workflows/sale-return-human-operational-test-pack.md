# Sale Return Human Operational Test Pack

## Purpose

Use this pack to verify the Sale Return workflow in the real Alpha-Tech POS environment before review or merge.

This pack does not replace repository review, focused tests, CI, or production monitoring. It records human-observed operational behavior against the current Client and Server SHAs.

## Test Authority

- Client runtime owner: `src/features/sales/return`
- Search route: `/:shopSlug/pos/sales/sale-return`
- Create route: `/:shopSlug/pos/sales/sale-return/create/:saleId`
- Canonical eligibility API: `GET /api/sales/returns/eligible/:saleId`
- Canonical completion API: `POST /api/sales/returns/complete`
- Canonical list API: `GET /api/sales/return`
- Compatibility paths are not the normal operator path for this test.

## Required Test Record

Record these before starting:

- Date/time:
- Tester:
- Environment:
- Shop/branch:
- Client SHA:
- Server SHA:
- Browser/device:
- Original Sale codes used:

## Result States

Use exactly one state per scenario:

- `PASS` — observed behavior matches the expected result.
- `FAIL` — observed behavior differs from the expected result.
- `BLOCKED` — the scenario cannot be executed because required data, role, environment, or dependency is unavailable.

For every `FAIL` or `BLOCKED`, record evidence and the next action.

---

## Scenario 1 — Open Sale Return Search

### Preconditions

- Tester is authenticated in the intended shop.
- At least one completed Sale exists in that shop.

### Steps

1. Open `POS → Sales → Sale Return`.
2. Confirm the page title is `คืนสินค้า`.
3. Open the `คู่มือ` drawer.
4. Close the drawer.

### Expected

- The search page loads without changing shop context.
- The help drawer opens and closes without leaving the workflow.
- No Sale, stock, payment, or return data is changed.

Result:

Evidence:

---

## Scenario 2 — Search by Sale Code

### Steps

1. Enter a known Sale code.
2. Review the result list.

### Expected

- The intended Sale is displayed.
- Unrelated Sales are filtered out.
- Only Sales visible to the current shop are available.

Result:

Evidence:

---

## Scenario 3 — Search by Customer Name or Phone

### Steps

1. Search with the customer name.
2. Repeat with the customer phone number where available.

### Expected

- Matching Sales are displayed.
- The displayed Sale code, customer, sold date, and total match the original Sale.

Result:

Evidence:

---

## Scenario 4 — Cross-Shop Isolation

### Preconditions

- A known Sale exists in another unrelated shop/branch.

### Steps

1. Search for that Sale code or customer while authenticated in the current shop.
2. Attempt direct navigation using the other shop's Sale ID where safe to do so.

### Expected

- The other shop's Sale is not exposed in search.
- Eligibility is not returned for a Sale outside the authenticated branch.
- No return can be created across shops.

Result:

Evidence:

---

## Scenario 5 — Load Eligibility

### Steps

1. Select `เลือกรายการคืน` for a valid Sale.
2. Wait for eligibility to load.
3. Open the `คู่มือ` drawer.

### Expected

- The page shows the original Sale code.
- Only remaining returnable items are displayed.
- Serialized and SIMPLE items are distinguishable.
- The help drawer does not alter selected lines, quantities, refund values, or navigation state.

Result:

Evidence:

---

## Scenario 6 — Return One Serialized Item

### Preconditions

- Original Sale contains an eligible serialized item.

### Steps

1. Select one serialized item.
2. Confirm quantity is fixed at `1`.
3. Set the refund amount to the eligible amount.
4. Add a refund channel whose total equals the actual refund.
5. Confirm the return.

### Expected

- Completion succeeds once.
- The serialized item is restored according to the current stock policy.
- A Sale Return header and line are created.
- Refund evidence is recorded.
- The original Sale remains in history.

Result:

Evidence:

---

## Scenario 7 — Partial SIMPLE Quantity Return

### Preconditions

- Original Sale contains a SIMPLE line with remaining eligible quantity greater than `1`.

### Steps

1. Select the SIMPLE line.
2. Enter a quantity lower than the remaining eligible quantity.
3. Confirm the proportional eligible refund shown by the UI.
4. Set refund amount and refund channels correctly.
5. Complete the return.

### Expected

- Only the selected quantity is returned.
- Remaining returnable quantity decreases correctly.
- Stock restoration and movement use the selected quantity.
- A second eligibility load does not offer the already returned quantity again.

Result:

Evidence:

---

## Scenario 8 — Prevent Excess SIMPLE Quantity

### Steps

1. Enter a SIMPLE return quantity above the eligible quantity.
2. Attempt completion.

### Expected

- Completion is rejected.
- No Sale Return, stock restoration, refund evidence, or completion command is committed.

Result:

Evidence:

---

## Scenario 9 — Refund Channels Equal Actual Refund

### Steps

1. Select one or more items.
2. Set actual refund amounts.
3. Configure one or more refund channels so their total exactly equals the refund total.
4. Complete the return.

### Expected

- Completion succeeds.
- Each refund channel is recorded as evidence.
- The total refund evidence equals the actual approved refund.

Result:

Evidence:

---

## Scenario 10 — Reject Refund Evidence Mismatch

### Steps

1. Select an eligible item.
2. Set actual refund amount.
3. Set refund channel total to a different amount.
4. Attempt completion.

### Expected

- UI or Server rejects the request.
- No return transaction is committed.

Result:

Evidence:

---

## Scenario 11 — Source Payment Validation

### Preconditions

- The original Sale has payment evidence.

### Steps

1. Select a refund source from the original Sale.
2. Complete a valid refund within its remaining refundable amount.

### Expected

- Completion succeeds.
- The selected source belongs to the original Sale.
- Remaining refundable balance is respected.

Result:

Evidence:

---

## Scenario 12 — Reject Foreign or Exhausted Source Payment

### Steps

1. Attempt to submit a source payment that does not belong to the Sale, or exceeds its remaining refundable amount.
2. Attempt completion.

### Expected

- Request is rejected.
- No return, stock, or refund mutation is committed.

Result:

Evidence:

---

## Scenario 13 — Full Refund Without Deduction Approval

### Steps

1. Select eligible items.
2. Refund their full eligible value.
3. Complete the return using an ordinary authorized Sale Return operator account.

### Expected

- No deducted-refund approval is required.
- Completion follows normal authority rules.

Result:

Evidence:

---

## Scenario 14 — Deducted Refund With Authorized Role

### Preconditions

- Tester uses OWNER, MANAGER, ADMIN, SUPER_ADMIN, or an employee authority recognized by runtime policy.

### Steps

1. Select an item.
2. Set actual refund lower than eligible value.
3. Enter a clear free-text deduction reason.
4. Complete the return.

### Expected

- The UI shows the deducted amount.
- Completion succeeds for an authorized role.
- Reason and financial projection are retained as return evidence.

Result:

Evidence:

---

## Scenario 15 — Reject Deduction Without Reason

### Steps

1. Create a deducted refund.
2. Leave both overall and line-level reasons blank.
3. Attempt completion.

### Expected

- Completion is rejected.
- No transaction is committed.

Result:

Evidence:

---

## Scenario 16 — Reject Deduction Without Approval Authority

### Preconditions

- Tester uses a role without deducted-refund approval authority.

### Steps

1. Create a deducted refund with a valid reason.
2. Attempt completion.

### Expected

- Server rejects the request with an approval-required result.
- No return, stock restoration, or refund evidence is committed.

Result:

Evidence:

---

## Scenario 17 — Idempotent Safe Retry

### Steps

1. Submit a valid return.
2. Re-send the exact same command identity and material request using the supported recovery path.

### Expected

- The existing result is returned as a replay.
- A second Sale Return is not created.
- Stock and refund evidence are not duplicated.

Result:

Evidence:

---

## Scenario 18 — Reject Changed Payload With Same Command Identity

### Steps

1. Complete or stage a return command.
2. Reuse its command identity with changed item, quantity, reason, or refund material.

### Expected

- Request is rejected as an idempotency/replay conflict.
- Existing return evidence remains unchanged.

Result:

Evidence:

---

## Scenario 19 — Uncertain Response Recovery

### Steps

1. Simulate or observe a timeout/network interruption after pressing confirm.
2. Do not create a new return manually.
3. Restore connectivity.
4. Retry through the same workflow and preserved command identity, or verify return history first.

### Expected

- Operator can determine whether the original transaction committed.
- A duplicate return is not created.
- Same-material retry is safe where command identity is preserved.

Result:

Evidence:

---

## Scenario 20 — Stock or Concurrency Conflict

### Steps

1. Use stale eligibility or create a controlled concurrent change to a selected item's return state.
2. Attempt completion.

### Expected

- Completion is rejected with a conflict.
- The transaction rolls back.
- Operator is instructed to reload eligibility and retry.

Result:

Evidence:

---

## Scenario 21 — History and Detail

### Steps

1. Complete a return.
2. Open Sale Return list/history through the supported UI or API projection.
3. Open the return detail.

### Expected

- Return code, original Sale, returned lines, quantities, amounts, reason, employee, shop, and timestamps are traceable.
- Results are branch-scoped.

Result:

Evidence:

---

## Scenario 22 — Original Sale Preservation

### Steps

1. Compare the original Sale before and after return.

### Expected

- Original Sale history remains available.
- Sale Return is a separate business record linked to the original Sale.
- The operator does not overwrite or recreate the original Sale.

Result:

Evidence:

---

## Scenario 23 — Compatibility Boundary

### Steps

1. Perform normal operator testing only through the canonical UI and canonical `/sales/returns/...` APIs.
2. Record whether any observed active runtime still depends on `/sale-returns/...`.

### Expected

- Canonical flow works independently for the mounted POS pages.
- Compatibility path is not removed merely because the canonical flow passes.
- Any retirement proposal is handled separately with usage evidence.

Result:

Evidence:

---

## Scenario 24 — Credit Note Boundary

### Steps

1. Complete a return.
2. Inspect available UI/API/document evidence for a Credit Note.

### Expected

- Do not report Credit Note generation as implemented unless an actual Credit Note record/document is produced by runtime.
- Missing Credit Note behavior is recorded as a downstream boundary, not silently inferred.

Result:

Evidence:

---

## Scenario 25 — Tax Adjustment Boundary

### Steps

1. Complete a return.
2. Inspect tax workspace, tax candidates, or other supported projections.

### Expected

- Do not report tax adjustment as implemented unless runtime evidence exists.
- No duplicate return is created to compensate for downstream tax behavior.

Result:

Evidence:

---

## Final Operational Summary

- Total scenarios:
- PASS:
- FAIL:
- BLOCKED:
- Critical defect found:
- Cross-shop isolation result:
- Idempotency result:
- Stock restoration result:
- Refund evidence result:
- Deduction approval result:
- Credit Note boundary result:
- Tax boundary result:

## Human Acceptance Decision

Choose one:

- [ ] `ACCEPTED FOR REVIEW` — no unresolved blocking operational defect.
- [ ] `REJECTED` — one or more blocking operational defects remain.
- [ ] `BLOCKED` — required environment, role, or test data is unavailable.

Tester name/sign-off:

Date/time:

Notes:
