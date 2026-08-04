import test from 'node:test'
import assert from 'node:assert/strict'
import { createStoreDevicePrintPipeline } from '../src/features/store-device/print/createStoreDevicePrintPipeline.js'

const resolveProfile = async () => ({
  id: 'receipt-80', revision: 3, roll: true, feedMm: 8,
  compatibleDocumentTypes: ['SHORT_TAX_INVOICE', 'RECEIPT'],
})

test('creates immutable snapshot and projects dynamic roll height', async () => {
  const document = { id: 875, number: 'SL-1', lines: [{ description: 'Mouse', quantity: 1 }] }
  const pipeline = createStoreDevicePrintPipeline({ resolveProfile, createJob: async (job) => job })
  const prepared = await pipeline.prepare({ branchId: 2, document, documentType: 'SHORT_TAX_INVOICE', profileId: 'receipt-80', contentHeightMm: 159.06 })
  document.lines[0].quantity = 99
  assert.equal(prepared.snapshot.lines[0].quantity, 1)
  assert.equal(prepared.projectedHeightMm, 168)
})

test('creates stable idempotent PRINT job request', async () => {
  const jobs = []
  const pipeline = createStoreDevicePrintPipeline({ resolveProfile, createJob: async (job) => { jobs.push(job); return job } })
  const input = { branchId: 2, document: { id: 875, total: 250 }, documentType: 'SHORT_TAX_INVOICE', profileId: 'receipt-80', contentHeightMm: 159 }
  const first = await pipeline.submit(await pipeline.prepare(input))
  const repeated = await pipeline.submit(await pipeline.prepare(input))
  assert.equal(first.type, 'PRINT')
  assert.equal(first.idempotencyKey, repeated.idempotencyKey)
  assert.equal(first.targetProfileId, 'receipt-80')
})

test('rejects incompatible document and preserves editable source', async () => {
  const document = { id: 1, status: 'DRAFT' }
  const pipeline = createStoreDevicePrintPipeline({ resolveProfile, createJob: async (job) => job })
  await assert.rejects(() => pipeline.prepare({ branchId: 2, document, documentType: 'A4_DELIVERY_NOTE', profileId: 'receipt-80' }), { code: 'STORE_DEVICE_PRINT_PROFILE_INCOMPATIBLE' })
  assert.equal(document.status, 'DRAFT')
})
