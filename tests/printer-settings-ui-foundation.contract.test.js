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

test('builds one settings row for every canonical system document purpose', () => {
  const rows = createPrinterSettingsRows({ preferences: [], printers })

  assert.equal(rows.length, 4)
  assert.deepEqual(
    rows.map((row) => row.documentPurpose),
    ['SALE_RECEIPT', 'DELIVERY_NOTE', 'SHORT_TAX_INVOICE', 'FULL_TAX_INVOICE'],
  )
  assert.equal(rows[0].label, 'ใบเสร็จรับเงิน')
  assert.equal(rows[2].label, 'ใบกำกับภาษีอย่างย่อ')
  assert.equal(rows[3].label, 'ใบกำกับภาษีเต็มรูป')
  assert.equal(rows[0].status, 'NOT_CONFIGURED')
})

test('marks a discovered online saved printer as ready', () => {
  const rows = createPrinterSettingsRows({
    printers,
    preferences: [{
      documentPurpose: 'SALE_RECEIPT',
      printerProfileId: 'windows:shared-receipt',
      printerName: 'Shared Receipt Printer',
    }],
  })

  const receipt = rows.find((row) => row.documentPurpose === 'SALE_RECEIPT')
  assert.equal(receipt.status, 'READY')
  assert.equal(receipt.printer.id, 'windows:shared-receipt')
  assert.deepEqual(receipt.badges, ['Shared Queue', 'Driver Managed', '80 มม.'])
})

test('marks a missing or offline canonical document printer as unavailable', () => {
  const rows = createPrinterSettingsRows({
    printers,
    preferences: [
      {
        documentPurpose: 'FULL_TAX_INVOICE',
        printerProfileId: 'windows:offline-a4',
        printerName: 'Offline A4 Printer',
      },
      {
        documentPurpose: 'SHORT_TAX_INVOICE',
        printerProfileId: 'windows:missing',
        printerName: 'Missing Printer',
      },
    ],
  })

  assert.equal(rows.find((row) => row.documentPurpose === 'FULL_TAX_INVOICE').status, 'UNAVAILABLE')
  assert.equal(rows.find((row) => row.documentPurpose === 'SHORT_TAX_INVOICE').status, 'UNAVAILABLE')
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
