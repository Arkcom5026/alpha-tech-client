import { setImmediate } from 'node:timers'
import assert from 'node:assert/strict'
import test from 'node:test'
import { createGatewayWebSocketAdapter } from '../src/features/store-device/websocket/createGatewayWebSocketAdapter.js'
import { createMockWebSocketPair } from '../src/features/store-device/websocket/mockWebSocketRuntime.js'
import { decodeGatewayWebSocketFrame, encodeGatewayWebSocketFrame } from '../src/features/store-device/websocket/webSocketMessageFraming.js'

const envelope = (overrides = {}) => ({
  protocolVersion: '1.0',
  messageId: 'msg-1',
  messageType: 'HEARTBEAT',
  gatewayId: 'gateway-1',
  branchId: 2,
  sessionId: 'session-1',
  sequence: 1,
  timestamp: '2026-08-04T13:00:00.000Z',
  nonce: 'nonce-1',
  expiresAt: '2026-08-04T13:05:00.000Z',
  payload: {},
  ...overrides,
})

const flush = () => new Promise((resolve) => setImmediate(resolve))

test('frames and exchanges branch-scoped protocol messages', async () => {
  const pair = createMockWebSocketPair()
  const adapter = createGatewayWebSocketAdapter({
    gatewayId: 'gateway-1', branchId: 2, url: 'ws://mock/device', socketFactory: () => pair.client,
  })
  pair.server.onmessage = (event) => pair.server.send(event.data)
  adapter.connect()
  pair.open()
  await flush()
  assert.equal(adapter.snapshot.state, 'CONNECTED')
  assert.equal(adapter.send(envelope()), true)
  await flush()
  assert.equal(adapter.drainReceived()[0].messageId, 'msg-1')
})

test('rejects cross-branch messages and unsupported frame version', async () => {
  const pair = createMockWebSocketPair()
  const adapter = createGatewayWebSocketAdapter({
    gatewayId: 'gateway-1', branchId: 2, url: 'ws://mock/device', socketFactory: () => pair.client,
  })
  adapter.connect()
  pair.open()
  await flush()
  assert.throws(() => adapter.send(envelope({ branchId: 3 })), { code: 'WEBSOCKET_AUTHORITY_MISMATCH' })
  const invalid = JSON.stringify({ frameVersion: '9.9', frameType: 'PROTOCOL', envelope: envelope() })
  assert.throws(() => decodeGatewayWebSocketFrame(invalid), { code: 'UNSUPPORTED_WEBSOCKET_FRAME_VERSION' })
})

test('supports reconnect backoff cursor and revocation boundary', async () => {
  const pair = createMockWebSocketPair()
  const adapter = createGatewayWebSocketAdapter({
    gatewayId: 'gateway-1', branchId: 2, url: 'ws://mock/device', socketFactory: () => pair.client,
  })
  pair.server.onmessage = (event) => {
    const frame = decodeGatewayWebSocketFrame(event.data)
    pair.server.send(encodeGatewayWebSocketFrame({ envelope: { ...frame.envelope, reconnectCursor: 'cursor-1' } }))
  }
  adapter.connect()
  pair.open()
  await flush()
  adapter.send(envelope())
  await flush()
  assert.equal(adapter.snapshot.reconnectCursor, 'cursor-1')
  adapter.disconnect()
  assert.equal(adapter.scheduleReconnect(() => 0.5), 1000)
  adapter.revoke()
  assert.throws(() => adapter.connect())
})
