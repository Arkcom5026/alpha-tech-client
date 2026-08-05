# Sale Completion Browser E2E

Module-owned Browser E2E package for POS sale completion.

## Authority split

- `saleCompletion.browser.spec.js` proves staff can operate the real Sale UI against the Test DB runtime.
- No API interception, mock response, store injection, or browser-side database access is allowed.
- Paired Server E2E should provision isolated Test-DB fixtures and verify database post-conditions read-only.

## Flow authority

This package covers:

Login/session bootstrap → POS Sale → Customer → Product → Payment → Sale Completion → Receipt/Bill Print.
