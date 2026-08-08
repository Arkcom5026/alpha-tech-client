import assert from 'node:assert/strict'
import {
  DOCUMENT_PURPOSES,
  SYSTEM_DOCUMENT_PURPOSE_CODES,
  SYSTEM_DOCUMENT_PURPOSES,
  createHierarchicalPrinterResolverService,
  createPrinterPreferenceContract,
} from '../src/features/printing/preferences/index.js'
import { createPrinterSettingsRows } from '../src/features/printing/settings/printerSettingsViewModel.js'

const expectedSystemPurposes = [
  ['SALE_RECEIPT', 'ใบเสร็จรับเงิน'],
  ['DELIVERY_NOTE', 'ใบส่งสินค้า'],
  ['SHORT_TAX_INVOICE', 'ใบกำกับภาษีอย่างย่อ'],
  ['FULL_TAX_INVOICE', 'ใบกำกับภาษีเต็มรูป'],
]

assert.deepEqual(
  SYSTEM_DOCUMENT_PURPOSES.map(({ code, displayName }) => [code, displayName]),
  expectedSystemPurposes,
)
assert.deepEqual(SYSTEM_DOCUMENT_PURPOSE_CODES, expectedSystemPurposes.map(([code]) => code))
assert.deepEqual(
  createPrinterSettingsRows().map(({ documentPurpose, label }) => [documentPurpose, label]),
  expectedSystemPurposes,
)

for (const code of SYSTEM_DOCUMENT_PURPOSE_CODES) {
  assert.ok(DOCUMENT_PURPOSES.includes(code), `canonical purpose must be supported: ${code}`)
}
for (const legacyCode of ['RECEIPT', 'REPAIR_INTAKE', 'REPAIR_RETURN', 'BARCODE_LABEL', 'A4_DOCUMENT']) {
  assert.ok(DOCUMENT_PURPOSES.includes(legacyCode), `legacy purpose must remain readable: ${legacyCode}`)
}

const legacyReceiptPreference = createPrinterPreferenceContract({
  branchId: 'branch-1',
  workstationId: 'workstation-1',
  documentPurpose: 'RECEIPT',
  printerProfileId: 'windows:receipt-1',
  printerName: 'Receipt Printer',
  connection: 'WINDOWS_QUEUE',
  queueAuthority: 'LOCAL_QUEUE',
  updatedAt: '2026-08-08T04:00:00.000Z',
})

const resolver = createHierarchicalPrinterResolverService({
  transport: {
    listPrinters: async () => ({
      printers: [{
        id: 'windows:receipt-1',
        name: 'Receipt Printer',
        connection: 'WINDOWS_QUEUE',
        isOnline: true,
      }],
    }),
  },
  legacyPreferenceStore: {
    get: ({ documentPurpose }) => documentPurpose === 'RECEIPT' ? legacyReceiptPreference : null,
  },
  hierarchyStore: { get: () => null },
})

const canonicalResolution = await resolver.resolve({
  branchId: 'branch-1',
  workstationId: 'workstation-1',
  documentPurpose: 'SALE_RECEIPT',
})

assert.deepEqual(canonicalResolution.purposeCandidates, ['SALE_RECEIPT', 'RECEIPT'])
assert.equal(canonicalResolution.resolution.status, 'READY')
assert.equal(canonicalResolution.resolution.authorityLevel, 'WORKSTATION')
assert.equal(canonicalResolution.resolution.binding.source, 'LEGACY_WORKSTATION')
assert.equal(canonicalResolution.resolution.binding.metadata.storedDocumentPurpose, 'RECEIPT')
assert.equal(canonicalResolution.resolution.printer.id, 'windows:receipt-1')

console.log('document-printer-purpose-alignment.contract.test.js: PASS')
