import assert from 'node:assert/strict'
import test from 'node:test'
import {
  createPrinterTestJob,
  createPrinterTestService,
} from '../src/features/printing/settings/printerTestService.js'

test('creates a customer-data-free printer test job for the selected queue', () => {
  const job = createPrinterTestJob({
    branchId: 'branch-1',
    workstationId: 'counter-1',
    documentPurpose: 'RECEIPT',
    printerProfileId: 'windows:shared-receipt',
    now: () => Date.parse('2026-08-07T01:30:00.000Z'),
  })

  assert.equal(job.documentType, 'RECEIPT')
  assert.equal(job.printerProfileId, 'windows:shared-receipt')
  assert.equal(job.snapshot.testPrint, true)
  assert.equal(job.snapshot.message, 'NO CUSTOMER DATA')
  assert.equal(job.options.raw, false)
  assert.equal(job.options.cut, false)
  assert.equal(job.options.cashDrawer, false)
})

test('maps A4 settings tests to a driver-compatible document type', () => {
  const job = createPrinterTestJob({
    branchId: 'branch-1',
    workstationId: 'counter-1',
    documentPurpose: 'A4_DOCUMENT',
    printerProfileId: 'windows:a4-printer',
    now: () => 1,
  })

  assert.equal(job.documentType, 'DELIVERY_NOTE')
  assert.equal(job.snapshot.documentPurpose, 'A4_DOCUMENT')
})

test('dispatches the test job and requires printed confirmation', async () => {
  const calls = []
  const service = createPrinterTestService({
    now: () => 2,
    transport: {
      dispatchPrintJob: async (job) => {
        calls.push(job)
        return {
          accepted: true,
          result: {
            status: 'PRINTED',
            adapter: 'WINDOWS_SHARED_QUEUE_DRIVER',
            printerId: job.printerProfileId,
          },
        }
      },
    },
  })

  const outcome = await service.test({
    branchId: 'branch-1',
    workstationId: 'counter-1',
    documentPurpose: 'RECEIPT',
    printerProfileId: 'windows:shared-receipt',
  })

  assert.equal(calls.length, 1)
  assert.equal(outcome.result.status, 'PRINTED')
  assert.equal(outcome.result.adapter, 'WINDOWS_SHARED_QUEUE_DRIVER')
})

test('rejects bridge responses that do not confirm printing', async () => {
  const service = createPrinterTestService({
    transport: {
      dispatchPrintJob: async () => ({ accepted: true, result: { status: 'FAILED' } }),
    },
  })

  await assert.rejects(
    () => service.test({
      branchId: 'branch-1',
      workstationId: 'counter-1',
      documentPurpose: 'RECEIPT',
      printerProfileId: 'windows:shared-receipt',
    }),
    (error) => error.code === 'PRINTER_TEST_NOT_CONFIRMED'
  )
})

test('requires transport authority and complete printer scope', () => {
  assert.throws(() => createPrinterTestService(), /dispatchPrintJob authority is required/)
  assert.throws(
    () => createPrinterTestJob({
      branchId: 'branch-1',
      workstationId: 'counter-1',
      documentPurpose: 'RECEIPT',
    }),
    /printerProfileId is required/
  )
})
