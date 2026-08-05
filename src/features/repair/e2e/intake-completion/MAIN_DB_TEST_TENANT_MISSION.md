# Repair Intake Completion — Main-DB Test-Tenant Mission

This Browser E2E package will be adapted to run against the normal development API connected to the Main Database while all fixture data is confined to the dedicated test tenant.

## Fixed Test Tenant

- Branch ID: `13`
- Slug: `test-shop`

## Goals

- keep the existing real Playwright workflow and selectors
- remove the requirement to start a separate Test-DB API for daily workflow testing
- accept an explicit API authority supplied by the runner
- require fixture values emitted by the Server package
- preserve the dedicated Test DB mode as an optional certification path

## Non-Goals

- no API mocking
- no Client store injection
- no writes to a real store
- no Repair workflow behavior changes
