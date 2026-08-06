import assert from 'node:assert/strict'
import test from 'node:test'
import {
  createPrinterSettingsRows,
  describePrinter,
} from '../src/features/printing/settings/printerSettingsViewModel.js'

const printers = [
  {
    id: 'windows:shared-receipt',
    name: 'Shared Receipt Printer',
    connection: 'WINDOWS_QUEUE',
    queueAuthority: 'SHARED_CONNECTION',
    isOnline: true,
    paperWidthMm: 80,
    capabilities: { driverManaged: true, raw: false },
  },
  {
    id: 'windows:offline-a4',
    name: 'Offline A4 Printer',
    connection: 'WINDOWS_QUEUE',
    queueAuthority: 'LOCAL_QUEUE',
    isOnline: false,
    capabilities: { driverManaged: false, raw: false },
  },
]

test('builds one settings row for every supported document purpose', () => {
  const rows = createPrinterSettingsRows({ preferences: [], printers })

  assert.equal(rows.length, 7)
  assert.equal(rows[0].documentPurpose, 'RECEIPT')
  assert.equal(rows[0].label, 'ใบเสร็จ')
  assert.equal(rows[0].status, 'NOT_CONFIGURED')
})

test('marks a discovered online saved printer as ready', () => {
  const rows = createPrinterSettingsRows({
    printers,
    preferences: [{
      documentPurpose: 'RECEIPT',
      printerProfileId: 'windows:shared-receipt',
      printerName: 'Shared Receipt Printer',
    }],
  })

  const receipt = rows.find((row) => row.documentPurpose === 'RECEIPT')
  assert.equal(receipt.status, 'READY')
  assert.equal(receipt.printer.id, 'windows:shared-receipt')
  assert.deepEqual(receipt.badges, ['Shared Queue', 'Driver Managed', '80 มม.'])
})

test('marks a missing or offline saved printer as unavailable', () => {
  const rows = createPrinterSettingsRows({
    printers,
    preferences: [
      {
        documentPurpose: 'A4_DOCUMENT',
        printerProfileId: 'windows:offline-a4',
        printerName: 'Offline A4 Printer',
      },
      {
        documentPurpose: 'BARCODE_LABEL',
        printerProfileId: 'windows:missing',
        printerName: 'Missing Printer',
      },
    ],
  })

  assert.equal(rows.find((row) => row.documentPurpose === 'A4_DOCUMENT').status, 'UNAVAILABLE')
  assert.equal(rows.find((row) => row.documentPurpose === 'BARCODE_LABEL').status, 'UNAVAILABLE')
})

test('describes queue capabilities without relying on printer brands', () => {
  assert.deepEqual(describePrinter(printers[0]), [
    'Shared Queue',
    'Driver Managed',
    '80 มม.',
  ])

  assert.deepEqual(describePrinter(printers[1]), [
    'Local Queue',
    'Offline',
  ])
})
