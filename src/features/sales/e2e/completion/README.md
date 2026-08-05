# Sale Completion Browser E2E

Module-owned Browser E2E package for POS sale completion.

## Authority split

- `saleCompletion.browser.spec.js` proves staff can operate the real Sale UI against the Test DB runtime.
- No API interception, mock response, store injection, or browser-side database access is allowed.
- Paired Server E2E should provision isolated Test-DB fixtures and verify database post-conditions read-only.

## Authentication authority

Sale E2E follows the Repair E2E pattern:

- authentication is prepared by runtime bootstrap/storage state
- business-flow tests do not repeat manual login steps
- authentication failures must be reported as runtime authority failures

## Flow authority

This package covers:

Authentication bootstrap → POS Sale → Customer → Product → Payment → Sale Completion → Receipt/Bill Print → Evidence verification.

## Document handoff verification

The completion flow must verify both supported receipt handoff modes:

- popup/new tab receipt document
- same-tab receipt document fallback

The test must prove the authenticated session remains valid across the handoff.