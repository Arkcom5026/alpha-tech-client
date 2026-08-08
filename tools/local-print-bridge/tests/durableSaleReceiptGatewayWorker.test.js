import test from 'node:test'
import assert from 'node:assert/strict'
import { createDurableSaleReceiptGatewayWorker } from '../src/durableSaleReceiptGatewayWorker.js'

const jsonResponse = (status, body) => ({
  ok: status >= 200 && status < 300,
  status,
  async json() { return body },
})

const authority = Object.freeze({
  gateway: { gatewayId: 'gw-1' },
  session: { sessionId: 'session-1' },
  heartbeat: {},
  authority: Object.freeze({ gatewayId: 'gw-1', sessionId: 'session-1' }),
})

const baseOptions = ({ jobs = [], executeImpl = async () => ({ ok: true }) } = {}) => {
  const heartbeatCalls = []
  const executeCalls = []
  const gatewayClient = {
    async heartbeat(input) {
      heartbeatCalls.push(input)
      return { ...input, heartbeatAt: '2026-08-08T05:40:00.000Z' }
    },
  }
  const runtime = {
    async execute(input) {
      executeCalls.push(input)
      return executeImpl(input)
    },
  }
  const fetchImpl = async (_url, options) => {
    assert.equal(options.method, 'GET')
    assert.equal(options.headers.Authorization, 'Bearer test')
    return jsonResponse(200, { data: jobs })
  }
  return { gatewayClient, runtime, fetchImpl, heartbeatCalls, executeCalls }
}

test('bootstraps authority, heartbeats, and executes only one eligible SALE_RECEIPT job per tick', async () => {
  const jobs = [
    { jobId: 'other', jobType: 'PRINT_DOCUMENT', source: 'DELIVERY_NOTE', status: 'PENDING', requestSnapshot: { documentPurpose: { code: 'DELIVERY_NOTE' } } },
    { jobId: 'sale-1', jobType: 'PRINT_DOCUMENT', source: 'SALE_RECEIPT', status: 'PENDING', requestSnapshot: { documentPurpose: { code: 'SALE_RECEIPT' } } },
    { jobId: 'sale-2', jobType: 'PRINT_DOCUMENT', source: 'SALE_RECEIPT', status: 'PENDING', requestSnapshot: { documentPurpose: { code: 'SALE_RECEIPT' } } },
  ]
  const options = baseOptions({ jobs })
  let bootstrapCalls = 0
  const worker = createDurableSaleReceiptGatewayWorker({
    enabled: true,
    serverBaseUrl: 'https://server.example',
    authorization: 'Bearer test',
    gatewayId: 'gw-1',
    printerProfileId: 'windows:EPSON',
    confirmation: 'approved-once',
    fetchImpl: options.fetchImpl,
    runtime: options.runtime,
    gatewayClient: options.gatewayClient,
    bootstrapSession: async ({ gatewayId }) => {
      bootstrapCalls += 1
      assert.equal(gatewayId, 'gw-1')
      return authority
    },
    now: () => new Date('2026-08-08T05:40:00.000Z'),
  })

  const result = await worker.tick()
  assert.equal(result.mode, 'EXECUTED')
  assert.equal(result.jobId, 'sale-1')
  assert.equal(bootstrapCalls, 1)
  assert.equal(options.heartbeatCalls.length, 1)
  assert.equal(options.executeCalls.length, 1)
  assert.deepEqual(options.executeCalls[0], {
    jobId: 'sale-1',
    gatewayId: 'gw-1',
    sessionId: 'session-1',
    expiresAt: '2026-08-08T05:55:00.000Z',
    printerProfileId: 'windows:EPSON',
    confirmation: 'approved-once',
  })
})

test('accepts LEASED sale receipt jobs so an expired server lease can be replaced safely', async () => {
  const options = baseOptions({ jobs: [
    { jobId: 'sale-leased', jobType: 'PRINT_DOCUMENT', source: 'SALE_RECEIPT', status: 'LEASED', requestSnapshot: { documentPurpose: { code: 'SALE_RECEIPT' } } },
  ] })
  const worker = createDurableSaleReceiptGatewayWorker({
    enabled: true,
    serverBaseUrl: 'https://server.example',
    authorization: 'Bearer test',
    gatewayId: 'gw-1',
    printerProfileId: 'windows:EPSON',
    confirmation: 'approved-once',
    fetchImpl: options.fetchImpl,
    runtime: options.runtime,
    gatewayClient: options.gatewayClient,
    bootstrapSession: async () => authority,
  })

  const result = await worker.tick()
  assert.equal(result.mode, 'EXECUTED')
  assert.equal(options.executeCalls[0].jobId, 'sale-leased')
})

test('blocks automatic physical retry after completion becomes unconfirmed', async () => {
  const completionError = Object.assign(new Error('completion unknown'), {
    code: 'DURABLE_PRINT_COMPLETION_UNCONFIRMED',
  })
  const options = baseOptions({
    jobs: [
      { jobId: 'sale-1', jobType: 'PRINT_DOCUMENT', source: 'SALE_RECEIPT', status: 'LEASED', requestSnapshot: { documentPurpose: { code: 'SALE_RECEIPT' } } },
    ],
    executeImpl: async () => { throw completionError },
  })
  const logs = []
  const worker = createDurableSaleReceiptGatewayWorker({
    enabled: true,
    serverBaseUrl: 'https://server.example',
    authorization: 'Bearer test',
    gatewayId: 'gw-1',
    printerProfileId: 'windows:EPSON',
    confirmation: 'approved-once',
    fetchImpl: options.fetchImpl,
    runtime: options.runtime,
    gatewayClient: options.gatewayClient,
    bootstrapSession: async () => authority,
    logger: { error(...args) { logs.push(args) } },
  })

  await assert.rejects(() => worker.tick(), (error) => error.code === 'DURABLE_PRINT_COMPLETION_UNCONFIRMED')
  assert.deepEqual(worker.readiness.blockedJobIds, ['sale-1'])
  assert.equal(options.executeCalls.length, 1)

  const second = await worker.tick()
  assert.equal(second.mode, 'NO_ELIGIBLE_JOB')
  assert.equal(options.executeCalls.length, 1)
  assert.equal(logs.length, 1)
})

test('stays fail-closed while worker is disabled', async () => {
  const options = baseOptions()
  const worker = createDurableSaleReceiptGatewayWorker({
    enabled: false,
    serverBaseUrl: 'https://server.example',
    authorization: 'Bearer test',
    gatewayId: 'gw-1',
    printerProfileId: 'windows:EPSON',
    confirmation: 'approved-once',
    fetchImpl: options.fetchImpl,
    runtime: options.runtime,
    gatewayClient: options.gatewayClient,
    bootstrapSession: async () => authority,
  })

  await assert.rejects(() => worker.tick(), (error) => error.code === 'DURABLE_SALE_RECEIPT_WORKER_DISABLED')
  assert.equal(options.executeCalls.length, 0)
})
