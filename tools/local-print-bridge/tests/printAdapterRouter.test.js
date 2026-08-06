import assert from 'node:assert/strict'
import test from 'node:test'
import { createPrintAdapterRouter } from '../src/printAdapterRouter.js'

const createAdapter = (name) => Object.freeze({
  name,
  print: async () => ({ adapter: name }),
})

const mockAdapter = createAdapter('MOCK')
const rawAdapter = createAdapter('WINDOWS_RAW_ESC_POS')
const sharedQueueAdapter = createAdapter('WINDOWS_SHARED_QUEUE_DRIVER')

const router = createPrintAdapterRouter({
  mockAdapter,
  rawAdapter,
  sharedQueueAdapter,
})

test('routes driver-managed shared connections to the shared queue adapter', () => {
  const adapter = router.resolve({
    connection: 'WINDOWS_QUEUE',
    queueAuthority: 'SHARED_CONNECTION',
    isSharedConnection: true,
    capabilities: { driverManaged: true, raw: false },
  })

  assert.equal(adapter, sharedQueueAdapter)
})

test('keeps local Windows queues on the guarded RAW adapter', () => {
  const adapter = router.resolve({
    connection: 'WINDOWS_QUEUE',
    queueAuthority: 'LOCAL_QUEUE',
    isSharedConnection: false,
    capabilities: { driverManaged: false, raw: true },
  })

  assert.equal(adapter, rawAdapter)
})

test('keeps non-Windows registry printers on the mock adapter', () => {
  const adapter = router.resolve({
    connection: 'MOCK',
    queueAuthority: null,
    capabilities: {},
  })

  assert.equal(adapter, mockAdapter)
})

test('rejects unknown Windows queue authority instead of bypassing gates', () => {
  assert.throws(
    () => router.resolve({
      connection: 'WINDOWS_QUEUE',
      queueAuthority: 'UNKNOWN_QUEUE',
      capabilities: {},
    }),
    (error) => error.code === 'WINDOWS_QUEUE_AUTHORITY_UNSUPPORTED'
  )
})
