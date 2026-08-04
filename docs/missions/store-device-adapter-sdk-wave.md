# Store Device Adapter SDK — Parallel Wave

## Mission
Create the transport-neutral adapter SDK used by printers and future store devices without enabling physical execution.

## Required foundation
- Adapter registration contract
- Device discovery contract
- Capability normalization
- Health/status contract
- Execution request/result envelope
- Error taxonomy
- Idempotent adapter registration

## Initial adapter contracts
- ESC/POS
- Windows Queue
- RAW TCP / Wi-Fi
- USB boundary
- Bluetooth boundary

## Invariants
- Every operation is branch-scoped.
- Adapter identity cannot be reassigned across branches.
- Capabilities are explicit; unsupported capabilities must fail closed.
- No physical command is executed in this wave.
- Secrets, addresses and credentials must not be logged.

## Verification
- Contract tests for registration, discovery and capability normalization.
- Cross-branch rejection tests.
- Unsupported capability tests.
- Existing local-print-bridge tests remain green.
