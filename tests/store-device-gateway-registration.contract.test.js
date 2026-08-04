import assert from 'node:assert/strict'
import test from 'node:test'
import {
  createStoreDeviceGatewayContract,
  createStoreDeviceGatewayRegistry,
  heartbeatGateway,
  rotateGatewayCredential,
  revokeGateway,
} from '../src/features/store-device/gateway/index.js'

test('creates immutable branch-owned gateway contract', () => {
  const gateway = createStoreDeviceGatewayContract({
    gatewayId: 'gateway-advice01',
    branchId: 2,
    name: 'จุดเชื่อมต่ออุปกรณ์หน้าร้าน',
    enrollmentState: 'ENROLLED',
    capabilities: { transports: ['WINDOWS_RAW', 'TCP_ESC_POS'] },
    platform: { os: 'windows', hostname: 'ADVICE01' },
  })

  assert.equal(gateway.branchId, 2)
  assert.equal(gateway.enrollmentState, 'ENROLLED')
  assert.ok(Object.isFrozen(gateway))
})

test('prevents gateway identity reassignment across branches', () => {
  const registry = createStoreDeviceGatewayRegistry()
  registry.register({ gatewayId: 'gateway-1', branchId: 2, name: 'Front Counter' })

  assert.throws(() => registry.register({
    gatewayId: 'gateway-1',
    branchId: 3,
    name: 'Other Store',
  }), /cannot be reassigned across branches/)

  assert.equal(registry.get({ gatewayId: 'gateway-1', branchId: 3 }), null)
})

test('supports heartbeat credential rotation and revocation lifecycle', () => {
  const enrolled = createStoreDeviceGatewayContract({
    gatewayId: 'gateway-2',
    branchId: 2,
    name: 'Stock Room Gateway',
    enrollmentState: 'ENROLLED',
  })
  const online = heartbeatGateway(enrolled, { at: '2026-08-04T12:00:00.000Z' })
  const rotated = rotateGatewayCredential(online)
  const revoked = revokeGateway(rotated, { at: '2026-08-04T13:00:00.000Z' })

  assert.equal(online.runtimeState, 'ONLINE')
  assert.equal(rotated.credentialVersion, 2)
  assert.equal(revoked.enrollmentState, 'REVOKED')
  assert.equal(revoked.runtimeState, 'OFFLINE')
  assert.throws(() => rotateGatewayCredential(revoked), /may not rotate credentials/)
})
