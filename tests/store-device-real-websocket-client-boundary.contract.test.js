import assert from 'node:assert/strict'
import test from 'node:test'

import { createGatewayRuntimeConfig } from '../tools/local-print-bridge/src/gateway/createGatewayRuntimeConfig.js'
import { createRealGatewayWebSocketClient } from '../tools/local-print-bridge/src/gateway/createRealGatewayWebSocketClient.js'

const createScheduler = () => {
  const timeouts = []
  const intervals = []
  return {
    setTimeout(fn, delay) { const item = { fn, delay }; timeouts.push(item); return item },
    clearTimeout(item) { const index = timeouts.indexOf(item); if (index >= 0) timeouts.splice(index, 1) },
    setInterval(fn, delay) { const item = { fn, delay }; intervals.push(item); return item },
    clearInterval(item) { const index = intervals.indexOf(item); if (index >= 0) intervals.splice(index, 1) },
    timeouts,
    intervals,
  }
}

const createSocketFactory = () => {
  const sockets = []
  const factory = (url) => {
    const socket = {
      url,
      readyState: 0,
      sent: [],
      send(value) { this.sent.push(value) },
      close() { this.readyState = 3; this.onclose?.() },
      open() { this.readyState = 1; this.onopen?.() },
      receive(value) { this.onmessage?.({ data: JSON.stringify(value) }) },
    }
    sockets.push(socket)
    return socket
  }
  return { factory, sockets }
}

const config = createGatewayRuntimeConfig({
  enabled: true,
  endpoint: 'ws://127.0.0.1:19090/device-gateway',
  gatewayId: 'gateway-store-2',
  branchId: 2,
  heartbeatIntervalMs: 1000,
  reconnectInitialDelayMs: 100,
  reconnectMaxDelayMs: 1000,
})

test('connects outbound schedules heartbeat and exposes diagnostics', () => {
  const scheduler = createScheduler()
  const sockets = createSocketFactory()
  const client = createRealGatewayWebSocketClient({
    config,
    webSocketFactory: sockets.factory,
    scheduler,
    random: () => 0.5,
    createHeartbeatEnvelope: () => ({ gatewayId: 'gateway-store-2', branchId: 2, messageType: 'HEARTBEAT' }),
  })

  client.start()
  sockets.sockets[0].open()
  assert.equal(client.snapshot.status, 'CONNECTED')
  assert.equal(scheduler.intervals.length, 1)
  scheduler.intervals[0].fn()
  assert.equal(sockets.sockets[0].sent.length, 1)
})

test('tracks reconnect cursor and rejects cross-branch outbound work', () => {
  const scheduler = createScheduler()
  const sockets = createSocketFactory()
  const received = []
  const client = createRealGatewayWebSocketClient({
    config,
    webSocketFactory: sockets.factory,
    scheduler,
    createHeartbeatEnvelope: () => ({ gatewayId: 'gateway-store-2', branchId: 2 }),
    onEnvelope: (envelope) => received.push(envelope),
  })

  client.start()
  sockets.sockets[0].open()
  sockets.sockets[0].receive({ gatewayId: 'gateway-store-2', branchId: 2, reconnectCursor: 'cursor-9' })
  assert.equal(client.snapshot.reconnectCursor, 'cursor-9')
  assert.equal(received.length, 1)
  assert.throws(() => client.send({ gatewayId: 'gateway-store-2', branchId: 3 }), /authority mismatch/)
})

test('schedules bounded reconnect and blocks revoked client', () => {
  const scheduler = createScheduler()
  const sockets = createSocketFactory()
  const client = createRealGatewayWebSocketClient({
    config,
    webSocketFactory: sockets.factory,
    scheduler,
    random: () => 0.5,
    createHeartbeatEnvelope: () => ({ gatewayId: 'gateway-store-2', branchId: 2 }),
  })

  client.start()
  sockets.sockets[0].open()
  sockets.sockets[0].close()
  assert.equal(scheduler.timeouts.length, 1)
  assert.equal(scheduler.timeouts[0].delay, 100)
  client.revoke()
  assert.equal(client.snapshot.status, 'REVOKED')
  assert.throws(() => client.send({ gatewayId: 'gateway-store-2', branchId: 2 }), /revoked/)
})
