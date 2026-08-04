const requireText = (value, field) => {
  const normalized = String(value || '').trim()
  if (!normalized) throw new TypeError(`${field} is required`)
  return normalized
}

const requirePositiveInteger = (value, field) => {
  const normalized = Number(value)
  if (!Number.isInteger(normalized) || normalized <= 0) throw new TypeError(`${field} must be a positive integer`)
  return normalized
}

const createGatewayRuntimeConfig = ({
  enabled = false,
  endpoint,
  gatewayId,
  branchId,
  heartbeatIntervalMs = 15_000,
  reconnectInitialDelayMs = 1_000,
  reconnectMaxDelayMs = 30_000,
  credentialVersion,
  proofKey,
  physicalExecutionEnabled = false,
} = {}) => {
  if (!enabled) {
    return Object.freeze({
      enabled: false,
      authenticationEnabled: false,
      endpoint: null,
      gatewayId: null,
      branchId: null,
      credentialVersion: null,
      proofKey: null,
      heartbeatIntervalMs,
      reconnectInitialDelayMs,
      reconnectMaxDelayMs,
      physicalExecutionEnabled: false,
    })
  }

  const parsedEndpoint = new URL(requireText(endpoint, 'endpoint'))
  if (!['ws:', 'wss:'].includes(parsedEndpoint.protocol)) throw new TypeError('endpoint must use ws or wss protocol')

  const normalizedHeartbeat = requirePositiveInteger(heartbeatIntervalMs, 'heartbeatIntervalMs')
  const normalizedInitialDelay = requirePositiveInteger(reconnectInitialDelayMs, 'reconnectInitialDelayMs')
  const normalizedMaxDelay = requirePositiveInteger(reconnectMaxDelayMs, 'reconnectMaxDelayMs')
  if (normalizedMaxDelay < normalizedInitialDelay) throw new TypeError('reconnectMaxDelayMs must be >= reconnectInitialDelayMs')

  const normalizedProofKey = requireText(proofKey, 'proofKey')
  if (normalizedProofKey.length < 16) throw new TypeError('proofKey must contain at least 16 characters')

  return Object.freeze({
    enabled: true,
    authenticationEnabled: true,
    endpoint: parsedEndpoint.toString(),
    gatewayId: requireText(gatewayId, 'gatewayId'),
    branchId: requirePositiveInteger(branchId, 'branchId'),
    credentialVersion: requirePositiveInteger(credentialVersion, 'credentialVersion'),
    proofKey: normalizedProofKey,
    heartbeatIntervalMs: normalizedHeartbeat,
    reconnectInitialDelayMs: normalizedInitialDelay,
    reconnectMaxDelayMs: normalizedMaxDelay,
    physicalExecutionEnabled: false,
  })
}

const createGatewayRuntimeConfigFromEnv = (env = process.env) => createGatewayRuntimeConfig({
  enabled: env.ALPHA_DEVICE_GATEWAY_ENABLED === '1',
  endpoint: env.ALPHA_DEVICE_GATEWAY_ENDPOINT,
  gatewayId: env.ALPHA_DEVICE_GATEWAY_ID,
  branchId: env.ALPHA_DEVICE_GATEWAY_BRANCH_ID,
  credentialVersion: env.ALPHA_DEVICE_GATEWAY_CREDENTIAL_VERSION,
  proofKey: env.ALPHA_DEVICE_GATEWAY_PROOF_KEY,
  heartbeatIntervalMs: env.ALPHA_DEVICE_GATEWAY_HEARTBEAT_MS || 15_000,
  reconnectInitialDelayMs: env.ALPHA_DEVICE_GATEWAY_RECONNECT_INITIAL_MS || 1_000,
  reconnectMaxDelayMs: env.ALPHA_DEVICE_GATEWAY_RECONNECT_MAX_MS || 30_000,
  physicalExecutionEnabled: false,
})

export { createGatewayRuntimeConfig, createGatewayRuntimeConfigFromEnv }
export default createGatewayRuntimeConfig
