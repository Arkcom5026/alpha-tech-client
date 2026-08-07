import assert from 'node:assert/strict'
import crypto from 'node:crypto'
import { test } from 'node:test'
import {
  assertArtifactBytes,
  createSumatraPdfSaleReceiptSubmitter,
  inspectSumatraReadiness,
} from '../src/sumatraPdfSaleReceiptSubmitter.js'

const pdfBytes = Buffer.from('%PDF-1.4\nalpha-tech-sale-receipt\n%%EOF\n')
const checksumSha256 = crypto.createHash('sha256').update(pdfBytes).digest('hex')
const artifact = Object.freeze({
  schemaVersion: 1,
  format: 'PDF',
  byteLength: pdfBytes.length,
  checksumSha256,
  pdfBase64: pdfBytes.toString('base64'),
})

const envelope = Object.freeze({
  schemaVersion: 1,
  job: Object.freeze({ jobId: 'sdj_1', jobType: 'PRINT_DOCUMENT' }),
  documentPurpose: Object.freeze({ code: 'SALE_RECEIPT' }),
  source: Object.freeze({ type: 'SALE_PAYMENT', id: 638 }),
  print: Object.freeze({ copies: 2 }),
  projection: Object.freeze({ document: Object.freeze({ type: 'SALE_RECEIPT' }) }),
})

test('discovers only certified Sumatra explicit-printer transport on Windows', () => {
  const readiness = inspectSumatraReadiness({
    platform: 'win32',
    env: { SUMATRA_PDF_PATH: 'C:\\Tools\\SumatraPDF.exe' },
    fileExists: (value) => value.endsWith('SumatraPDF.exe'),
  })
  assert.equal(readiness.ready, true)
  assert.equal(readiness.selectedTransport.code, 'SUMATRA_PDF')
  assert.equal(readiness.selectedTransport.strategy, 'EXPLICIT_PRINTER_CLI')

  const blocked = inspectSumatraReadiness({
    platform: 'linux',
    env: { SUMATRA_PDF_PATH: '/tmp/SumatraPDF.exe' },
    fileExists: () => true,
  })
  assert.equal(blocked.ready, false)
  assert.deepEqual(blocked.reasons, ['WINDOWS_PLATFORM_REQUIRED'])
})

test('stages verified artifact and submits to exact printer with shell disabled', async () => {
  const calls = []
  const submitter = createSumatraPdfSaleReceiptSubmitter({
    enabled: true,
    allowedPrinterId: 'windows:epson-tm-t82x',
    resolvePrinter: async () => ({
      id: 'windows:epson-tm-t82x',
      name: 'EPSON TM-T82X Receipt',
      connection: 'WINDOWS_QUEUE',
      isOnline: true,
      workOffline: false,
    }),
    readiness: () => ({
      ready: true,
      reasons: [],
      selectedTransport: {
        code: 'SUMATRA_PDF',
        strategy: 'EXPLICIT_PRINTER_CLI',
        executablePath: 'C:\\Tools\\SumatraPDF.exe',
      },
    }),
    execFileImpl: async (executablePath, args, options) => {
      calls.push({ executablePath, args, options })
      assert.equal(executablePath, 'C:\\Tools\\SumatraPDF.exe')
      assert.deepEqual(args.slice(0, 5), [
        '-silent',
        '-print-to',
        'EPSON TM-T82X Receipt',
        '-print-settings',
        '2x',
      ])
      assert.match(args.at(-1), /[a-f0-9]{64}\.pdf$/i)
      assert.equal(options.shell, false)
      return { stdout: 'submitted', stderr: '' }
    },
  })

  const submission = await submitter.submit({
    executionEnvelope: envelope,
    printerId: 'windows:epson-tm-t82x',
    artifact,
  })

  assert.equal(calls.length, 1)
  assert.equal(submission.submitted, true)
  assert.equal(submission.printerId, 'windows:epson-tm-t82x')
  assert.equal(submission.artifactChecksumSha256, checksumSha256)
  assert.equal(submission.transport.code, 'SUMATRA_PDF')
  assert.equal(submission.transport.meaning, 'PRINT_SUBMISSION_ACCEPTED')
  assert.equal(submission.transport.physicalOutputConfirmed, false)
})

test('fails closed before process execution when gate, printer, or checksum authority is invalid', async () => {
  let processCalls = 0
  const common = {
    allowedPrinterId: 'windows:epson-tm-t82x',
    resolvePrinter: async () => ({
      id: 'windows:epson-tm-t82x',
      name: 'EPSON TM-T82X Receipt',
      connection: 'WINDOWS_QUEUE',
      isOnline: true,
      workOffline: false,
    }),
    readiness: () => ({
      ready: true,
      reasons: [],
      selectedTransport: {
        code: 'SUMATRA_PDF',
        strategy: 'EXPLICIT_PRINTER_CLI',
        executablePath: 'C:\\Tools\\SumatraPDF.exe',
      },
    }),
    execFileImpl: async () => {
      processCalls += 1
      return { stdout: '', stderr: '' }
    },
  }

  const disabled = createSumatraPdfSaleReceiptSubmitter({ ...common, enabled: false })
  await assert.rejects(
    disabled.submit({ executionEnvelope: envelope, printerId: 'windows:epson-tm-t82x', artifact }),
    (error) => error?.code === 'DURABLE_SALE_RECEIPT_PHYSICAL_SUBMISSION_DISABLED',
  )

  const enabled = createSumatraPdfSaleReceiptSubmitter({ ...common, enabled: true })
  await assert.rejects(
    enabled.submit({ executionEnvelope: envelope, printerId: 'windows:other', artifact }),
    (error) => error?.code === 'DURABLE_SALE_RECEIPT_PRINTER_NOT_AUTHORIZED',
  )

  const corrupt = { ...artifact, checksumSha256: '0'.repeat(64) }
  await assert.rejects(
    enabled.submit({ executionEnvelope: envelope, printerId: 'windows:epson-tm-t82x', artifact: corrupt }),
    (error) => error?.code === 'DURABLE_SALE_RECEIPT_SUMATRA_CHECKSUM_MISMATCH',
  )

  assert.throws(
    () => assertArtifactBytes({ ...artifact, pdfBase64: Buffer.from('not-pdf').toString('base64') }),
    (error) => error?.code === 'DURABLE_SALE_RECEIPT_SUMATRA_ARTIFACT_INVALID',
  )
  assert.equal(processCalls, 0)
})
