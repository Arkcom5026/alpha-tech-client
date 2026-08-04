import assert from 'node:assert/strict'
import test from 'node:test'
import { createMockAuthenticatedWebSocketSessionRuntime } from '../src/features/store-device/websocket/mockAuthenticatedWebSocketSessionRuntime.js'

const createAdapterStub = () => {
  let state = 'IDLE'
  const sent = []
  return {
    connect() { state = 'CONNECTED' },
    disconnect() { state = 'DISCONNECTED' },
    revoke() { state = 'REVOKED' },
    send(message) {
      if (state !== 'CONNECTED') throw new Error('adapter not connected')
      sent.push(structuredClone(message))
    },
    get state() { return state },
    get sent() { return sent },
  }
}

const authorityMessage = ({ type, sessionId = 'session-1', payload = {}, reconnectCursor = null, branchId = 2 } = {}) => ({
  messageType: type,
  gatewayId: 'gateway-1',
  branchId,
  sessionId,
  payload,
  reconnectCursor,
})

test('authenticates heartbeat lease result and reconnect resume', () => {
  const adapter = createAdapterStub()
  const runtime = createMockAuthenticatedWebSocketSessionRuntime({ gatewayId: 'gateway-1', branchId: 2, adapter })

  runtime.connect()
  runtime.issueChallenge({ challenge: 'challenge-1', session: 'session-1' })
  runtime.authenticate({ proof: 'proof-1', expectedProof: 'proof-1' })
  runtime.heartbeat(authorityMessage({ type: 'HEARTBEAT' }), '2026-08-04T13:30:00.000Z')
  const lease = runtime.acceptLease(authorityMessage({ type: 'JOB_LEASE', payload: { leaseId: 'lease-1', jobId: 'job-1' } }))
  const completed = runtime.completeJob(authorityMessage({
    type: 'JOB_RESULT',
    payload: { leaseId: 'lease-1', status: 'SUCCEEDED' },
    reconnectCursor: 'cursor-1',
  }))

  assert.equal(lease.status, 'LEASED')
  assert.equal(completed.status, 'COMPLETED')
  assert.equal(runtime.snapshot.reconnectCursor, 'cursor-1')
  assert.equal(adapter.sent.length, 2)

  runtime.disconnect()
  runtime.reconnect()
  assert.equal(runtime.snapshot.state, 'CONNECTED')
  assert.equal(runtime.snapshot.reconnectCursor, 'cursor-1')
})

test('rejects invalid proof and cross-branch websocket work', () => {
  const runtime = createMockAuthenticatedWebSocketSessionRuntime({ gatewayId: 'gateway-1', branchId: 2, adapter: createAdapterStub() })
  runtime.connect()
  runtime.issueChallenge({ challenge: 'challenge-1', session: 'session-1' })

  assert.throws(
    () => runtime.authenticate({ proof: 'wrong', expectedProof: 'proof-1' }),
    (error) => error.code === 'INVALID_WEBSOCKET_CHALLENGE_PROOF',
  )

  runtime.authenticate({ proof: 'proof-1', expectedProof: 'proof-1' })
  assert.throws(
    () => runtime.acceptLease(authorityMessage({ type: 'JOB_LEASE', branchId: 3, payload: { leaseId: 'lease-x', jobId: 'job-x' } })),
    (error) => error.code === 'WEBSOCKET_SESSION_AUTHORITY_MISMATCH',
  )
})

test('reuses active lease and blocks revoked runtime', () => {
  const adapter = createAdapterStub()
  const runtime = createMockAuthenticatedWebSocketSessionRuntime({ gatewayId: 'gateway-1', branchId: 2, adapter })
  runtime.connect()
  runtime.issueChallenge({ challenge: 'challenge-1', session: 'session-1' })
  runtime.authenticate({ proof: 'proof-1', expectedProof: 'proof-1' })

  const first = runtime.acceptLease(authorityMessage({ type: 'JOB_LEASE', payload: { leaseId: 'lease-1', jobId: 'job-1' } }))
  const second = runtime.acceptLease(authorityMessage({ type: 'JOB_LEASE', payload: { leaseId: 'lease-2', jobId: 'job-1' } }))
  assert.deepEqual(second, first)

  runtime.revoke()
  assert.equal(runtime.snapshot.state, 'REVOKED')
  assert.throws(
    () => runtime.reconnect(),
    (error) => error.code === 'WEBSOCKET_SESSION_REVOKED',
  )
})
