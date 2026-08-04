const GATEWAY_ENROLLMENT_STATES = Object.freeze([
  'PENDING',
  'ENROLLED',
  'SUSPENDED',
  'REVOKED',
])

const GATEWAY_RUNTIME_STATES = Object.freeze([
  'OFFLINE',
  'ONLINE',
  'DEGRADED',
  'ERROR',
])

const assertNonEmptyString = (value, field) => {
  if (typeof value !== 'string' || !value.trim()) {
    throw new TypeError(`${field} is required`)
  }
  return value.trim()
}

const cloneJson = (value) => JSON.parse(JSON.stringify(value ?? {}))

const createStoreDeviceGatewayContract = ({
  gatewayId,
  branchId,
  name,
  enrollmentState = 'PENDING',
  runtimeState = 'OFFLINE',
  capabilities = {},
  platform = {},
  credentialVersion = 1,
  enrolledAt = null,
  lastHeartbeatAt = null,
  revokedAt = null,
  metadata = {},
}) => {
  const normalizedBranchId = Number(branchId)
  if (!Number.isInteger(normalizedBranchId) || normalizedBranchId <= 0) {
    throw new TypeError('branchId is required')
  }
  if (!GATEWAY_ENROLLMENT_STATES.includes(enrollmentState)) {
    throw new TypeError(`Unsupported enrollmentState: ${enrollmentState}`)
  }
  if (!GATEWAY_RUNTIME_STATES.includes(runtimeState)) {
    throw new TypeError(`Unsupported runtimeState: ${runtimeState}`)
  }
  if (!Number.isInteger(credentialVersion) || credentialVersion <= 0) {
    throw new TypeError('credentialVersion must be a positive integer')
  }
  if (enrollmentState === 'REVOKED' && !revokedAt) {
    throw new TypeError('revokedAt is required when gateway is revoked')
  }

  return Object.freeze({
    gatewayId: assertNonEmptyString(gatewayId, 'gatewayId'),
    branchId: normalizedBranchId,
    name: assertNonEmptyString(name, 'name'),
    enrollmentState,
    runtimeState,
    capabilities: Object.freeze(cloneJson(capabilities)),
    platform: Object.freeze(cloneJson(platform)),
    credentialVersion,
    enrolledAt,
    lastHeartbeatAt,
    revokedAt,
    metadata: Object.freeze(cloneJson(metadata)),
  })
}

export {
  GATEWAY_ENROLLMENT_STATES,
  GATEWAY_RUNTIME_STATES,
  createStoreDeviceGatewayContract,
}

export default createStoreDeviceGatewayContract
