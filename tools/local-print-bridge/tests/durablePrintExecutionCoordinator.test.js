import test from 'node:test'
import assert from 'node:assert/strict'
import { createDurablePrintExecutionCoordinator } from '../src/durablePrintExecutionCoordinator.js'

const leaseContext = Object.freeze({
  lease: Object.freeze({ leaseId: 'lease-1' }),
  executionEnvelope: Object.freeze({
    schemaVersion: 1,
    job: Object.freeze({
      jobId: 'job-1',
      jobType: 'PRINT_DOCUMENT',
      source: 'SALE_RECEIPT',
      correlationId: null,
      causationId: null,
    }),
    lease: Object.freeze({
      leaseId: 'lease-1',
      attemptNumber: 1,
      expiresAt: new Date(Date.now() + 60_000).toISOString(),
    }),
    documentPurpose: Object.freeze({ code: 'SALE_RECEIPT', displayName: 'Receipt' }),
    source: Object.freeze({ type: 'PAYMENT', id: 638 }),
    print: Object.freeze({ copies: 1 }),
    projection: Object.freeze({ document: { type: 'SALE_RECEIPT' } }),
  }),
  authority: Object.freeze({
    serverBaseUrl: 'https://server.example',
    jobId: 'job-1',
    gatewayId: 'gw-1',
    sessionId: 'sess-1',
  }),
})

const response = (status, payload) => ({
  ok: status >= 200 && status < 300,
  status,
  async json() { return payload },
})

test('acknowledges, executes locally, then completes with durable submission evidence', async () => {
  const calls = []
  const fetchImpl = async (url, options) => {
    calls.push({ url, options, body: JSON.parse(options.body) })
    if (url.endsWith('/acknowledge')) return response(200, { data: { acknowledged: true } })
    if (url.endsWith('/complete')) return response(200, { data: { status: 'SUCCEEDED' } })
    throw new Error(`unexpected url: ${url}`)
  }

  const coordinator = createDurablePrintExecutionCoordinator({
    serverBaseUrl: 'https://server.example/',
    fetchImpl,
    getAuthorization: async () => 'Bearer test-token',
    createResultId: () => 'result-1',
    localExecutor: {
      async execute(envelope, options) {
        assert.equal(envelope, leaseContext.executionEnvelope)
        assert.equal(options.approvalToken, 'approved')
        return Object.freeze({
          schemaVersion: 1,
          adapter: 'SALE_RECEIPT_SUMATRA',
          status: 'SUCCEEDED',
          durationMs: 12,
          evidence: Object.freeze({
            meaning: 'PRINT_SUBMISSION_ACCEPTED',
            physicalOutputConfirmed: false,
            transport: Object.freeze({ code: 'SUMATRA_PDF' }),
          }),
          error: null,
        })
      },
    },
  })

  const result = await coordinator.execute({
    leaseContext,
    executorOptions: { approvalToken: 'approved' },
  })

  assert.equal(result.lifecycleStatus, 'SUCCEEDED')
  assert.equal(result.resultId, 'result-1')
  assert.deepEqual(calls.map((call) => call.url), [
    'https://server.example/api/store-devices/print/leases/lease-1/acknowledge',
    'https://server.example/api/store-devices/print/leases/lease-1/complete',
  ])
  assert.equal(calls[0].body.gatewayId, 'gw-1')
  assert.equal(calls[0].body.sessionId, 'sess-1')
  assert.equal(calls[0].options.headers.Authorization, 'Bearer test-token')
  assert.equal(calls[1].body.resultId, 'result-1')
  assert.equal(calls[1].body.executionSnapshot.status, 'SUCCEEDED')
  assert.equal(calls[1].body.adapterEvidence.adapter, 'SALE_RECEIPT_SUMATRA')
  assert.equal(calls[1].body.adapterEvidence.evidence.physicalOutputConfirmed, false)
  assert.equal(calls[1].body.transportEvidence.code, 'SUMATRA_PDF')
})

test('reports fail only when local execution itself fails', async () => {
  const calls = []
  const fetchImpl = async (url, options) => {
    calls.push({ url, body: JSON.parse(options.body) })
    if (url.endsWith('/acknowledge')) return response(200, { data: { acknowledged: true } })
    if (url.endsWith('/fail')) return response(200, { data: { status: 'FAILED' } })
    throw new Error(`unexpected url: ${url}`)
  }

  const coordinator = createDurablePrintExecutionCoordinator({
    serverBaseUrl: 'https://server.example',
    fetchImpl,
    createResultId: () => 'result-fail',
    localExecutor: {
      async execute() {
        throw Object.assign(new Error('printer unavailable'), {
          code: 'LOCAL_PRINTER_UNAVAILABLE',
          adapter: 'SALE_RECEIPT_SUMATRA',
        })
      },
    },
  })

  const result = await coordinator.execute({ leaseContext })

  assert.equal(result.lifecycleStatus, 'FAILED')
  assert.deepEqual(calls.map((call) => call.url), [
    'https://server.example/api/store-devices/print/leases/lease-1/acknowledge',
    'https://server.example/api/store-devices/print/leases/lease-1/fail',
  ])
  assert.equal(calls[1].body.executionSnapshot.status, 'FAILED')
  assert.equal(calls[1].body.errorMetadata.code, 'LOCAL_PRINTER_UNAVAILABLE')
})

test('does not report fail when local submission succeeded but completion is unconfirmed', async () => {
  const calls = []
  const fetchImpl = async (url, options) => {
    calls.push({ url, body: JSON.parse(options.body) })
    if (url.endsWith('/acknowledge')) return response(200, { data: { acknowledged: true } })
    if (url.endsWith('/complete')) {
      return response(503, { code: 'SERVER_UNAVAILABLE', message: 'temporarily unavailable' })
    }
    if (url.endsWith('/fail')) throw new Error('fail endpoint must not be called after successful submission')
    throw new Error(`unexpected url: ${url}`)
  }

  const coordinator = createDurablePrintExecutionCoordinator({
    serverBaseUrl: 'https://server.example',
    fetchImpl,
    createResultId: () => 'result-ambiguous',
    localExecutor: {
      async execute() {
        return Object.freeze({
          schemaVersion: 1,
          adapter: 'SALE_RECEIPT_SUMATRA',
          status: 'SUCCEEDED',
          durationMs: 4,
          evidence: Object.freeze({
            meaning: 'PRINT_SUBMISSION_ACCEPTED',
            physicalOutputConfirmed: false,
          }),
          error: null,
        })
      },
    },
  })

  const result = await coordinator.execute({ leaseContext })

  assert.equal(result.lifecycleStatus, 'COMPLETION_UNCONFIRMED')
  assert.equal(result.completionError.code, 'SERVER_UNAVAILABLE')
  assert.equal(result.safety.localExecutionSucceeded, true)
  assert.equal(result.safety.completionConfirmed, false)
  assert.equal(result.safety.failureReported, false)
  assert.equal(result.safety.retryRequiresReconciliation, true)
  assert.equal(result.safety.automaticPhysicalRetryAllowed, false)
  assert.deepEqual(calls.map((call) => call.url), [
    'https://server.example/api/store-devices/print/leases/lease-1/acknowledge',
    'https://server.example/api/store-devices/print/leases/lease-1/complete',
  ])
})
