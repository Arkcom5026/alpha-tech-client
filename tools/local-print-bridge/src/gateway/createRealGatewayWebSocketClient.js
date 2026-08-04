import { createReconnectBackoffPolicy } from '../../../../src/features/store-device/transport/reconnectBackoffPolicy.js'
import { createGatewayRuntimeDiagnostics } from './createGatewayRuntimeDiagnostics.js'

const SOCKET_OPEN = 1

const createRealGatewayWebSocketClient = ({
  config,
  webSocketFactory,
  createHeartbeatEnvelope,
  onEnvelope = () => {},
  scheduler = globalThis,
  random = Math.random,
  diagnostics = createGatewayRuntimeDiagnostics(),
} = {}) => {
  if (!config || typeof config !== 'object') throw new TypeError('config is required')
  if (typeof webSocketFactory !== 'function') throw new TypeError('webSocketFactory is required')
  if (typeof createHeartbeatEnvelope !== 'function') throw new TypeError('createHeartbeatEnvelope is required')

  const reconnectPolicy = createReconnectBackoffPolicy({
    initialDelayMs: config.reconnectInitialDelayMs,
    maxDelayMs: config.reconnectMaxDelayMs,
  })

  let socket = null
  let stopped = false
  let revoked = false
  let reconnectAttempt = 0
  let reconnectTimer = null
  let heartbeatTimer = null
  let reconnectCursor = null

  diagnostics.setPhysicalExecutionEnabled(config.physicalExecutionEnabled)
  if (!config.enabled) diagnostics.disabled()

  const clearTimers = () => {
    if (reconnectTimer) scheduler.clearTimeout(reconnectTimer)
    if (heartbeatTimer) scheduler.clearInterval(heartbeatTimer)
    reconnectTimer = null
    heartbeatTimer = null
  }

  const send = (envelope) => {
    if (revoked) throw new Error('gateway websocket client is revoked')
    if (!socket || socket.readyState !== SOCKET_OPEN) throw new Error('gateway websocket is not open')
    if (envelope.gatewayId !== config.gatewayId || envelope.branchId !== config.branchId) {
      const error = new Error('gateway websocket authority mismatch')
      error.code = 'GATEWAY_WEBSOCKET_AUTHORITY_MISMATCH'
      throw error
    }
    socket.send(JSON.stringify(envelope))
    return true
  }

  const startHeartbeat = () => {
    if (heartbeatTimer) scheduler.clearInterval(heartbeatTimer)
    heartbeatTimer = scheduler.setInterval(() => {
      if (!socket || socket.readyState !== SOCKET_OPEN || revoked || stopped) return
      send(createHeartbeatEnvelope({ reconnectCursor }))
      diagnostics.heartbeat()
    }, config.heartbeatIntervalMs)
  }

  const scheduleReconnect = () => {
    if (stopped || revoked || !config.enabled) return null
    const delayMs = reconnectPolicy.delayForAttempt(reconnectAttempt, random)
    reconnectAttempt += 1
    diagnostics.connecting(reconnectAttempt)
    reconnectTimer = scheduler.setTimeout(() => connect(), delayMs)
    return delayMs
  }

  const connect = () => {
    if (!config.enabled || stopped || revoked) return null
    diagnostics.connecting(reconnectAttempt)
    socket = webSocketFactory(config.endpoint)
    socket.onopen = () => {
      reconnectAttempt = 0
      diagnostics.connected()
      startHeartbeat()
    }
    socket.onmessage = (event) => {
      const envelope = typeof event.data === 'string' ? JSON.parse(event.data) : event.data
      if (envelope.gatewayId !== config.gatewayId || envelope.branchId !== config.branchId) {
        const error = new Error('gateway websocket inbound authority mismatch')
        error.code = 'GATEWAY_WEBSOCKET_AUTHORITY_MISMATCH'
        diagnostics.disconnected(error)
        socket.close()
        return
      }
      if (envelope.reconnectCursor) reconnectCursor = envelope.reconnectCursor
      diagnostics.message({ reconnectCursor })
      onEnvelope(envelope)
    }
    socket.onerror = (error) => diagnostics.disconnected(error)
    socket.onclose = () => {
      if (heartbeatTimer) scheduler.clearInterval(heartbeatTimer)
      heartbeatTimer = null
      diagnostics.disconnected()
      scheduleReconnect()
    }
    return socket
  }

  return Object.freeze({
    get snapshot() {
      return Object.freeze({ ...diagnostics.snapshot, reconnectCursor, enabled: config.enabled })
    },
    start() { stopped = false; return connect() },
    send,
    markAuthenticated() { return diagnostics.authenticated() },
    stop() { stopped = true; clearTimers(); if (socket) socket.close(); return diagnostics.disconnected() },
    revoke() { revoked = true; stopped = true; clearTimers(); diagnostics.revoke(); if (socket) socket.close() },
  })
}

export { createRealGatewayWebSocketClient }
export default createRealGatewayWebSocketClient
