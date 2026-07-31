# Sale Return Operational User Guide

## Purpose

This guide explains how shop staff should process a Sale Return through the current Alpha-Tech POS workflow without bypassing Server authority, duplicating returns, or restoring stock incorrectly.

## Runtime Owner

The active Sale Return UI is owned by:

- `src/features/sales/return/pages/ReturnSearchPage`
- `src/features/sales/return/pages/CreateReturnPage`
- `src/features/sales/return/store/saleReturnRuntimeStore`
- `src/features/sales/return/hooks/useSaleReturnRuntimeController`
- `src/features/sales/return/workflows/completeSaleReturnWorkflow`
- `src/features/sales/return/api/saleReturnApi.js`

Canonical routes:

- POS page: `sales/sale-return`
- Create page: `sales/sale-return/create/:saleId`
- Eligibility API: `GET /sales/returns/eligible/:saleId`
- Completion API: `POST /sales/returns/complete`

Legacy top-level Sale Return files and `/sale-returns/...` compatibility paths are not the canonical UI owner. They remain temporarily for backward compatibility and must not be removed without separate usage evidence.

## Before Starting

Confirm that:

- the employee is signed in to the correct shop;
- the original Sale belongs to the current shop;
- the customer has identified the correct Sale or document;
- the returned item can be inspected;
- the refund method and evidence are known;
- a manager or authorized approver is available if the refund will be reduced.

## Step 1 — Find the Original Sale

Open the Sale Return search page and locate the original Sale.

Use only Sales returned by the current shop context. A Sale from another independent shop must not be displayed or accepted.

After selecting the Sale, continue to the create page. The system loads the latest return eligibility from the Server.

## Step 2 — Review Eligibility

Eligibility is the current Server-calculated return authority. It may differ from the original Sale because some items or payment amounts may already have been returned.

Review:

- serialized items still eligible for return;
- SIMPLE product quantities still eligible for return;
- original net value and remaining refundable value;
- original payment evidence and remaining refundable balance;
- prior returns that reduce current eligibility.

Do not rely on a previously opened page after another return or stock change. Refresh eligibility before completing the return.

## Step 3 — Select Returned Items

### Serialized item

Select the specific sold unit. The return quantity is always one.

The system must reject an item that:

- was not sold in the selected Sale;
- has already been fully returned;
- belongs to another shop;
- changed stock state during processing.

### SIMPLE product

Enter the quantity being returned.

The quantity must be greater than zero and must not exceed the remaining returnable quantity.

Partial returns are allowed where eligibility supports them.

## Step 4 — Record Return Reasons

Enter a clear reason describing why the item is being returned.

A free-text reason is mandatory when the approved refund is lower than the eligible refund value.

Useful reasons include:

- item condition differs from original state;
- missing accessory;
- restocking or handling deduction;
- customer accepted partial refund;
- other verified business reason.

Avoid vague reasons that cannot support later review.

## Step 5 — Review Refund Amounts

Each selected item has an eligible refund value based on the original Sale and remaining return authority.

The requested refund must not exceed that value.

The total refund evidence entered must equal the actual approved refund total exactly.

If the refund is reduced below the eligible amount:

- record a clear reason;
- obtain approval from an authorized role;
- confirm that the customer accepts the approved amount.

Authorized deduction roles currently include:

- OWNER
- MANAGER
- ADMIN
- SUPER_ADMIN

## Step 6 — Select Refund Channels

Use only supported refund methods shown by the application.

When linking a refund to an original payment item:

- the payment item must belong to the selected Sale;
- the requested refund must not exceed its remaining refundable balance;
- do not reuse payment evidence from another Sale.

The combined refund channels must equal the actual refund total.

## Step 7 — Final Review

Before completing, confirm:

- correct Sale;
- correct shop;
- correct serialized units;
- correct SIMPLE quantities;
- correct refund values;
- correct refund channels;
- deduction reason and approval, when required;
- no duplicate submission is already in progress.

