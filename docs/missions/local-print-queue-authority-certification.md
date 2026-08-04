# Local Print Queue Authority Certification

Epic: #86

## Goal
Distinguish a local USB-backed Windows printer queue from a client-side shared printer connection before allowing ESC/POS RAW dispatch.

## Authority Contract
- `LOCAL_QUEUE`: Windows reports `Local=true` and the queue is not a UNC/network connection.
- `SHARED_CONNECTION`: Windows reports `Network=true` or the queue name is UNC (`\\server\share`).
- Physical ESC/POS pilot is allowed only for `LOCAL_QUEUE`.
- Shared connections may remain discoverable for normal Windows printing, but they are not accepted as RAW/cut/cash-drawer authority.

## Runtime Gate
1. Run the Bridge on the computer physically connected to the EPSON TM-T82X by USB.
2. `/v1/printers` must expose the TM-T82X with:
   - `queueAuthority=LOCAL_QUEUE`
   - `isLocalQueue=true`
   - `capabilities.raw=true`
   - `portName=TMUSB...`
3. The UNC alias must be classified as `SHARED_CONNECTION` and `capabilities.raw=false`.
4. Run `npm test`.
5. Arm the guarded pilot with the local queue ID only.
6. Print one ASCII pilot and verify feed/cut physically.

## Safety
- Do not certify the UNC alias as physical RAW authority.
- Do not enable general RAW printing.
- Do not cut over any production document until local physical evidence passes.
