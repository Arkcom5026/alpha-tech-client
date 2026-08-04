import assert from 'node:assert/strict'
import test from 'node:test'
import { createDeviceJobContract } from '../src/features/store-device/authority/createDeviceJobContract.js'
import { createDeviceAdapterRegistry } from '../src/features/store-device/authority/deviceAdapterRegistry.js'

test('creates immutable branch-scoped idempotent device job', () => {
  const job = createDeviceJobContract({
    jobId: 'device-job-001',
    branchId: 2,
    originDeviceId: 'mobile-user-session',
    targetProfileId: 'front-counter-receipt',
    jobType: 'PRINT_DOCUMENT',
    payload: { documentId: 875, revision: 1 },
  })

  assert.equal(job.branchId, 2)
  assert.equal(job.idempotencyKey, 'device-job-001')
  assert.equal(job.state, 'CREATED')
  assert.equal(Object.isFrozen(job), true)
  assert.equal(Object.isFrozen(job.payload), true)
})

test('rejects device jobs without tenant scope', () => {
  assert.throws(() => createDeviceJobContract({
    jobId: 'device-job-002',
    originDeviceId: 'phone',
    targetProfileId: 'receipt',
    jobType: 'PRINT_DOCUMENT',
  }), /branchId/)
})

test('registers transport-neutral adapter and discovers devices', async () => {
  const registry = createDeviceAdapterRegistry()
  registry.register({
    transport: 'TCP_ESC_POS',
    async discover() { return [{ id: 'wifi-printer-01' }] },
    async health() { return { state: 'ONLINE' } },
    async execute() { return { state: 'SUCCEEDED' } },
  })

  const discovered = await registry.discoverAll({ branchId: 2 })
  assert.equal(discovered[0].transport, 'TCP_ESC_POS')
  assert.equal(discovered[0].devices[0].id, 'wifi-printer-01')
})
