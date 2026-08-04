import { createGatewayRuntimeConfigFromEnv } from './createGatewayRuntimeConfig.js'
import { createRealGatewayWebSocketClient } from './createRealGatewayWebSocketClient.js'
import { createNodeWebSocketClient } from './createNodeWebSocketClient.js'
import { createAuthenticatedGatewayHandshake } from './createAuthenticatedGatewayHandshake.js'

const createHeartbeatEnvelopeFactory = (config, now = () => new Date()) => ({ reconnectCursor = null, sessionId = null } = {}) => ({
  messageType: 'HEARTBEAT',
  gatewayId: config.gatewayId,
  branchId: config.branchId,
  sessionId,
  timestamp: now().toISOString(),
  reconnectCursor,
  physicalExecutionEnabled: false,
})

const defaultWebSocketFactory = (url) => typeof globalThis.WebSocket === 'function'
  ? new globalThis.WebSocket(url)
  : createNodeWebSocketClient(url)

const createGatewayStartupRuntime = ({ env = process.env, webSocketFactory = defaultWebSocketFactory, clientFactory = createRealGatewayWebSocketClient, handshakeFactory = createAuthenticatedGatewayHandshake, now } = {}) => {
  const config = createGatewayRuntimeConfigFromEnv(env)

  if (!config.enabled) {
    return Object.freeze({
      enabled: false,
      started: false,
      start: () => null,
      stop: () => null,
      get diagnostics() {
        return Object.freeze({ enabled: false, state: 'DISABLED', authenticated: false, sessionId: null, credentialVersion: null, lastAuthenticatedAt: null, lastHeartbeatAt: null, reconnectCursor: null, physicalExecutionEnabled: false, endpoint: null, gatewayId: null, branchId: null })
      },
    })
  }

  let handshake = null
  const client = clientFactory({
    config,
    webSocketFactory,
    createHeartbeatEnvelope: createHeartbeatEnvelopeFactory(config, now),
    deferHeartbeatUntilAuthenticated: true,
    onEnvelope: (message) => handshake?.handleEnvelope(message),
  })
  handshake = handshakeFactory({ config, client, now })
  let started = false

  return Object.freeze({
    enabled: true,
    get started() { return started },
    start() {
      if (started) return client.snapshot
      started = true
      client.start()
      return client.snapshot
    },
    stop() {
      if (!started) return client.snapshot
      started = false
      client.stop()
      return client.snapshot
    },
    get diagnostics() {
      const clientSnapshot = client.snapshot
      const handshakeSnapshot = handshake.snapshot
      return Object.freeze({
        ...clientSnapshot,
        state: clientSnapshot.status,
        authenticated: handshakeSnapshot.authenticated && clientSnapshot.authenticated,
        sessionId: handshakeSnapshot.sessionId,
        credentialVersion: config.credentialVersion,
        lastAuthenticatedAt: handshakeSnapshot.lastAuthenticatedAt,
        enabled: true,
        endpoint: config.endpoint,
        gatewayId: config.gatewayId,
        branchId: config.branchId,
        physicalExecutionEnabled: false,
      })
    },
  })
}

export { createGatewayStartupRuntime, createHeartbeatEnvelopeFactory, defaultWebSocketFactory }
export default createGatewayStartupRuntime
