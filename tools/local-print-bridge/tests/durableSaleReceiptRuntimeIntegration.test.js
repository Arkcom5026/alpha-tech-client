import test from 'node:test'
import assert from 'node:assert/strict'
import crypto from 'node:crypto'
import { createDurableSaleReceiptPilotRuntime } from '../src/durableSaleReceiptPilotRuntime.js'
import { createDurableSaleReceiptLocalExecutor } from '../src/durableSaleReceiptLocalExecutor.js'

const printerId = 'windows:EPSON TM-T82X Receipt'
const pdfBytes = Buffer.from('%PDF-1.4\n%%EOF\n', 'utf8')
const checksumSha256 = crypto.createHash('sha256').update(pdfBytes).digest('hex')

const leaseContext = Object.freeze({
  lease: Object.freeze({ leaseId: 'lease-integration-1' }),
  authority: Object.freeze({ gatewayId: 'gw-1', sessionId: 'sess-1' }),
  executionEnvelope: Object.freeze({
    schemaVersion: 1,
    job: Object.freeze({ jobId: 'job-integration-1', jobType: 'PRINT_DOCUMENT' }),
    lease: Object.freeze({ leaseId: 'lease-integration-1', attemptNumber: 1, expiresAt: new Date(Date.now() + 60_000).toISOString() }),
    documentPurpose: Object.freeze({ code: 'SALE_RECEIPT' }),
    source: Object.freeze({ type: 'PAYMENT', id: 638 }),
    print: Object.freeze({ copies: 1 }),
    projection: Object.freeze({
      document: Object.freeze({ type: 'SALE_RECEIPT', title: 'ใบเสร็จรับเงิน', number: 'PAY-638' }),
      issuer: Object.freeze({ name: 'Advance Tech' }),
      sale: Object.freeze({ totalAmount: 100 }),
      payment: Object.freeze({ amount: 100, items: Object.freeze([]) }),
      lines: Object.freeze([]),
    }),
  }),
})

const jsonResponse = (body, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  async json() { return body },
})

test('composes pilot runtime, coordinator, and local executor without physical side effects in certification', async () => {
  const calls = []
  const localExecutor = createDurableSaleReceiptLocalExecutor({
    renderer: {
      async render({ executionEnvelope, printerId: receivedPrinterId }) {
        calls.push(['render', receivedPrinterId, executionEnvelope.job.jobId])
        return Object.freeze({
          schemaVersion: 1,
          format: 'PDF',
          checksumSha256,
          byteLength: pdfBytes.length,
          pdfBase64: pdfBytes.toString('base64'),
        })
      },
    },
    submitter: {
      async submit({ printerId: receivedPrinterId, artifact }) {
        calls.push(['submit', receivedPrinterId, artifact.checksumSha256])
        return Object.freeze({
          schemaVersion: 1,
          submitted: true,
          printerId: receivedPrinterId,
          artifactChecksumSha256: artifact.checksumSha256,
          physicalOutputConfirmed: false,
          transport: Object.freeze({ code: 'FAKE_CERTIFICATION_TRANSPORT' }),
        })
      },
    },
    now: (() => {
      const values = [1000, 1012]
      return () => values.shift() ?? 1012
    })(),
  })

  const fetchCalls = []
  const fetchImpl = async (url, init = {}) => {
    fetchCalls.push([url, init])
    if (String(url).endsWith('/acknowledge')) {
      return jsonResponse({ data: { acknowledged: true } })
    }
    if (String(url).endsWith('/complete')) {
      return jsonResponse({ data: { status: 'SUCCEEDED' } })
    }
    throw new Error(`unexpected fetch: ${url}`)
  }

  const runtime = createDurableSaleReceiptPilotRuntime({
    enabled: true,
    allowedPrinterId: printerId,
    confirmationToken: 'approved-once',
    serverBaseUrl: 'https://server.example',
    fetchImpl,
    localExecutor,
    leaseClient: { async lease() { return leaseContext } },
    createResultId: () => 'result-integration-1',
  })

  const result = await runtime.execute({
    jobId: 'job-integration-1',
    gatewayId: 'gw-1',
    sessionId: 'sess-1',
    expiresAt: new Date(Date.now() + 60_000).toISOString(),
    printerProfileId: printerId,
    confirmation: 'approved-once',
  })

  assert.equal(result.result.lifecycleStatus, 'SUCCEEDED')
  assert.deepEqual(calls[0], ['render', printerId, 'job-integration-1'])
  assert.deepEqual(calls[1], ['submit', printerId, checksumSha256])
  assert.equal(result.result.executionResult.adapter, 'LOCAL_SALE_RECEIPT_PDF')
  assert.equal(result.result.executionResult.evidence.meaning, 'PRINT_SUBMISSION_ACCEPTED')
  assert.equal(result.result.executionResult.evidence.physicalOutputConfirmed, false)
  assert.equal(result.result.executionResult.evidence.printerId, printerId)
  assert.equal(fetchCalls.length, 2)
  assert.match(fetchCalls[0][0], /\/acknowledge$/)
  assert.match(fetchCalls[1][0], /\/complete$/)
  assert.equal(JSON.parse(fetchCalls[1][1].body).executionSnapshot.evidence.physicalOutputConfirmed, false)
})
