import test from 'node:test'
import assert from 'node:assert/strict'
import { createStoreDeviceAdapterRegistry } from '../src/features/store-device/adapters/createStoreDeviceAdapterRegistry.js'

test('registers discovers and executes a branch-owned adapter', async () => {
  const registry = createStoreDeviceAdapterRegistry()
  registry.register({
    id: 'escpos-01', kind: 'ESC_POS', branchId: 2,
    capabilities: { print: true, cut: true },
    discover: async () => [{ id: 'printer-01', online: true }],
    execute: async (job) => ({ status: 'SIMULATED', jobId: job.id }),
  })
  assert.equal((await registry.discover({ id: 'escpos-01', branchId: 2 }))[0].online, true)
  const result = await registry.execute({ id: 'escpos-01', branchId: 2, capability: 'print', job: { id: 'job-1' } })
  assert.equal(result.status, 'SIMULATED')
  assert.equal(result.branchId, 2)
})

test('blocks cross-branch adapter access', async () => {
  const registry = createStoreDeviceAdapterRegistry()
  registry.register({ id: 'queue-01', kind: 'WINDOWS_QUEUE', branchId: 2, capabilities: { print: true }, discover: async () => [], execute: async () => ({}) })
  await assert.rejects(() => registry.execute({ id: 'queue-01', branchId: 3, capability: 'print', job: {} }), { code: 'STORE_DEVICE_ADAPTER_NOT_FOUND' })
})

test('fails closed for unsupported capability', async () => {
  const registry = createStoreDeviceAdapterRegistry()
  registry.register({ id: 'tcp-01', kind: 'RAW_TCP', branchId: 2, capabilities: { print: true }, discover: async () => [], execute: async () => ({}) })
  await assert.rejects(() => registry.execute({ id: 'tcp-01', branchId: 2, capability: 'cashDrawer', job: {} }), { code: 'STORE_DEVICE_CAPABILITY_UNSUPPORTED' })
})
