# Sale Completion E2E Expected Outcome

A successful run must prove:

1. Merchant can access POS Sale using prepared authentication state.
2. Customer belongs to the active store scope.
3. Product belongs to the active store scope.
4. Payment completes successfully.
5. Sale completion returns a valid sale identifier.
6. Receipt/bill document opens successfully.
7. Authentication remains valid during document handoff.
8. Server-side verifier confirms expected database post-conditions.