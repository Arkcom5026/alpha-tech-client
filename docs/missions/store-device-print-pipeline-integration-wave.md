# Store Device Print Pipeline Integration Wave

## Mission
Integrate editable sales and delivery documents with immutable print snapshots, print profiles and idempotent device jobs.

## Scope
- Editable document to published print snapshot boundary
- Print profile resolution and compatibility checks
- Idempotent PRINT job request contract
- Dynamic roll-height projection authority
- Adapter capability selection contract
- Print status/result projection

## Invariants
- Existing receipt and delivery-note editing remains unchanged
- Printing freezes only the submitted snapshot, not the editable source
- Documents reference profiles rather than queue names
- Duplicate clicks do not create duplicate jobs
- No physical execution in this wave

## Dependency
Durable end-to-end binding waits for server job API and client persistence binding authority.
