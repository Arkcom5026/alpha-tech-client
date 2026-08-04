import test from 'node:test'
import assert from 'node:assert/strict'
import { createGatewayStartupRuntime, createHeartbeatEnvelopeFactory } from '../tools/local-print-bridge/src/gateway/createGatewayStartupRuntime.js'

const enabledEnv = {
  ALPHA_DEVICE_GATEWAY_ENABLED: '1',
  ALPHA_DEVICE_GATEWAY_ENDPOINT: 'wss://gateway.example.test/device',
  ALPHA_DEVICE_GATEWAY_ID: 'gateway-pos-01',
  ALPHA_DEVICE_GATEWAY_BRANCH_ID: '2',
  ALPHA_DEVICE_GATEWAY_CREDENTIAL_VERSION: '1',
  ALPHA_DEVICE_GATEWAY_PROOF_KEY: 'non-production-proof-key-2026',
  ALPHA_DEVICE_GATEWAY_HEARTBEAT_MS: '15000',
  ALPHA_DEVICE_GATEWAY_RECONNECT_INITIAL_MS: '1000',
  ALPHA_DEVICE_GATEWAY_RECONNECT_MAX_MS: '30000',
  ALPHA_DEVICE_GATEWAY_PHYSICAL_EXECUTION: '1',
}

test('keeps gateway startup disabled and physical execution off by default', () => {
  const runtime = createGatewayStartupRuntime({ env: {} })
  assert.equal(runtime.enabled, false)
  assert.equal(runtime.started, false)
  assert.equal(runtime.diagnostics.state, 'DISABLED')
  assert.equal(runtime.diagnostics.physicalExecutionEnabled, false)
  assert.equal(runtime.start(), null)
})

test('starts opt-in authenticated gateway once and exposes branch-scoped diagnostics', () => {
  let starts = 0
  let stops = 0
  const clientFactory = () => ({
    start() { starts += 1 }, stop() { stops += 1 }, send() {}, markAuthenticated() {}, beginHeartbeat() {},
    get snapshot() { return Object.freeze({ status: starts > stops ? 'CONNECTED' : 'DISCONNECTED', authenticated: false, reconnectCursor: 'cursor-9' }) },
  })
  const handshakeFactory = () => ({ handleEnvelope() {}, get snapshot() { return Object.freeze({ authenticated: false, sessionId: null, lastAuthenticatedAt: null }) } })

  const runtime = createGatewayStartupRuntime({ env: enabledEnv, clientFactory, handshakeFactory })
  runtime.start()
  runtime.start()

  assert.equal(starts, 1)
  assert.equal(runtime.started, true)
  assert.equal(runtime.diagnostics.gatewayId, 'gateway-pos-01')
  assert.equal(runtime.diagnostics.branchId, 2)
  assert.equal(runtime.diagnostics.state, 'CONNECTED')
  assert.equal(runtime.diagnostics.credentialVersion, 1)
  assert.equal(runtime.diagnostics.physicalExecutionEnabled, false)

  runtime.stop()
  assert.equal(stops, 1)
  assert.equal(runtime.started, false)
})

test('creates session-scoped heartbeat identity without enabling physical execution', () => {
  const factory = createHeartbeatEnvelopeFactory({ gatewayId: 'gateway-pos-01', branchId: 2 }, () => new Date('2026-08-04T13:30:00.000Z'))
  const heartbeat = factory({ reconnectCursor: 'cursor-10', sessionId: 'session-10' })
  assert.deepEqual(heartbeat, {
    messageType: 'HEARTBEAT', gatewayId: 'gateway-pos-01', branchId: 2, sessionId: 'session-10',
    timestamp: '2026-08-04T13:30:00.000Z', reconnectCursor: 'cursor-10', physicalExecutionEnabled: false,
  })
})
