# Flexible Input Tax Receipt Links — Frontend Adoption

## Mission
Adopt the backend receipt-link contract and provide a tax-owned workspace for filtering, selecting, linking, reallocating, and cancelling PO/Quick Receipt links.

## User Outcome

- Find receipts requiring tax-document action by supplier, source, keyword, date, and link state.
- Select multiple receipts from the same supplier, including mixed `PO_RECEIPT` and `QUICK_RECEIPT` sources.
- Attach selected receipts to one input-tax document.
- Inspect existing links and change allocation or cancel a link without deleting audit history.
- Keep receipts actionable; VAT classification metadata must not become a permanent workflow lock.

## Cross-Repo Contract

Backend Draft PR: Arkcom5026/alpha-tech-server#47

## Gates

- Gate A — Repository: IN PROGRESS
- Gate B — Runtime: DEFERRED — Production Test
- Gate C — Operational: DEFERRED — Production Test
