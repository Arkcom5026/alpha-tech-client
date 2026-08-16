# Wave 224 — Combined Billing history/detail read authority

Date: 2026-08-17
Branch: `feature/action-feedback-residual-wave-224`
Base: `feature/action-feedback-residual-wave-223`

## Residual found

`combinedBillingStore.js` still had two canonical read paths without request ownership: consolidated-delivery history and selected consolidated-delivery detail. A slower older history refresh could overwrite newer history, and a detail request for Document A could complete after navigation to Document B and replace `selectedDocument` with A. The detail path also kept the previous selected document visible while the next identity was loading.

## Change

- Added independent history and detail request sequences.
- History writes only from the latest history request; stale success/error outcomes return `null`.
- Detail snapshots the numeric document id before the request.
- Detail clears the prior selected document when a new document context begins.
- Detail writes only from the newest detail owner; stale success/error outcomes are discarded.

## Authority model

The latest history refresh owns `history`. The latest document-detail request owns `selectedDocument`. History refreshes and route-to-route detail reads remain independent so older requests cannot resurrect obsolete document state.

## Contract

`tests/combined-billing-history-detail-read-authority.contract.test.js` locks sequencing, immutable document identity, stale outcome suppression, and selected-document clearing.

## Scope

Expected changed files only:

1. `src/features/combinedBilling/store/combinedBillingStore.js`
2. `tests/combined-billing-history-detail-read-authority.contract.test.js`
3. `docs/audits/action-feedback-combined-billing-wave-224-2026-08-17.md`
