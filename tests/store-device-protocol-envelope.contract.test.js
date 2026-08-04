import assert from 'node:assert/strict'
import test from 'node:test'
import {
  createGatewayProtocolAuthority,
  createGatewayProtocolEnvelope,
} from '../src/features/store-device/protocol/index.js'

const baseMessage = (overrides = {}) => ({
  messageId: 'msg-001',
  messageType: 'HEARTBEAT',
  gatewayId: 'gateway-advice01',
  branchId: 2,
  sequence: 1,
  timestamp: '2026-08-04T12:40:00.000Z',
  sessionId: 'session-001',
  nonce: 'nonce-001',
  expiresAt: '2026-08-04T12:41:00.000Z',
  payload: { status: 'ONLINE' },
  ...overrides,
})

test('creates immutable branch-scoped protocol envelope', () => {
  const envelope = createGatewayProtocolEnvelope(baseMessage())
  assert.equal(envelope.protocolVersion, '1.0')
  assert.equal(envelope.branchId, 2)
  assert.equal(envelope.messageType, 'HEARTBEAT')
  assert.equal(Object.isFrozen(envelope), true)
  assert.equal(Object.isFrozen(envelope.payload), true)
})

test('rejects unsupported and expired protocol messages', () => {
  assert.throws(
    () => createGatewayProtocolEnvelope(baseMessage({ messageType: 'UNKNOWN' })),
    /unsupported messageType/
  )

  const authority = createGatewayProtocolAuthority({
    now: () => new Date('2026-08-04T12:42:00.000Z'),
  })
  const envelope = createGatewayProtocolEnvelope(baseMessage())
  assert.throws(() => authority.accept(envelope), /expired/)
})

test('enforces branch authority replay protection and ordered sequence', () => {
  const authority = createGatewayProtocolAuthority({
    now: () => new Date('2026-08-04T12:40:30.000Z'),
  })

  const first = createGatewayProtocolEnvelope(baseMessage())
  const accepted = authority.accept(first, {
    gatewayId: 'gateway-advice01',
    branchId: 2,
    protocolVersion: '1.0',
  })
  assert.equal(accepted.accepted, true)

  assert.throws(() => authority.accept(first), /duplicate messageId/)

  const replayedNonce = createGatewayProtocolEnvelope(baseMessage({
    messageId: 'msg-002',
    sequence: 2,
  }))
  assert.throws(() => authority.accept(replayedNonce), /replayed nonce/)

  const outOfOrder = createGatewayProtocolEnvelope(baseMessage({
    messageId: 'msg-003',
    nonce: 'nonce-003',
    sequence: 1,
  }))
  assert.throws(() => authority.accept(outOfOrder), /out-of-order sequence/)

  const crossBranch = createGatewayProtocolEnvelope(baseMessage({
    messageId: 'msg-004',
    nonce: 'nonce-004',
    sequence: 2,
  }))
  assert.throws(
    () => authority.accept(crossBranch, { branchId: 3 }),
    /branch authority mismatch/
  )
})
