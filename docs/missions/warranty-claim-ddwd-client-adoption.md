# Mission — Warranty Claim DDWD Client Adoption

## Mission

Adopt the Documentation-Driven Workflow Development Standard (DDWD) for the Warranty Claim workflow on the Client side.

## Objective

Elevate the existing contextual Claim section in the Repair Help Center into complete operational guidance without duplicating the shared Help Center or changing claim runtime authority.

## Existing Foundation

- `WarrantyClaimsPage.jsx` uses `RepairShellHeader`.
- The `warranty-claims` route opens the Claim help section contextually.
- Shared search, drawer, accessibility, and close behavior already exist.

## Implemented Scope

- Claim-specific in-app guidance
- lifecycle/status meanings and next actions
- operational checklist
- FAQ and troubleshooting/recovery guidance
- focused contract coverage
- dedicated npm test command

## Documentation Status

- Business manual: companion Server adoption increment
- User guide: implemented in Claim section
- In-app help: implemented through module-owned Claim content projection
- Workflow Assistant: NOT APPLICABLE in this documentation increment; runtime-aware assistance requires separate authority review
- Runtime checklist: static operational checklist implemented; runtime-backed checklist is follow-up
- FAQ / troubleshooting: implemented
- Known limitation: global mobile POS shell remains a separate agenda

## Runtime Impact

Documentation projection and focused contract only. No API, Prisma, migration, route, claim lifecycle, or production-data change.

## Completion Criteria

- [x] Mission pack exists.
- [x] Draft PR is opened.
- [x] Claim guidance is expanded.
- [x] Focused contract is added.
- [ ] Focused verification passes.
- [ ] Production build passes.
- [ ] Review and merge decision are recorded.
