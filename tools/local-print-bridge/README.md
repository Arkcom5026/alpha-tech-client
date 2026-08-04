# Alpha-Tech Local Print Bridge

Windows-local POS printing runtime for Alpha-Tech. The bridge exposes loopback HTTP, discovers Windows printer queues, renders short tax invoices to ESC/POS bytes, and keeps physical RAW printing behind an explicit feature gate.

## Run safely

```powershell
cd tools/local-print-bridge
npm test
npm start
```

Default mode does **not** send data to a physical printer.

```text
http://127.0.0.1:17451
```

## Endpoints

```text
GET  /health
GET  /v1/printers
POST /v1/print-jobs
```

`GET /v1/printers` returns the mock profile plus queues discovered from Windows through `Win32_Printer`.

## Safe discovery gate

```powershell
Invoke-RestMethod http://127.0.0.1:17451/health
(Invoke-RestMethod http://127.0.0.1:17451/v1/printers).printers | Format-Table id,name,driverName,portName,connection,isOnline
```

Confirm that the expected EPSON queue appears with an id such as:

```text
windows:EPSON TM-T82X Receipt
```

## Mock print gate

Use `printerProfileId = mock-epson-tm-t82x`. Expected result remains:

```text
accepted=True status=PRINTED adapter=MOCK
```

## Physical RAW pilot — explicit authority only

Physical dispatch is disabled unless the process is started with:

```powershell
$env:ALPHA_PRINT_BRIDGE_ENABLE_RAW='1'
npm start
```

Before enabling it:

1. Confirm the exact Windows queue name from `/v1/printers`.
2. Load receipt paper and clear the cutter path.
3. Use one approved test document only.
4. Set `printerProfileId` to the exact `windows:<queue name>` value.
5. Keep the mock profile available as fallback.

The bridge then:

```text
Print Job
→ ESC/POS UTF-8 byte renderer
→ Windows RAW spooler
→ feed 4 lines
→ GS V partial cut
```

The raw helper uses the Windows spooler with data type `RAW`. Printer firmware/code-page support still determines Thai text output quality; Thai glyph certification is a separate runtime gate before production adoption.

## Safety boundaries

- Binds to loopback only by default.
- Validates branch, workstation, printer profile, document type, and snapshot.
- Physical writes require `ALPHA_PRINT_BRIDGE_ENABLE_RAW=1`.
- No automatic replacement of `window.print()` yet.
- No Windows Service installer yet.
- No production cutover until physical receipt, Thai text, feed, cut, retry, and duplicate-print gates pass.
