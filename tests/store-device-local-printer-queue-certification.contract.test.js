import test from 'node:test'
import assert from 'node:assert/strict'
import { certifyLocalPrinterQueue } from '../tools/local-print-bridge/src/pilot/certifyLocalPrinterQueue.js'

const localPrinter = Object.freeze({
  id: 'windows:EPSON TM-T82X Receipt',
  name: 'EPSON TM-T82X Receipt',
  driverName: 'EPSON TM-T(203dpi) Receipt6',
  portName: 'TMUSB001',
  connection: 'WINDOWS_QUEUE',
  queueAuthority: 'LOCAL_QUEUE',
  isLocalQueue: true,
  isSharedConnection: false,
  capabilities: { raw: true, cut: true, cashDrawer: true },
  isOnline: true,
  workOffline: false,
})

test('certifies one exact local RAW printer queue without printing', () => {
  const result = certifyLocalPrinterQueue({
    printer: localPrinter,
    expectedPrinterId: localPrinter.id,
    expectedDeviceId: 'printer-front',
    expectedGatewayId: 'gw-store-2',
  })

  assert.equal(result.certified, true)
  assert.equal(result.queueAuthority, 'LOCAL_QUEUE')
  assert.equal(result.raw, true)
  assert.equal(result.portName, 'TMUSB001')
})

test('rejects shared UNC and non-RAW printer authorities', () => {
  assert.throws(() => certifyLocalPrinterQueue({
    printer: { ...localPrinter, name: '\\\\advice01\\EPSON TM-T82X Receipt', queueAuthority: 'SHARED_CONNECTION', isLocalQueue: false, isSharedConnection: true, capabilities: { raw: false } },
    expectedPrinterId: localPrinter.id,
    expectedDeviceId: 'printer-front',
    expectedGatewayId: 'gw-store-2',
  }), { code: 'STORE_DEVICE_QUEUE_IDENTITY_MISMATCH' })

  assert.throws(() => certifyLocalPrinterQueue({
    printer: { ...localPrinter, capabilities: { raw: false } },
    expectedPrinterId: localPrinter.id,
    expectedDeviceId: 'printer-front',
    expectedGatewayId: 'gw-store-2',
  }), { code: 'STORE_DEVICE_RAW_CAPABILITY_REQUIRED' })
})

test('rejects offline queues and identity mismatch', () => {
  assert.throws(() => certifyLocalPrinterQueue({
    printer: { ...localPrinter, isOnline: false, workOffline: true },
    expectedPrinterId: localPrinter.id,
    expectedDeviceId: 'printer-front',
    expectedGatewayId: 'gw-store-2',
  }), { code: 'STORE_DEVICE_QUEUE_OFFLINE' })

  assert.throws(() => certifyLocalPrinterQueue({
    printer: localPrinter,
    expectedPrinterId: 'windows:other',
    expectedDeviceId: 'printer-front',
    expectedGatewayId: 'gw-store-2',
  }), { code: 'STORE_DEVICE_QUEUE_IDENTITY_MISMATCH' })
})
