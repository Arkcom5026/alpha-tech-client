import test from 'node:test'
import assert from 'node:assert/strict'
import { createOfflineStoreDeviceQueue } from '../src/features/store-device/offline/createOfflineStoreDeviceQueue.js'

test('queues idempotent offline work per branch', () => {
  const queue = createOfflineStoreDeviceQueue()
  const first = queue.enqueue({ branchId: 2, jobId: 'offline-1', idempotencyKey: 'sale-875', payload: { documentId: 875 } })
  const repeated = queue.enqueue({ branchId: 2, jobId: 'offline-2', idempotencyKey: 'sale-875', payload: { documentId: 999 } })
  assert.equal(repeated.jobId, first.jobId)
  assert.equal(queue.list(2).length, 1)
})

test('isolates offline work between stores', () => {
  const queue = createOfflineStoreDeviceQueue()
  queue.enqueue({ branchId: 2, jobId: 'offline-1', idempotencyKey: 'same-key' })
  queue.enqueue({ branchId: 3, jobId: 'offline-1', idempotencyKey: 'same-key' })
  assert.equal(queue.list(2).length, 1)
  assert.equal(queue.list(3).length, 1)
  assert.throws(() => queue.markSyncing({ branchId: 3, jobId: 'missing' }), { code: 'STORE_DEVICE_OFFLINE_JOB_NOT_FOUND' })
})

test('resumes sync without duplicating durable completion', () => {
  const queue = createOfflineStoreDeviceQueue()
  queue.enqueue({ branchId: 2, jobId: 'offline-1', idempotencyKey: 'sale-875' })
  assert.equal(queue.markSyncing({ branchId: 2, jobId: 'offline-1' }).attempts, 1)
  queue.retry({ branchId: 2, jobId: 'offline-1' })
  assert.equal(queue.markSyncing({ branchId: 2, jobId: 'offline-1' }).attempts, 2)
  const synced = queue.markSynced({ branchId: 2, jobId: 'offline-1', durableJobId: 'job-875' })
  assert.equal(synced.status, 'SYNCED')
  assert.equal(queue.markSynced({ branchId: 2, jobId: 'offline-1', durableJobId: 'job-other' }).durableJobId, 'job-875')
})
