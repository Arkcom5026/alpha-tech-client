import assert from 'node:assert/strict'
import test from 'node:test'
import {
  createPrinterPreferenceContract,
  createPrinterPreferenceKey,
  createPrinterPreferenceStore,
} from '../src/features/printing/preferences/index.js'

const createMemoryStorage = () => {
  const values = new Map()

  return {
    getItem: (key) => values.has(key) ? values.get(key) : null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key),
  }
}

const receiptPreference = {
  branchId: '2',
  workstationId: 'counter-01',
  documentPurpose: 'RECEIPT',
  printerProfileId: 'windows:any-store-printer',
  printerName: 'Any Store Receipt Printer',
  connection: 'WINDOWS_QUEUE',
  queueAuthority: 'SHARED_CONNECTION',
  updatedAt: '2026-08-06T16:00:00.000Z',
}

test('creates an immutable branch and workstation scoped preference', () => {
  const preference = createPrinterPreferenceContract(receiptPreference)

  assert.equal(preference.branchId, '2')
  assert.equal(preference.workstationId, 'counter-01')
  assert.equal(preference.documentPurpose, 'RECEIPT')
  assert.equal(preference.printerProfileId, 'windows:any-store-printer')
  assert.equal(Object.isFrozen(preference), true)
})

test('creates distinct keys across branch workstation and purpose scopes', () => {
  const receiptKey = createPrinterPreferenceKey(receiptPreference)
  const barcodeKey = createPrinterPreferenceKey({
    ...receiptPreference,
    documentPurpose: 'BARCODE_LABEL',
  })
  const otherWorkstationKey = createPrinterPreferenceKey({
    ...receiptPreference,
    workstationId: 'counter-02',
  })

  assert.notEqual(receiptKey, barcodeKey)
  assert.notEqual(receiptKey, otherWorkstationKey)
})

test('saves resolves lists and removes workstation preferences', () => {
  const store = createPrinterPreferenceStore({ storage: createMemoryStorage() })

  store.save(receiptPreference)
  store.save({
    ...receiptPreference,
    documentPurpose: 'BARCODE_LABEL',
    printerProfileId: 'windows:barcode-printer',
    printerName: 'Barcode Printer',
  })

  const resolved = store.get(receiptPreference)
  assert.equal(resolved.printerProfileId, receiptPreference.printerProfileId)

  const list = store.listForWorkstation({ branchId: '2', workstationId: 'counter-01' })
  assert.deepEqual(list.map((item) => item.documentPurpose), ['BARCODE_LABEL', 'RECEIPT'])

  assert.equal(store.remove(receiptPreference), true)
  assert.equal(store.get(receiptPreference), null)
  assert.equal(store.remove(receiptPreference), false)
})

test('keeps printer choice isolated between branches', () => {
  const store = createPrinterPreferenceStore({ storage: createMemoryStorage() })

  store.save(receiptPreference)
  store.save({
    ...receiptPreference,
    branchId: '3',
    printerProfileId: 'windows:branch-3-printer',
    printerName: 'Branch 3 Printer',
  })

  assert.equal(store.get(receiptPreference).printerProfileId, 'windows:any-store-printer')
  assert.equal(store.get({ ...receiptPreference, branchId: '3' }).printerProfileId, 'windows:branch-3-printer')
})

test('rejects unsupported document purposes and missing storage authority', () => {
  assert.throws(
    () => createPrinterPreferenceContract({ ...receiptPreference, documentPurpose: 'UNKNOWN' }),
    /Unsupported documentPurpose/
  )

  assert.throws(
    () => createPrinterPreferenceStore(),
    /storage adapter is required/
  )
})
