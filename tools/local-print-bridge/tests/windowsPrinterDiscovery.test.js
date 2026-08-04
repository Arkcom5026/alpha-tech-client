import assert from 'node:assert/strict'
import test from 'node:test'
import { normalizePrinter } from '../src/windowsPrinterDiscovery.js'

test('normalizes local EPSON receipt queue as RAW eligible', () => {
  const printer = normalizePrinter({
    Name: 'EPSON TM-T82X Receipt',
    DriverName: 'EPSON TM-T(203dpi) Receipt6',
    PortName: 'TMUSB001',
    Default: true,
    WorkOffline: false,
    Local: true,
    Network: false,
  })

  assert.equal(printer.id, 'windows:EPSON TM-T82X Receipt')
  assert.equal(printer.connection, 'WINDOWS_QUEUE')
  assert.equal(printer.queueAuthority, 'LOCAL_QUEUE')
  assert.equal(printer.isLocalQueue, true)
  assert.equal(printer.paperWidthMm, 80)
  assert.equal(printer.capabilities.raw, true)
  assert.equal(printer.capabilities.cut, true)
  assert.equal(printer.isOnline, true)
})

test('normalizes UNC shared connection as non-local RAW authority', () => {
  const printer = normalizePrinter({
    Name: '\\\\advice01\\EPSON TM-T82X Receipt',
    DriverName: 'EPSON TM-T(203dpi) Receipt6',
    PortName: 'TMUSB001',
    Default: false,
    WorkOffline: false,
    Local: false,
    Network: true,
    ServerName: '\\\\advice01',
    ShareName: 'EPSON TM-T82X Receipt',
  })

  assert.equal(printer.queueAuthority, 'SHARED_CONNECTION')
  assert.equal(printer.isSharedConnection, true)
  assert.equal(printer.capabilities.raw, false)
  assert.equal(printer.capabilities.cut, false)
})
