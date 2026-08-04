import test from 'node:test'
import assert from 'node:assert/strict'
import { createInMemoryStoreDeviceExecutionEngine } from '../src/features/store-device/execution/createInMemoryStoreDeviceExecutionEngine.js'

test('creates idempotent branch job and completes immutable result', () => {
  const engine = createInMemoryStoreDeviceExecutionEngine()
  const first = engine.createJob({ id: 'job-1', branchId: 2, idempotencyKey: 'sale-875', capability: 'print' })
  const repeated = engine.createJob({ id: 'job-2', branchId: 2, idempotencyKey: 'sale-875', capability: 'print' })
  assert.equal(first.id, repeated.id)
  const lease = engine.lease({ jobId: 'job-1', branchId: 2, gatewayId: 'gw-1', sessionId: 'session-1', leaseId: 'lease-1' })
  engine.acknowledge({ jobId: 'job-1', branchId: 2, leaseId: lease.leaseId })
  engine.progress({ jobId: 'job-1', branchId: 2, leaseId: lease.leaseId, percent: 50 })
  const result = engine.complete({ jobId: 'job-1', branchId: 2, leaseId: lease.leaseId, result: { pages: 1 } })
  assert.equal(result.status, 'COMPLETED')
  assert.equal(engine.complete({ jobId: 'job-1', branchId: 2, leaseId: lease.leaseId, result: { pages: 99 } }).output.pages, 1)
})

test('reuses one active lease and blocks cross-branch authority', () => {
  const engine = createInMemoryStoreDeviceExecutionEngine()
  engine.createJob({ id: 'job-1', branchId: 2, idempotencyKey: 'key-1', capability: 'print' })
  const first = engine.lease({ jobId: 'job-1', branchId: 2, gatewayId: 'gw-1', sessionId: 'session-1', leaseId: 'lease-1' })
  const repeated = engine.lease({ jobId: 'job-1', branchId: 2, gatewayId: 'gw-1', sessionId: 'session-1', leaseId: 'lease-2' })
  assert.equal(repeated.leaseId, first.leaseId)
  assert.throws(() => engine.lease({ jobId: 'job-1', branchId: 3, gatewayId: 'gw-2', sessionId: 'session-2', leaseId: 'lease-x' }), { code: 'STORE_DEVICE_JOB_NOT_FOUND' })
})

test('retries then moves exhausted work to dead letter', () => {
  const engine = createInMemoryStoreDeviceExecutionEngine({ maxAttempts: 2 })
  engine.createJob({ id: 'job-1', branchId: 2, idempotencyKey: 'key-1', capability: 'print' })
  let lease = engine.lease({ jobId: 'job-1', branchId: 2, gatewayId: 'gw-1', sessionId: 'session-1', leaseId: 'lease-1' })
  assert.equal(engine.fail({ jobId: 'job-1', branchId: 2, leaseId: lease.leaseId, error: 'offline' }).status, 'QUEUED')
  lease = engine.lease({ jobId: 'job-1', branchId: 2, gatewayId: 'gw-1', sessionId: 'session-1', leaseId: 'lease-2' })
  assert.equal(engine.fail({ jobId: 'job-1', branchId: 2, leaseId: lease.leaseId, error: 'offline' }).status, 'DEAD_LETTERED')
})
