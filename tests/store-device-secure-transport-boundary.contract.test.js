import assert from 'node:assert/strict'
import test from 'node:test'
import { createGatewayProtocolEnvelope } from '../src/features/store-device/protocol/createGatewayProtocolEnvelope.js'
import {
  createGatewayTransportContract,
  createInMemoryGatewayTransport,
  createReconnectBackoffPolicy,
} from '../src/features/store-device/transport/index.js'

const createEnvelope = (overrides = {}) => createGatewayProtocolEnvelope({
  messageId: 'msg-1',
  messageType: 'HEARTBEAT',
  gatewayId: 'gateway-1',
  branchId: 2,
  sessionId: 'session-1',
  sequence: 1,
  nonce: 'nonce-1',
  timestamp: '2026-08-04T12:00:00.000Z',
  expiresAt: '2026-08-04T12:05:00.000Z',
  payload: { health: 'ONLINE' },
  ...overrides,
})

test('creates immutable branch-owned transport contract', () => {
  const transport = createGatewayTransportContract({
    transportId: 'transport-1',
    gatewayId: 'gateway-1',
    branchId: 2,
  })

  assert.equal(transport.state, 'IDLE')
  assert.equal(transport.branchId, 2)
  assert.equal(Object.isFrozen(transport), true)
})

test('exchanges branch-scoped envelopes and supports reconnect cursor', () => {
  const transport = createInMemoryGatewayTransport({ gatewayId: 'gateway-1', branchId: 2 })
  transport.connect({ reconnectCursor: 'cursor-10' })
  transport.send(createEnvelope())

  assert.equal(transport.snapshot.state, 'CONNECTED')
  assert.equal(transport.snapshot.reconnectCursor, 'cursor-10')
  assert.equal(transport.drainOutbound().length, 1)

  assert.throws(
    () => transport.send(createEnvelope({ branchId: 3 })),
    (error) => error.code === 'TRANSPORT_AUTHORITY_MISMATCH'
  )
})

test('applies bounded reconnect backoff and blocks revoked transport', () => {
  const policy = createReconnectBackoffPolicy({ jitterRatio: 0 })
  assert.deepEqual([0, 1, 2, 10].map((attempt) => policy.delayForAttempt(attempt)), [1000, 2000, 4000, 30000])

  const transport = createInMemoryGatewayTransport({ gatewayId: 'gateway-1', branchId: 2 })
  transport.connect()
  transport.revoke()

  assert.equal(transport.snapshot.state, 'REVOKED')
  assert.throws(
    () => transport.send(createEnvelope()),
    (error) => error.code === 'GATEWAY_TRANSPORT_REVOKED'
  )
})
