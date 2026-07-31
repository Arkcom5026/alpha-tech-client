# Mission — Warranty Claim DDWD Client Adoption

## Mission

Adopt the Documentation-Driven Workflow Development Standard (DDWD) for the Warranty Claim workflow on the Client side.

## Objective

Elevate the existing contextual Claim section in the Repair Help Center into complete operational guidance without duplicating the shared Help Center or changing claim runtime authority.

## Existing Foundation

- `WarrantyClaimsPage.jsx` uses `RepairShellHeader`.
- The `warranty-claims` route opens the Claim help section contextually.
- Shared search, drawer, accessibility, and close behavior already exist.

## Planned Scope

- expand Claim-specific in-app guidance
- document lifecycle/status meanings and next actions
- add operational checklist
- add FAQ and troubleshooting/recovery guidance
- strengthen focused contract coverage
- run focused verification and production build before readiness

## Documentation Status

- Business manual: companion Server adoption increment
- User guide: planned
- In-app help: planned
- Workflow Assistant: NOT APPLICABLE in this documentation increment; runtime-aware assistance requires separate authority review
- Runtime checklist: static operational checklist planned; runtime-backed checklist is follow-up
- FAQ / troubleshooting: planned
- Known limitation: global mobile POS shell remains a separate agenda

## Runtime Impact

Documentation projection and focused contract only. No API, Prisma, migration, route, claim lifecycle, or production-data change.

## Completion Criteria

- [x] Mission pack exists.
- [ ] Draft PR is opened.
- [ ] Claim guidance is expanded.
- [ ] Focused contract is updated.
- [ ] Focused verification passes.
- [ ] Production build passes.
- [ ] Review and merge decision are recorded.
