import { createReconnectBackoffPolicy } from '../transport/reconnectBackoffPolicy.js'
import { decodeGatewayWebSocketFrame, encodeGatewayWebSocketFrame } from './webSocketMessageFraming.js'

const SOCKET_OPEN = 1

const createGatewayWebSocketAdapter = ({ gatewayId, branchId, url, socketFactory, reconnectPolicy = createReconnectBackoffPolicy() } = {}) => {
  if (!gatewayId) throw new TypeError('gatewayId is required')
  if (!Number.isInteger(branchId) || branchId <= 0) throw new TypeError('branchId must be a positive integer')
  if (!url) throw new TypeError('url is required')
  if (typeof socketFactory !== 'function') throw new TypeError('socketFactory is required')

  let socket = null
  let state = 'IDLE'
  let reconnectAttempt = 0
  let reconnectCursor = null
  const received = []

  const assertNotRevoked = () => {
    if (state === 'REVOKED') {
      const error = new Error('websocket adapter is revoked')
      error.code = 'WEBSOCKET_ADAPTER_REVOKED'
      throw error
    }
  }

  const assertAuthority = (envelope) => {
    if (envelope.gatewayId !== gatewayId || envelope.branchId !== branchId) {
      const error = new Error('websocket envelope authority mismatch')
      error.code = 'WEBSOCKET_AUTHORITY_MISMATCH'
      throw error
    }
  }

  const connect = () => {
    assertNotRevoked()
    state = reconnectAttempt > 0 ? 'RECONNECTING' : 'CONNECTING'
    socket = socketFactory(url)
    socket.onopen = () => { state = 'CONNECTED'; reconnectAttempt = 0 }
    socket.onmessage = (event) => {
      const frame = decodeGatewayWebSocketFrame(event.data)
      assertAuthority(frame.envelope)
      received.push(frame.envelope)
      if (frame.envelope.reconnectCursor) reconnectCursor = frame.envelope.reconnectCursor
    }
    socket.onclose = () => { if (state !== 'REVOKED') state = 'DISCONNECTED' }
    socket.onerror = () => { if (state !== 'REVOKED') state = 'DISCONNECTED' }
    return socket
  }

  return Object.freeze({
    get snapshot() { return Object.freeze({ gatewayId, branchId, url, state, reconnectAttempt, reconnectCursor }) },
    connect,
    send(envelope) {
      assertNotRevoked()
      assertAuthority(envelope)
      if (!socket || socket.readyState !== SOCKET_OPEN) throw new Error('websocket must be open before send')
      socket.send(encodeGatewayWebSocketFrame({ envelope }))
      return true
    },
    drainReceived() { return received.splice(0).map((item) => Object.freeze(structuredClone(item))) },
    disconnect() { if (socket) socket.close(); if (state !== 'REVOKED') state = 'DISCONNECTED' },
    scheduleReconnect(random = Math.random) {
      assertNotRevoked()
      reconnectAttempt += 1
      state = 'RECONNECTING'
      return reconnectPolicy.delayForAttempt(reconnectAttempt - 1, random)
    },
    revoke() { state = 'REVOKED'; if (socket) socket.close() },
  })
}

export { createGatewayWebSocketAdapter }
export default createGatewayWebSocketAdapter