## Step 8 — Complete the Return

Submit once and wait for the result.

The Server performs the authoritative completion transaction, including:

- rechecking eligibility;
- validating items and quantities;
- validating refund evidence;
- validating deduction approval;
- creating the Sale Return record;
- restoring serialized or SIMPLE stock;
- creating stock movement evidence;
- creating refund evidence;
- recording the completion command for idempotency.

The Client must not assume completion until the Server returns a confirmed result.

## Safe Retry and Uncertain Response

If the network disconnects or the response is uncertain:

1. Do not create a new return immediately.
2. Retry through the same workflow using the preserved command identity.
3. A matching retry should return the existing result safely.
4. If the material request changed, the Server should reject it as an idempotency conflict.
5. Check Return History before starting a replacement transaction.

Never create a second Sale Return merely because the first response was not visible.

## Stock Conflict Recovery

If the system reports that stock or eligibility changed:

1. Stop the current completion attempt.
2. Reload eligibility.
3. Reinspect the returned item and available quantity.
4. Rebuild the refund projection.
5. Submit again only after the current state is confirmed.

The failed attempt must not be treated as partially completed.

## Approval Failure Recovery

If a deducted refund is rejected due to insufficient authority:

1. Keep the selected items and proposed deduction for review.
2. Ask an OWNER, MANAGER, ADMIN, or SUPER_ADMIN to review.
3. Record or correct the deduction reason.
4. Complete the return only under the authorized session or approved workflow supported by the system.

Do not bypass the approval rule by changing refund evidence outside the Sale Return workflow.

## Return History and Detail

Use Return History to verify:

- whether the return already completed;
- Sale Return code and date;
- original Sale reference;
- returned items and quantities;
- refund evidence;
- employee responsible;
- current shop ownership.

History and detail must remain branch-scoped. Returns from another independent shop must not be displayed.

## Credit Note, Tax, and Accounting Boundary

The current Sale Return runtime evidence does not prove that Credit Note generation or tax adjustment is transactionally completed by the Sale Return workflow.

Therefore:

- do not promise that a Credit Note was generated unless the document exists;
- do not treat Sale Return completion alone as proof of tax adjustment;
- follow the separate tax/accounting workflow when required;
- record downstream pending work without creating a duplicate Sale Return.

## Troubleshooting

### Sale not found

- confirm the correct shop session;
- confirm the Sale ID or document;
- verify that the Sale belongs to this shop;
- do not search across unrelated shops.

### No eligible items

- the items may already be returned;
- the selected Sale may not contain returnable lines;
- reload eligibility and review prior returns.

### Quantity exceeds eligibility

- lower the quantity to the remaining returnable amount;
- refresh if another return may have completed.

### Refund evidence mismatch

- add the refund channels again;
- ensure the combined amount equals the approved refund total;
- verify payment-source limits.

### Deduction approval required

- add a clear reason;
- ask an authorized role to approve;
- do not reduce the refund without authority.

### Completion conflict

- reload eligibility;
- inspect current stock and prior returns;
- retry only after rebuilding the command from current data.

### Unsure whether completion succeeded

- keep the same command identity;
- retry safely;
- check Return History before creating anything new.

## Completion Checklist

A Sale Return operation is operationally complete only when:

- the Server confirms completion or safe replay;
- returned stock was restored according to item type;
- refund evidence matches the approved refund;
- deduction approval exists when required;
- the return appears in branch-scoped history;
- any Credit Note, tax, or accounting follow-up is tracked separately;
- no duplicate Sale Return was created.

## Scope Exclusions

This guide does not authorize:

- cross-shop Sale or Return access;
- deletion of legacy compatibility paths;
- manual stock mutation outside Sale Return authority;
- unsupported refund methods;
- bypassing deduction approval;
- claiming Credit Note or tax completion without evidence.
