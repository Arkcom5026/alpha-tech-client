import assert from 'node:assert/strict'
import test from 'node:test'
import { validatePrintJob } from '../src/printJobValidator.js'

const validJob = {
  jobId: 'job-1',
  branchId: '2',
  workstationId: 'counter-01',
  printerProfileId: 'mock-epson-tm-t82x',
  documentType: 'SHORT_TAX_INVOICE',
  snapshot: {
    documentId: '875',
    documentNumber: 'SL-022608-0001',
    total: 250,
  },
  options: { cut: 'PARTIAL' },
}

test('accepts and clones a valid print job', () => {
  const normalized = validatePrintJob(validJob)

  assert.equal(normalized.branchId, '2')
  assert.equal(normalized.documentType, 'SHORT_TAX_INVOICE')
  assert.notEqual(normalized.snapshot, validJob.snapshot)
  assert.equal(normalized.snapshot.total, 250)
})

test('rejects missing tenant and workstation scope', () => {
  assert.throws(
    () => validatePrintJob({ ...validJob, branchId: '' }),
    /branchId is required/
  )

  assert.throws(
    () => validatePrintJob({ ...validJob, workstationId: null }),
    /workstationId is required/
  )
})

test('rejects unsupported document type', () => {
  assert.throws(
    () => validatePrintJob({ ...validJob, documentType: 'UNKNOWN' }),
    /Unsupported documentType/
  )
})
