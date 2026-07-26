# Alpha-Tech Tax Platform — Current UI Inventory and Contract Freeze

Status: Slice 1 — Repository Gate
Branch: `feature/tax-platform-authority`
Scope: Frontend inventory only; no API behavior change in this slice.

## 1. Purpose

This document freezes the current user-visible tax workflows while the independent Tax Platform is introduced. The frontend must preserve current sale printing, input tax reporting, output tax reporting, and purchase receipt entry until replacement contracts are available from the backend.

## 2. Current frontend tax surfaces

### 2.1 Full tax invoice and bill printing

Current files include:

- `src/features/bill/components/BillLayoutFullTax.jsx`
- `src/features/bill/pages/PrintBillPageFullTax.jsx`
- `src/features/customerReceipt/components/CustomerReceiptPrintLayout.jsx`
- `src/features/deliveryNote/components/DeliveryNoteForm.jsx`

The current print flow uses sale data and related branch/customer information. It already benefits from retaining sale item values instead of looking up current product prices, but it is not yet backed by an immutable Tax Document snapshot.

### 2.2 Output tax report

Current files include:

- `src/features/salesTaxReport/api/salesTaxReportApi.js`
- `src/features/salesTaxReport/store/salesTaxReportStore.js`
- `src/features/salesTaxReport/pages/ListSalesTaxReportPage.jsx`
- `src/features/salesTaxReport/pages/PrintSalesTaxReportPage.jsx`

### 2.3 Input tax report

Current files include:

- `src/features/inputTaxReport/api/inputTaxReportApi.js`
- `src/features/inputTaxReport/store/inputTaxReporStore.js`
- `src/features/inputTaxReport/pages/ListInputTaxReportPage.jsx`
- `src/features/inputTaxReport/pages/PrintInputTaxReportPage.jsx`
- `src/features/inputTaxReport/components/InputTaxReportTable.jsx`

Note: the existing store filename contains `Repor` and is frozen for compatibility until a dedicated cleanup slice.

### 2.4 Purchase receipt tax capture

Current files include:

- `src/features/purchaseOrderReceipt/pages/CreatePurchaseOrderReceiptPage.jsx`
- `src/features/purchaseOrderReceipt/components/POItemListForReceipt.jsx`

The UI currently captures supplier tax invoice number/date and VAT-related receipt data directly within the procurement workflow.

## 3. Frozen UI contracts

Until an explicit cutover slice is approved:

1. Existing routes and navigation to input/output tax reports must remain operational.
2. Current tax invoice printing must remain available from the existing sale/bill workflow.
3. Existing report API clients and response assumptions must not be changed without a backend contract handoff.
4. Purchase receipt users must continue to capture supplier invoice number/date.
5. Existing report totals, columns, print layouts, and Thai user labels must not silently change.
6. Tax workflow components remain owned by their current feature modules until the new `tax` workspace has a complete replacement surface.
7. No shared/common workflow component will be introduced merely to support the migration; the Tax module will own its workflow UI.
8. Existing desktop behavior must be preserved while new Tax UI is designed mobile-safe.

## 4. Target frontend ownership

The future Tax workspace will own:

- candidate review queue
- tax document detail and immutable snapshot display
- issuance and numbering status
- input/output tax ledger views
- reconciliation exceptions
- tax period close
- filing and settlement evidence
- correction, cancellation, credit note, and debit note workflows
- tax configuration surfaces where authorized

Sales, procurement, repair, and expense screens will expose source facts and tax handoff status, but will not own legal tax lifecycle decisions.

## 5. API handoff rule

Frontend implementation of each new Tax capability begins only after the backend publishes:

- endpoint and method
- request contract
- response contract
- error codes
- permission requirements
- lifecycle/status meanings
- compatibility behavior

The frontend must not infer a contract from Prisma models.

## 6. Slice 1 completion criteria

- Existing frontend tax surfaces identified: PASS
- User-visible compatibility contracts frozen: PASS
- Future Tax workspace ownership recorded: PASS
- API behavior changed: NO
- Runtime certification: NOT APPLICABLE

## 7. Next slice

Slice 2 creates a frontend Tax Module Skeleton only after the initial backend Tax contracts are published. Until then, backend skeleton and contract work is the leading dependency.
