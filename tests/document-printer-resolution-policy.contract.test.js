import assert from 'node:assert/strict'
import { RESOLUTION_LEVELS, resolveDocumentPrinter } from '../src/features/printing/preferences/documentPrinterResolutionPolicy.js'

const printers = [
  { id: 'printer:user', name: 'User Printer', isOnline: true },
  { id: 'printer:workstation', name: 'Workstation Printer', isOnline: true },
  { id: 'printer:branch', name: 'Branch Printer', isOnline: true },
  { id: 'printer:document', name: 'Document Default', isOnline: true },
  { id: 'printer:platform', name: 'Platform Default', isOnline: true },
  { id: 'printer:offline', name: 'Offline Printer', isOnline: false },
]

assert.deepEqual(RESOLUTION_LEVELS, [
  'USER',
  'WORKSTATION',
  'BRANCH',
  'DOCUMENT_DEFAULT',
  'PLATFORM_DEFAULT',
])

{
  const resolved = resolveDocumentPrinter({
    documentPurpose: 'RECEIPT',
    printers,
    bindings: {
      USER: { printerProfileId: 'printer:user' },
      WORKSTATION: { printerProfileId: 'printer:workstation' },
      BRANCH: { printerProfileId: 'printer:branch' },
      DOCUMENT_DEFAULT: { printerProfileId: 'printer:document' },
      PLATFORM_DEFAULT: { printerProfileId: 'printer:platform' },
    },
  })

  assert.equal(resolved.status, 'READY')
  assert.equal(resolved.authorityLevel, 'USER')
  assert.equal(resolved.printer.id, 'printer:user')
}

{
  const resolved = resolveDocumentPrinter({
    documentPurpose: 'DELIVERY_NOTE',
    printers,
    bindings: {
      WORKSTATION: { printerProfileId: 'printer:workstation' },
      BRANCH: { printerProfileId: 'printer:branch' },
      DOCUMENT_DEFAULT: { printerProfileId: 'printer:document' },
    },
  })

  assert.equal(resolved.status, 'READY')
  assert.equal(resolved.authorityLevel, 'WORKSTATION')
  assert.equal(resolved.printer.id, 'printer:workstation')
}

{
  const resolved = resolveDocumentPrinter({
    documentPurpose: 'BARCODE_LABEL',
    printers,
    bindings: {
      WORKSTATION: { printerProfileId: 'printer:missing' },
      BRANCH: { printerProfileId: 'printer:branch' },
    },
  })

  assert.equal(resolved.status, 'UNAVAILABLE')
  assert.equal(resolved.authorityLevel, 'WORKSTATION')
  assert.equal(resolved.reason, 'CONFIGURED_PRINTER_NOT_DISCOVERED')
  assert.equal(resolved.fallbackBlocked, true)
  assert.equal(resolved.printer, null)
}

{
  const resolved = resolveDocumentPrinter({
    documentPurpose: 'SHORT_TAX_INVOICE',
    printers,
    bindings: {
      USER: { printerProfileId: 'printer:offline' },
      WORKSTATION: { printerProfileId: 'printer:workstation' },
    },
  })

  assert.equal(resolved.status, 'UNAVAILABLE')
  assert.equal(resolved.authorityLevel, 'USER')
  assert.equal(resolved.reason, 'CONFIGURED_PRINTER_OFFLINE')
  assert.equal(resolved.fallbackBlocked, true)
  assert.equal(resolved.printer.id, 'printer:offline')
}

{
  const resolved = resolveDocumentPrinter({
    documentPurpose: 'A4_DOCUMENT',
    printers,
    bindings: {
      DOCUMENT_DEFAULT: { printerProfileId: 'printer:document' },
      PLATFORM_DEFAULT: { printerProfileId: 'printer:platform' },
    },
  })

  assert.equal(resolved.status, 'READY')
  assert.equal(resolved.authorityLevel, 'DOCUMENT_DEFAULT')
  assert.equal(resolved.printer.id, 'printer:document')
}

{
  const resolved = resolveDocumentPrinter({
    documentPurpose: 'REPAIR_RETURN',
    printers,
    bindings: {},
  })

  assert.equal(resolved.status, 'NOT_CONFIGURED')
  assert.equal(resolved.authorityLevel, null)
  assert.equal(resolved.reason, 'NO_PRINTER_BINDING_CONFIGURED')
  assert.equal(resolved.fallbackBlocked, false)
}

console.log('document-printer-resolution-policy.contract.test.js: PASS')
