import assert from 'node:assert/strict'
import test from 'node:test'
import { resolveDocumentPrintTarget } from '../src/features/printing/authority/resolveDocumentPrintTarget.js'

const printers = [
  { id: 'windows:receipt-slip', isOnline: true },
  { id: 'windows:full-tax-a4', isOnline: true },
]

test('resolves short tax invoice to configured receipt printer', () => {
  const result = resolveDocumentPrintTarget({
    documentPurpose: 'SHORT_TAX_INVOICE',
    bindings: { WORKSTATION: { printerProfileId: 'windows:receipt-slip' } },
    printers,
  })

  assert.equal(result.printerProfileId, 'windows:receipt-slip')
  assert.equal(result.resolution.status, 'READY')
})

test('resolves full tax invoice to configured full invoice printer', () => {
  const result = resolveDocumentPrintTarget({
    documentPurpose: 'FULL_TAX_INVOICE',
    bindings: { WORKSTATION: { printerProfileId: 'windows:full-tax-a4' } },
    printers,
  })

  assert.equal(result.printerProfileId, 'windows:full-tax-a4')
  assert.equal(result.resolution.status, 'READY')
})

test('fails closed when configured printer is unavailable', () => {
  assert.throws(() => resolveDocumentPrintTarget({
    documentPurpose: 'FULL_TAX_INVOICE',
    bindings: { WORKSTATION: { printerProfileId: 'windows:missing' } },
    printers,
  }), { code: 'PRINT_TARGET_UNAVAILABLE' })
})
