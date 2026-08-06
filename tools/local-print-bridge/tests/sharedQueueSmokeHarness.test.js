import assert from 'node:assert/strict'
import test from 'node:test'
import {
  REQUIRED_CONFIRMATION,
  createSharedQueueSmokeJob,
  runSharedQueueSmoke,
} from '../src/sharedQueueSmokeHarness.js'

const createJsonResponse = (body, { ok = true, status = 200 } = {}) => ({
  ok,
  status,
  json: async () => body,
})

test('creates a customer-data-free driver-managed smoke job', () => {
  const job = createSharedQueueSmokeJob({
    printerProfileId: 'windows:\\\\advice01\\EPSON TM-T82X Receipt',
    confirmation: REQUIRED_CONFIRMATION,
    now: () => new Date('2026-08-06T16:00:00.000Z'),
  })

  assert.equal(job.documentType, 'RECEIPT')
  assert.equal(job.branchId, 'SMOKE_TEST_ONLY')
  assert.equal(job.snapshot.title, 'ALPHA-TECH SHARED QUEUE SMOKE TEST')
  assert.equal(job.snapshot.message, 'NO CUSTOMER DATA / DRIVER-MANAGED PRINT')
  assert.equal(job.options.raw, false)
  assert.equal(job.options.cut, false)
  assert.equal(job.options.cashDrawer, false)
  assert.equal(JSON.stringify(job).includes('customer'), false)
})

test('requires explicit physical smoke confirmation', () => {
  assert.throws(
    () => createSharedQueueSmokeJob({
      printerProfileId: 'windows:shared',
      confirmation: 'NO',
    }),
    (error) => error.code === 'SHARED_QUEUE_SMOKE_CONFIRMATION_REQUIRED'
  )
})

test('checks bridge health and certifies the shared queue adapter result', async () => {
  const calls = []
  const fetchImpl = async (url, options) => {
    calls.push({ url, options })
    if (url.endsWith('/health')) {
      return createJsonResponse({
        ok: true,
        driverManagedPrintingEnabled: true,
        rawPrintingEnabled: false,
      })
    }

    return createJsonResponse({
      accepted: true,
      result: {
        jobId: 'shared-queue-smoke-1',
        status: 'PRINTED',
        adapter: 'WINDOWS_SHARED_QUEUE_DRIVER',
      },
    }, { status: 202 })
  }

  const result = await runSharedQueueSmoke({
    printerProfileId: 'windows:\\\\advice01\\EPSON TM-T82X Receipt',
    confirmation: REQUIRED_CONFIRMATION,
    fetchImpl,
    now: () => new Date('2026-08-06T16:00:00.000Z'),
  })

  assert.equal(calls.length, 2)
  assert.equal(calls[0].url, 'http://127.0.0.1:17451/health')
  assert.equal(calls[1].url, 'http://127.0.0.1:17451/v1/print-jobs')
  assert.equal(calls[1].options.method, 'POST')
  assert.equal(result.result.adapter, 'WINDOWS_SHARED_QUEUE_DRIVER')
})

test('stops before printing when driver-managed routing is unavailable', async () => {
  let callCount = 0
  const fetchImpl = async () => {
    callCount += 1
    return createJsonResponse({
      ok: true,
      driverManagedPrintingEnabled: false,
    })
  }

  await assert.rejects(
    () => runSharedQueueSmoke({
      printerProfileId: 'windows:shared',
      confirmation: REQUIRED_CONFIRMATION,
      fetchImpl,
    }),
    (error) => error.code === 'DRIVER_MANAGED_PRINTING_REQUIRED'
  )

  assert.equal(callCount, 1)
})

test('rejects an unexpected adapter result', async () => {
  const fetchImpl = async (url) => {
    if (url.endsWith('/health')) {
      return createJsonResponse({ ok: true, driverManagedPrintingEnabled: true })
    }

    return createJsonResponse({
      accepted: true,
      result: { status: 'PRINTED', adapter: 'WINDOWS_RAW_ESC_POS' },
    }, { status: 202 })
  }

  await assert.rejects(
    () => runSharedQueueSmoke({
      printerProfileId: 'windows:shared',
      confirmation: REQUIRED_CONFIRMATION,
      fetchImpl,
    }),
    (error) => error.code === 'SHARED_QUEUE_ADAPTER_NOT_USED'
  )
})
