# Delivery Note Wave 2M — Persisted Revision Print Line Grouping

## Production evidence
Sale `SL-022608-0077` / Sale ID `1046` now resolves current revision `DN-SL-022608-0077-R2` correctly. The revision total is correct at 1,170.00 and the fully returned APACER line is absent. The remaining SANDISK stock lines are persisted per serialized source item, so the print surface currently renders three rows of qty 1 instead of one commercial document row of qty 3.

## Authority rule
Persistence keeps immutable source-line granularity for provenance. Print presentation may group persisted revision lines only when commercial presentation identity is equivalent: same product identity, same final unit amount, same document description, and same unit. Grouping must preserve total quantity, total amount, and source line ids.

## Safety
- presentation-only change on the client
- no revision persistence mutation
- no stock, Sale total, AR, payment, settlement, refund, or tax mutation
- rows with different final unit prices or different document descriptions must not merge

## Reference expectation
`DN-SL-022608-0077-R2` should print one SANDISK row with qty 3, unit price 390.00, amount 1,170.00.
