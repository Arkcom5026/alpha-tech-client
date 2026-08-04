# Alpha-Tech Local Print Bridge

Node.js foundation for the Windows-local POS printing runtime. This increment proves the HTTP boundary and print-job lifecycle with a mock EPSON TM-T82X adapter before real ESC/POS and Windows Service integration.

## Run

```powershell
cd tools/local-print-bridge
npm test
npm start
```

The service listens only on:

```text
http://127.0.0.1:17451
```

## Endpoints

```text
GET  /health
GET  /v1/printers
POST /v1/print-jobs
```

## Manual verification

```powershell
Invoke-RestMethod http://127.0.0.1:17451/health
Invoke-RestMethod http://127.0.0.1:17451/v1/printers
```

Submit a mock print job:

```powershell
$job = @{
  jobId = 'local-test-1'
  branchId = '2'
  workstationId = 'counter-01'
  printerProfileId = 'mock-epson-tm-t82x'
  documentType = 'SHORT_TAX_INVOICE'
  snapshot = @{
    documentId = '875'
    documentNumber = 'SL-022608-0001'
    total = 250
  }
  options = @{
    cut = 'PARTIAL'
  }
} | ConvertTo-Json -Depth 10

Invoke-RestMethod `
  -Method Post `
  -Uri http://127.0.0.1:17451/v1/print-jobs `
  -ContentType 'application/json' `
  -Body $job
```

Expected result is `accepted: true`, `status: PRINTED`, and `adapter: MOCK`. No physical printer is touched in this increment.

## Safety boundary

- Binds to loopback only by default.
- Validates branch, workstation, printer profile, document type, and immutable snapshot.
- Uses a mock adapter; no raw printer writes or cutter commands yet.
- Does not replace `window.print()` yet.
