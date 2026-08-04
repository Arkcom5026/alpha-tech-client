import test from 'node:test'
import assert from 'node:assert/strict'
import { createDurableStoreDeviceBinding } from '../src/features/store-device/execution/createDurableStoreDeviceBinding.js'
import { createStoreDeviceDurableHttpTransport } from '../src/features/store-device/execution/createStoreDeviceDurableHttpTransport.js'

const createTransport = () => ({
  list: async () => [{ jobId: 'job-1' }],
  lease: async (input) => ({ ...input, leaseId: 'lease-1', branchId: input.branchId, reconnectCursor: 'cursor-1' }),
  acknowledge: async (input) => ({ ...input, status: 'ACKNOWLEDGED' }),
  progress: async (input) => ({ ...input, status: 'IN_PROGRESS' }),
  complete: async (input) => ({ ...input, status: 'COMPLETED', reconnectCursor: 'cursor-2', output: { printed: true } }),
})

test('lists leases acknowledges progresses and completes durable work', async () => {
  const binding = createDurableStoreDeviceBinding({ transport: createTransport() })
  const scope = { branchId: 2, gatewayId: 'gw-1', sessionId: 'session-1' }
  const jobs = await binding.list(scope)
  const lease = await binding.lease({ ...scope, jobId: jobs[0].jobId })
  await binding.acknowledge({ ...scope, jobId: jobs[0].jobId, leaseId: lease.leaseId })
  await binding.progress({ ...scope, jobId: jobs[0].jobId, leaseId: lease.leaseId, percent: 50 })
  const result = await binding.complete({ ...scope, jobId: jobs[0].jobId, leaseId: lease.leaseId, output: { printed: true } })
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
  transport.lease = async (input) => ({ ...input, branchId: 3, leaseId: 'lease-x' })
  const binding = createDurableStoreDeviceBinding({ transport })
  await assert.rejects(() => binding.lease({ branchId: 2, gatewayId: 'gw-1', sessionId: 'session-1', jobId: 'job-x' }), { code: 'STORE_DEVICE_CROSS_BRANCH_LEASE' })
})

test('maps durable lifecycle to authenticated server routes without branch path selection', async () => {
  const calls = []
  const http = {
    get: async (url) => { calls.push(['GET', url]); return { data: [] } },
    post: async (url, body) => { calls.push(['POST', url, body]); return { data: { ok: true } } },
  }
  const transport = createStoreDeviceDurableHttpTransport({ http })
  await transport.list()
  await transport.lease({ jobId: 'job-1', gatewayId: 'gw-1', sessionId: 'session-1', expiresAt: '2026-08-05T01:00:00.000Z' })
  await transport.progress({ leaseId: 'lease-1', gatewayId: 'gw-1', sessionId: 'session-1', percent: 50 })
  await transport.complete({ leaseId: 'lease-1', gatewayId: 'gw-1', sessionId: 'session-1', output: { printed: true } })

  assert.equal(calls[0][1], '/api/store-devices/jobs')
  assert.equal(calls[1][1], '/api/store-devices/jobs/job-1/leases')
  assert.equal(calls[2][2].progress, 50)
  assert.deepEqual(calls[3][2].resultSnapshot, { printed: true })
  assert.equal(calls.some(([, url]) => url.includes('/branches/')), false)
})
