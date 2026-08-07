import test from 'node:test'
import assert from 'node:assert/strict'
import { createDurableSaleReceiptPilotRuntime } from '../src/durableSaleReceiptPilotRuntime.js'

const leaseContext = Object.freeze({
  lease: Object.freeze({ leaseId: 'lease-1' }),
  authority: Object.freeze({ gatewayId: 'gw-1', sessionId: 'sess-1' }),
  executionEnvelope: Object.freeze({
    schemaVersion: 1,
    job: Object.freeze({ jobId: 'job-1', jobType: 'PRINT_DOCUMENT' }),
    lease: Object.freeze({ leaseId: 'lease-1', attemptNumber: 1, expiresAt: new Date(Date.now() + 60_000).toISOString() }),
    documentPurpose: Object.freeze({ code: 'SALE_RECEIPT' }),
    source: Object.freeze({ type: 'PAYMENT', id: 10 }),
    print: Object.freeze({ copies: 1 }),
    projection: Object.freeze({ document: { type: 'SALE_RECEIPT' } }),
  }),
})

test('runs only after explicit pilot, exact printer, confirmation, and SALE_RECEIPT authority', async () => {
  const calls = []
  const runtime = createDurableSaleReceiptPilotRuntime({
    enabled: true,
    allowedPrinterId: 'windows:EPSON TM-T82X Receipt',
    confirmationToken: 'approved-once',
    leaseClient: {
      async lease(args) {
        calls.push(['lease', args])
        return leaseContext
      },
    },
    coordinator: {
      async execute(args) {
        calls.push(['execute', args])
        return { lifecycleStatus: 'SUCCEEDED' }
      },
    },
  })

  const result = await runtime.execute({
    jobId: 'job-1',
    gatewayId: 'gw-1',
    sessionId: 'sess-1',
    expiresAt: new Date(Date.now() + 60_000).toISOString(),
    printerProfileId: 'windows:EPSON TM-T82X Receipt',
    confirmation: 'approved-once',
  })

  assert.equal(result.mode, 'DURABLE_SALE_RECEIPT_PILOT')
  assert.equal(result.result.lifecycleStatus, 'SUCCEEDED')
  assert.equal(result.safety.explicitPilotEnabled, true)
  assert.equal(result.safety.exactPrinterMatchVerified, true)
  assert.equal(result.safety.explicitConfirmationVerified, true)
  assert.equal(result.safety.saleReceiptPurposeVerified, true)
  assert.deepEqual(calls.map(([name]) => name), ['lease', 'execute'])
  assert.equal(calls[1][1].executorOptions.printerProfileId, 'windows:EPSON TM-T82X Receipt')
  assert.equal(calls[1][1].executorOptions.durableSaleReceiptPilot, true)
})

test('fails closed while pilot is disabled or printer/confirmation authority does not match', async () => {
  const neverLease = { async lease() { throw new Error('must not lease') } }
  const neverCoordinate = { async execute() { throw new Error('must not execute') } }

  await assert.rejects(
    () => createDurableSaleReceiptPilotRuntime({
      enabled: false,
      allowedPrinterId: 'windows:EPSON',
      confirmationToken: 'token',
      leaseClient: neverLease,
      coordinator: neverCoordinate,
    }).execute({
      printerProfileId: 'windows:EPSON',
      confirmation: 'token',
    }),
    { code: 'DURABLE_SALE_RECEIPT_PILOT_DISABLED' },
  )

  const enabled = createDurableSaleReceiptPilotRuntime({
    enabled: true,
    allowedPrinterId: 'windows:EPSON',
    confirmationToken: 'token',
    leaseClient: neverLease,
    coordinator: neverCoordinate,
  })

  await assert.rejects(
    () => enabled.execute({ printerProfileId: 'windows:OTHER', confirmation: 'token' }),
    { code: 'DURABLE_SALE_RECEIPT_PILOT_PRINTER_NOT_AUTHORIZED' },
  )
  await assert.rejects(
    () => enabled.execute({ printerProfileId: 'windows:EPSON', confirmation: 'wrong' }),
    { code: 'DURABLE_SALE_RECEIPT_PILOT_CONFIRMATION_REQUIRED' },
  )
})

test('rejects non-SALE_RECEIPT durable jobs and refuses to run without a certified local executor', async () => {
  const wrongPurpose = {
    ...leaseContext,
    executionEnvelope: {
      ...leaseContext.executionEnvelope,
      documentPurpose: { code: 'DELIVERY_NOTE' },
    },
  }

  const runtime = createDurableSaleReceiptPilotRuntime({
    enabled: true,
    allowedPrinterId: 'windows:EPSON',
    confirmationToken: 'token',
    leaseClient: { async lease() { return wrongPurpose } },
    coordinator: { async execute() { throw new Error('must not execute') } },
  })

  await assert.rejects(
    () => runtime.execute({
      jobId: 'job-1',
      gatewayId: 'gw-1',
      sessionId: 'sess-1',
      expiresAt: new Date(Date.now() + 60_000).toISOString(),
      printerProfileId: 'windows:EPSON',
      confirmation: 'token',
    }),
    { code: 'DURABLE_SALE_RECEIPT_PURPOSE_REQUIRED' },
  )

  const missingExecutor = createDurableSaleReceiptPilotRuntime({
    enabled: true,
    allowedPrinterId: 'windows:EPSON',
    confirmationToken: 'token',
    serverBaseUrl: 'https://example.invalid',
    fetchImpl: async () => { throw new Error('must not fetch') },
    leaseClient: { async lease() { return leaseContext } },
  })

  await assert.rejects(
    () => missingExecutor.execute({
      jobId: 'job-1',
      gatewayId: 'gw-1',
      sessionId: 'sess-1',
      expiresAt: new Date(Date.now() + 60_000).toISOString(),
      printerProfileId: 'windows:EPSON',
      confirmation: 'token',
    }),
    { code: 'DURABLE_SALE_RECEIPT_LOCAL_EXECUTOR_UNAVAILABLE' },
  )
})
