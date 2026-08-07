import assert from 'node:assert/strict'
import test from 'node:test'
import { createDurableSaleReceiptLocalExecutor } from '../src/durableSaleReceiptLocalExecutor.js'

const envelope = Object.freeze({
  schemaVersion: 1,
  job: Object.freeze({ jobId: 'sdj-sale-1', jobType: 'PRINT_DOCUMENT' }),
  lease: Object.freeze({ leaseId: 'sdl-sale-1', attemptNumber: 1, expiresAt: new Date(Date.now() + 60_000).toISOString() }),
  documentPurpose: Object.freeze({ code: 'SALE_RECEIPT', displayName: 'ใบเสร็จรับเงิน' }),
  source: Object.freeze({ type: 'PAYMENT', id: 638 }),
  print: Object.freeze({ copies: 1 }),
  projection: Object.freeze({ document: Object.freeze({ type: 'SALE_RECEIPT' }) }),
})

const checksum = 'a'.repeat(64)

test('renders immutable SALE_RECEIPT projection then submits exact certified artifact', async () => {
  const calls = []
  const executor = createDurableSaleReceiptLocalExecutor({
    now: (() => { let value = 100; return () => (value += 5) })(),
    renderer: {
      async render({ executionEnvelope, printerId }) {
        calls.push('RENDER')
        assert.equal(executionEnvelope, envelope)
        assert.equal(printerId, 'windows:EPSON TM-T82X Receipt')
        return Object.freeze({
          schemaVersion: 1,
          format: 'PDF',
          checksumSha256: checksum,
          byteLength: 2048,
        })
      },
    },
    submitter: {
      async submit({ executionEnvelope, printerId, artifact }) {
        calls.push('SUBMIT')
        assert.equal(executionEnvelope, envelope)
        assert.equal(printerId, 'windows:EPSON TM-T82X Receipt')
        assert.equal(artifact.checksumSha256, checksum)
        return Object.freeze({
          schemaVersion: 1,
          submitted: true,
          printerId,
          artifactChecksumSha256: checksum,
          transport: Object.freeze({ code: 'SUMATRA_PDF', strategy: 'EXPLICIT_PRINTER_CLI' }),
        })
      },
    },
  })

  const result = await executor.execute(envelope, {
    printerId: 'windows:EPSON TM-T82X Receipt',
  })

  assert.deepEqual(calls, ['RENDER', 'SUBMIT'])
  assert.equal(result.schemaVersion, 1)
  assert.equal(result.adapter, 'LOCAL_SALE_RECEIPT_PDF')
  assert.equal(result.status, 'SUCCEEDED')
  assert.equal(result.durationMs, 5)
  assert.equal(result.evidence.meaning, 'PRINT_SUBMISSION_ACCEPTED')
  assert.equal(result.evidence.physicalOutputConfirmed, false)
  assert.equal(result.evidence.submissionAccepted, true)
  assert.equal(result.evidence.printerId, 'windows:EPSON TM-T82X Receipt')
  assert.equal(result.evidence.artifact.checksumSha256, checksum)
  assert.equal(result.evidence.transport.code, 'SUMATRA_PDF')
})

test('fails closed before submission when renderer artifact contract is invalid', async () => {
  let submitted = false
  const executor = createDurableSaleReceiptLocalExecutor({
    renderer: {
      async render() {
        return { schemaVersion: 1, format: 'PDF', checksumSha256: 'bad', byteLength: 1 }
      },
    },
    submitter: {
      async submit() {
        submitted = true
        return {}
      },
    },
  })

  await assert.rejects(
    executor.execute(envelope, { printerId: 'windows:EPSON TM-T82X Receipt' }),
    (error) => error.code === 'DURABLE_SALE_RECEIPT_RENDER_ARTIFACT_INVALID',
  )
  assert.equal(submitted, false)
})

test('rejects non-sale receipt envelopes and mismatched printer/checksum submission evidence', async () => {
  const executor = createDurableSaleReceiptLocalExecutor({
    renderer: {
      async render() {
        return { schemaVersion: 1, format: 'PDF', checksumSha256: checksum, byteLength: 100 }
      },
    },
    submitter: {
      async submit() {
        return {
          schemaVersion: 1,
          submitted: true,
          printerId: 'windows:OTHER',
          artifactChecksumSha256: checksum,
        }
      },
    },
  })

  await assert.rejects(
    executor.execute({ ...envelope, documentPurpose: { code: 'DELIVERY_NOTE' } }, { printerId: 'windows:EPSON TM-T82X Receipt' }),
    (error) => error.code === 'DURABLE_SALE_RECEIPT_EXECUTION_ENVELOPE_INVALID',
  )

  await assert.rejects(
    executor.execute(envelope, { printerId: 'windows:EPSON TM-T82X Receipt' }),
    (error) => error.code === 'DURABLE_SALE_RECEIPT_SUBMISSION_INVALID',
  )
})
