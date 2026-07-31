# Mission — Receiving and Quick Receipt DDWD Client Adoption

## Mission

Adopt the Documentation-Driven Workflow Development Standard (DDWD) for Receiving and Quick Receipt on the Client side.

## Objective

Add contextual, module-owned operational guidance for quick receiving without PO, covering both resumable sessions and one-shot completion without duplicating receiving runtime ownership.

## Existing Foundation

- `QuickStockPage.jsx`
- `QuickReceiptSessionPanel.jsx`
- `useQuickReceiptSessionController.js`
- local draft persistence for interrupted work
- existing Quick Receipt component/API tests

## Planned Scope

- Receiving/Quick Receipt in-app help content
- explain resumable session versus one-shot completion
- supplier and delivery-note checklist
- DRAFT/FINALIZING/COMPLETED/CANCELLED guidance
- barcode, serial, quantity, and product-mode requirements
- idempotency, duplicate, and recovery guidance
- tax-document capture boundary
- focused contract and dedicated npm test command
- CI gate before production build

## Documentation Status

- Business manual: companion Server adoption increment
- User guide: planned
- In-app help: planned
- Workflow Assistant: NOT APPLICABLE in this documentation increment
- Runtime checklist: static operational checklist planned; runtime-backed checklist is follow-up
- FAQ / troubleshooting: planned
- Known limitation: global mobile POS shell remains a separate agenda

## Runtime Impact

Documentation projection and focused contract only. No API, Prisma, migration, inventory mutation, route, or production-data change.

## Completion Criteria

- [x] Mission pack exists.
- [ ] Draft PR is opened.
- [ ] Receiving guidance is implemented.
- [ ] Focused contract is added.
- [ ] Claim-independent CI gate is added.
- [ ] Focused verification passes.
- [ ] Production build passes.
- [ ] Review and merge decision are recorded.
