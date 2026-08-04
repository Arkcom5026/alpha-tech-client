import { createGatewayRuntimeConfigFromEnv } from './createGatewayRuntimeConfig.js'
import { createRealGatewayWebSocketClient } from './createRealGatewayWebSocketClient.js'

const createHeartbeatEnvelopeFactory = (config, now = () => new Date()) => ({ reconnectCursor = null } = {}) => ({
  messageType: 'HEARTBEAT',
  gatewayId: config.gatewayId,
  branchId: config.branchId,
  timestamp: now().toISOString(),
  reconnectCursor,
  physicalExecutionEnabled: false,
})

const createGatewayStartupRuntime = ({
  env = process.env,
  webSocketFactory = (url) => new WebSocket(url),
  clientFactory = createRealGatewayWebSocketClient,
  now,
} = {}) => {
  const config = createGatewayRuntimeConfigFromEnv(env)

  if (!config.enabled) {
    return Object.freeze({
      enabled: false,
      started: false,
      start: () => null,
      stop: () => null,
      get diagnostics() {
        return Object.freeze({
          enabled: false,
          state: 'DISABLED',
          physicalExecutionEnabled: false,
          endpoint: null,
          gatewayId: null,
          branchId: null,
        })
      },
    })
  }

  const client = clientFactory({
    config,
    webSocketFactory,
    createHeartbeatEnvelope: createHeartbeatEnvelopeFactory(config, now),
  })
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
      return Object.freeze({
        ...client.snapshot,
        enabled: true,
        endpoint: config.endpoint,
        gatewayId: config.gatewayId,
        branchId: config.branchId,
        physicalExecutionEnabled: false,
      })
    },
  })
}

export { createGatewayStartupRuntime, createHeartbeatEnvelopeFactory }
export default createGatewayStartupRuntime
