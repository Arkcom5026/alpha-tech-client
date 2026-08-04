import test from 'node:test'
import assert from 'node:assert/strict'
import { createStoreDeviceAuditProjection } from '../src/features/store-device/management/createStoreDeviceAuditProjection.js'

test('projects only current-store device events', () => {
  const projection = createStoreDeviceAuditProjection({
    branchId: 2,
    events: [
      { branchId: 2, gatewayId: 'gw-2', type: 'HEARTBEAT', severity: 'INFO' },
      { branchId: 3, gatewayId: 'gw-3', type: 'GATEWAY_OFFLINE', severity: 'ERROR' },
    ],
  })
  assert.equal(projection.totalEvents, 1)
  assert.equal(projection.events[0].gatewayId, 'gw-2')
})

test('removes credential and proof material from diagnostics', () => {
  const projection = createStoreDeviceAuditProjection({
    branchId: 2,
    events: [{
      branchId: 2,
      gatewayId: 'gw-2',
      type: 'AUTHENTICATED',
      proofKey: 'forbidden',
      nested: { accessToken: 'forbidden', safe: true },
    }],
  })
  assert.equal('proofKey' in projection.events[0], false)
  assert.deepEqual(projection.events[0].nested, { safe: true })
})

test('summarizes error offline and latest gateway evidence', () => {
  const projection = createStoreDeviceAuditProjection({
    branchId: 2,
    events: [
      { branchId: 2, gatewayId: 'gw-1', type: 'HEARTBEAT', severity: 'INFO', sequence: 1 },
      { branchId: 2, gatewayId: 'gw-1', type: 'GATEWAY_OFFLINE', severity: 'ERROR', sequence: 2 },
    ],
  })
  assert.equal(projection.errorEvents, 1)
  assert.equal(projection.offlineEvents, 1)
  assert.equal(projection.gateways[0].latestEvent.sequence, 2)
})
