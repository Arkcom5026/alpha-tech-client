import assert from 'node:assert/strict'
import test from 'node:test'
import {
  createDurablePrintLeaseClient,
} from '../src/durablePrintLeaseClient.js'

const createResponse = ({ ok = true, status = 201, body }) => ({
  ok,
  status,
  async json() {
    return body
  },
})

const envelope = Object.freeze({
  schemaVersion: 1,
  job: Object.freeze({
    jobId: 'sdj_sale_receipt_1',
    jobType: 'PRINT_DOCUMENT',
    source: 'SALE_RECEIPT',
    correlationId: null,
    causationId: null,
  }),
  lease: Object.freeze({
    leaseId: 'sdl_sale_receipt_1',
    attemptNumber: 1,
    expiresAt: '2026-08-08T05:00:00.000Z',
  }),
  documentPurpose: Object.freeze({
    code: 'SALE_RECEIPT',
    displayName: 'Sale Receipt',
  }),
  source: Object.freeze({ type: 'PAYMENT', id: 638 }),
  print: Object.freeze({ copies: 1 }),
  projection: Object.freeze({ document: { type: 'SALE_RECEIPT' } }),
})

test('leases a durable print job and preserves immutable execution envelope authority', async () => {
  const calls = []
  const client = createDurablePrintLeaseClient({
    serverBaseUrl: 'https://api.example.test/',
    getAuthorization: async () => 'Bearer test-token',
    fetchImpl: async (url, options) => {
      calls.push({ url, options })
      return createResponse({
        body: {
          data: {
            lease: { leaseId: 'sdl_sale_receipt_1', attemptNumber: 1 },
            executionEnvelope: envelope,
          },
        },
      })
    },
  })

  const result = await client.lease({
    jobId: 'sdj_sale_receipt_1',
    gatewayId: 'gw-alpha-1',
    sessionId: 'session-alpha-1',
    expiresAt: '2026-08-08T05:00:00.000Z',
  })

  assert.equal(calls.length, 1)
  assert.equal(
    calls[0].url,
    'https://api.example.test/api/store-devices/print/jobs/sdj_sale_receipt_1/leases',
  )
  assert.equal(calls[0].options.method, 'POST')
  assert.equal(calls[0].options.headers.Authorization, 'Bearer test-token')
  assert.deepEqual(JSON.parse(calls[0].options.body), {
    gatewayId: 'gw-alpha-1',
    sessionId: 'session-alpha-1',
    expiresAt: '2026-08-08T05:00:00.000Z',
  })
  assert.equal(result.executionEnvelope, envelope)
  assert.equal(result.lease.leaseId, envelope.lease.leaseId)
  assert.equal(result.authority.jobId, envelope.job.jobId)
})

test('rejects invalid durable execution envelopes before local print execution', async () => {
  const client = createDurablePrintLeaseClient({
    serverBaseUrl: 'https://api.example.test',
    fetchImpl: async () => createResponse({
      body: {
        data: {
          lease: { leaseId: 'sdl_bad' },
          executionEnvelope: {
            ...envelope,
            documentPurpose: { code: '' },
            lease: { ...envelope.lease, leaseId: 'sdl_bad' },
          },
        },
      },
    }),
  })

  await assert.rejects(
    client.lease({
      jobId: 'sdj_sale_receipt_1',
      gatewayId: 'gw-alpha-1',
      sessionId: 'session-alpha-1',
      expiresAt: '2026-08-08T05:00:00.000Z',
    }),
    (error) => error.code === 'PRINT_BRIDGE_EXECUTION_ENVELOPE_INVALID',
  )
})

test('rejects lease/job mismatches and propagates server failure codes', async () => {
  const mismatchClient = createDurablePrintLeaseClient({
    serverBaseUrl: 'https://api.example.test',
    fetchImpl: async () => createResponse({
      body: {
        data: {
          lease: { leaseId: 'sdl_other' },
          executionEnvelope: envelope,
        },
      },
    }),
  })

  await assert.rejects(
    mismatchClient.lease({
      jobId: 'sdj_sale_receipt_1',
      gatewayId: 'gw-alpha-1',
      sessionId: 'session-alpha-1',
      expiresAt: '2026-08-08T05:00:00.000Z',
    }),
    (error) => error.code === 'PRINT_BRIDGE_LEASE_RESPONSE_MISMATCH',
  )

  const failureClient = createDurablePrintLeaseClient({
    serverBaseUrl: 'https://api.example.test',
    fetchImpl: async () => createResponse({
      ok: false,
      status: 409,
      body: {
        code: 'STORE_DEVICE_JOB_NOT_LEASABLE',
        error: 'Job cannot be leased',
      },
    }),
  })

  await assert.rejects(
    failureClient.lease({
      jobId: 'sdj_sale_receipt_1',
      gatewayId: 'gw-alpha-1',
      sessionId: 'session-alpha-1',
      expiresAt: '2026-08-08T05:00:00.000Z',
    }),
    (error) => (
      error.code === 'STORE_DEVICE_JOB_NOT_LEASABLE'
      && error.statusCode === 409
    ),
  )
})
