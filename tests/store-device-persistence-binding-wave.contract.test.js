import test from 'node:test'
import assert from 'node:assert/strict'
import { createDurableStoreDeviceBinding } from '../src/features/store-device/execution/createDurableStoreDeviceBinding.js'

const createTransport = () => ({
  lease: async (input) => ({ ...input, jobId: 'job-1', leaseId: 'lease-1', branchId: input.branchId, reconnectCursor: 'cursor-1' }),
  acknowledge: async (input) => ({ ...input, status: 'ACKNOWLEDGED' }),
  progress: async (input) => ({ ...input, status: 'IN_PROGRESS' }),
  complete: async (input) => ({ ...input, status: 'COMPLETED', reconnectCursor: 'cursor-2', output: { printed: true } }),
})

test('leases acknowledges progresses and completes durable work', async () => {
  const binding = createDurableStoreDeviceBinding({ transport: createTransport() })
  const scope = { branchId: 2, gatewayId: 'gw-1', sessionId: 'session-1' }
  const lease = await binding.lease(scope)
  await binding.acknowledge({ ...scope, jobId: lease.jobId, leaseId: lease.leaseId })
  await binding.progress({ ...scope, jobId: lease.jobId, leaseId: lease.leaseId, percent: 50 })
  const result = await binding.complete({ ...scope, jobId: lease.jobId, leaseId: lease.leaseId, output: { printed: true } })
  assert.equal(result.status, 'COMPLETED')
  assert.equal(binding.diagnostics().reconnectCursor, 'cursor-2')
})

test('deduplicates terminal completion after reconnect', async () => {
  let completes = 0
  const transport = createTransport()
  transport.complete = async (input) => { completes += 1; return { ...input, status: 'COMPLETED', output: { copies: 1 } } }
  const binding = createDurableStoreDeviceBinding({ transport })
  const input = { branchId: 2, gatewayId: 'gw-1', sessionId: 'session-1', jobId: 'job-1', leaseId: 'lease-1' }
  const first = await binding.complete(input)
  const repeated = await binding.complete(input)
  assert.deepEqual(repeated, first)
  assert.equal(completes, 1)
})

test('rejects cross-branch durable lease', async () => {
  const transport = createTransport()
  transport.lease = async (input) => ({ ...input, branchId: 3, jobId: 'job-x', leaseId: 'lease-x' })
  const binding = createDurableStoreDeviceBinding({ transport })
  await assert.rejects(() => binding.lease({ branchId: 2, gatewayId: 'gw-1', sessionId: 'session-1' }), { code: 'STORE_DEVICE_CROSS_BRANCH_LEASE' })
})
