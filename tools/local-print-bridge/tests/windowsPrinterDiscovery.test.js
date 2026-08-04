import assert from 'node:assert/strict'
import test from 'node:test'
import { normalizePrinter } from '../src/windowsPrinterDiscovery.js'

test('normalizes EPSON receipt queue capabilities', () => {
  const printer = normalizePrinter({
    Name: 'EPSON TM-T82X Receipt',
    DriverName: 'EPSON TM-T82X Receipt5',
    PortName: 'USB001',
    Default: true,
    WorkOffline: false,
  })

  assert.equal(printer.id, 'windows:EPSON TM-T82X Receipt')
  assert.equal(printer.connection, 'WINDOWS_QUEUE')
  assert.equal(printer.paperWidthMm, 80)
  assert.equal(printer.capabilities.raw, true)
  assert.equal(printer.capabilities.cut, true)
  assert.equal(printer.isOnline, true)
})
