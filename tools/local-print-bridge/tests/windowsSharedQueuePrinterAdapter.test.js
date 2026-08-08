import assert from 'node:assert/strict'
import test from 'node:test'
import { createWindowsSharedQueuePrinterAdapter } from '../src/windowsSharedQueuePrinterAdapter.js'

const sharedPrinter = Object.freeze({
  id: 'windows:\\\\advice01\\EPSON TM-T82X Receipt',
  name: '\\\\advice01\\EPSON TM-T82X Receipt',
  connection: 'WINDOWS_QUEUE',
  queueAuthority: 'SHARED_CONNECTION',
  isSharedConnection: true,
  isOnline: true,
  workOffline: false,
  capabilities: Object.freeze({
    driverManaged: true,
    raw: false,
    cut: false,
    cashDrawer: false,
  }),
})

const printJob = Object.freeze({
  jobId: 'print-job-1',
  branchId: '2',
  workstationId: 'counter-1',
  printerProfileId: sharedPrinter.id,
  documentType: 'RECEIPT',
  snapshot: Object.freeze({ receiptNumber: 'RC-1' }),
  options: Object.freeze({}),
})

test('prints an online shared queue through the driver-managed boundary', async () => {
  const calls = []
  const adapter = createWindowsSharedQueuePrinterAdapter({
    now: () => new Date('2026-08-06T15:00:00.000Z'),
    spoolPrintImpl: async (request) => {
      calls.push(request)
      return { submitted: true, queue: request.printerName }
    },
  })

  const result = await adapter.print({ printer: sharedPrinter, printJob })

  assert.equal(calls.length, 1)
  assert.equal(calls[0].printerName, sharedPrinter.name)
  assert.equal(calls[0].documentName, printJob.jobId)
  assert.equal(calls[0].printJob, printJob)

  assert.equal(result.status, 'PRINTED')
  assert.equal(result.adapter, 'WINDOWS_SHARED_QUEUE_DRIVER')
  assert.equal(result.driverManaged, true)
  assert.equal(result.capabilitiesUsed.raw, false)
  assert.equal(result.capabilitiesUsed.cut, false)
  assert.equal(result.capabilitiesUsed.cashDrawer, false)
  assert.equal(result.spool.submitted, true)
})

test('rejects local RAW queues from the shared queue adapter', async () => {
  const adapter = createWindowsSharedQueuePrinterAdapter({
    spoolPrintImpl: async () => ({ submitted: true }),
  })

  const localPrinter = {
    ...sharedPrinter,
    id: 'windows:EPSON TM-T82X Receipt',
    name: 'EPSON TM-T82X Receipt',
    queueAuthority: 'LOCAL_QUEUE',
    isSharedConnection: false,
    capabilities: {
      driverManaged: false,
      raw: true,
      cut: true,
      cashDrawer: true,
    },
  }

  await assert.rejects(
    () => adapter.print({ printer: localPrinter, printJob }),
    (error) => error.code === 'SHARED_QUEUE_AUTHORITY_REQUIRED'
  )
})

test('rejects offline shared queues before spool submission', async () => {
  let called = false
  const adapter = createWindowsSharedQueuePrinterAdapter({
    spoolPrintImpl: async () => {
      called = true
      return {}
    },
  })

  await assert.rejects(
    () => adapter.print({
      printer: {
        ...sharedPrinter,
        isOnline: false,
        workOffline: true,
      },
      printJob,
    }),
    (error) => error.code === 'SHARED_QUEUE_OFFLINE'
  )

  assert.equal(called, false)
})


test('prints FULL_TAX_INVOICE through the driver-managed shared queue', async () => {
  const calls = []
  const adapter = createWindowsSharedQueuePrinterAdapter({
    now: () => new Date('2026-08-08T06:00:00.000Z'),
    spoolPrintImpl: async (request) => {
      calls.push(request)
      return { submitted: true, queue: request.printerName }
    },
  })

  const fullTaxInvoiceJob = {
    ...printJob,
    jobId: 'full-tax-invoice-job-1',
    documentType: 'FULL_TAX_INVOICE',
    snapshot: Object.freeze({
      documentType: 'FULL_TAX_INVOICE',
      taxInvoiceNumber: 'TX-2026-0001',
    }),
  }

  const result = await adapter.print({
    printer: sharedPrinter,
    printJob: fullTaxInvoiceJob,
  })

  assert.equal(calls.length, 1)
  assert.equal(calls[0].printerName, sharedPrinter.name)
  assert.equal(calls[0].documentName, fullTaxInvoiceJob.jobId)
  assert.equal(calls[0].printJob, fullTaxInvoiceJob)

  assert.equal(result.status, 'PRINTED')
  assert.equal(result.adapter, 'WINDOWS_SHARED_QUEUE_DRIVER')
  assert.equal(result.driverManaged, true)
  assert.equal(result.capabilitiesUsed.raw, false)
})
