# Sale E2E Test Tenant Mission

## Purpose

Define isolated Test DB fixture requirements for Sale Completion E2E.

## Required fixture evidence

- merchant/store scope
- authenticated employee
- customer owned by the store
- sellable product owned by the store
- available inventory
- expected sale total

The fixture must be created by the paired Server E2E package and verified read-only after browser execution.