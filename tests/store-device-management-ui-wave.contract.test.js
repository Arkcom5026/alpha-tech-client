import test from 'node:test'
import assert from 'node:assert/strict'
import { createStoreDeviceManagementProjection } from '../src/features/store-device/management/createStoreDeviceManagementProjection.js'

const devices = [
  { id: 'printer-1', branchId: 2, gatewayId: 'gw-1', name: 'Receipt', kind: 'PRINTER', connectionState: 'ONLINE', authenticated: true },
  { id: 'printer-2', branchId: 3, gatewayId: 'gw-2', name: 'Other Store', kind: 'PRINTER', connectionState: 'ONLINE' },
]
const gateways = [
  { id: 'gw-1', branchId: 2, name: 'POS Gateway', state: 'CONNECTED', authenticated: true },
  { id: 'gw-2', branchId: 3, name: 'Other Gateway', state: 'CONNECTED' },
]

test('projects only authenticated branch devices and gateways', () => {
  const projection = createStoreDeviceManagementProjection({ branchId: 2, devices, gateways })
  assert.equal(projection.devices.length, 1)
  assert.equal(projection.gateways.length, 1)
  assert.equal(projection.summary.onlineDeviceCount, 1)
  assert.equal(projection.findDevice('printer-2'), null)
})

test('does not expose credential material in projection', () => {
  const projection = createStoreDeviceManagementProjection({ branchId: 2, devices: [{ ...devices[0], proofKey: 'secret', token: 'token' }], gateways })
  assert.equal('proofKey' in projection.devices[0], false)
  assert.equal('token' in projection.devices[0], false)
})

test('requires explicit confirmation for revoke intent', () => {
  const projection = createStoreDeviceManagementProjection({ branchId: 2, devices, gateways })
  assert.throws(() => projection.createIntent({ action: 'REVOKE', deviceId: 'printer-1' }), { code: 'STORE_DEVICE_CONFIRMATION_REQUIRED' })
  assert.equal(projection.createIntent({ action: 'REVOKE', deviceId: 'printer-1', confirmation: true }).requiresServerRevalidation, true)
})
