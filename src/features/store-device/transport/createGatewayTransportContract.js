const TRANSPORT_STATES = Object.freeze([
  'IDLE',
  'CONNECTING',
  'AUTHENTICATING',
  'CONNECTED',
  'RECONNECTING',
  'DISCONNECTED',
  'REVOKED',
])

const requireText = (value, field) => {
  const normalized = String(value || '').trim()
  if (!normalized) throw new TypeError(`${field} is required`)
  return normalized
}

const requireBranchId = (value) => {
  const branchId = Number(value)
  if (!Number.isInteger(branchId) || branchId <= 0) throw new TypeError('branchId must be a positive integer')
  return branchId
}

const createGatewayTransportContract = ({
  transportId,
  gatewayId,
  branchId,
  protocolVersion = '1.0',
  state = 'IDLE',
  reconnectCursor = null,
  connectedAt = null,
  disconnectedAt = null,
} = {}) => {
  if (!TRANSPORT_STATES.includes(state)) throw new TypeError(`unsupported transport state: ${state}`)

  return Object.freeze({
    transportId: requireText(transportId, 'transportId'),
    gatewayId: requireText(gatewayId, 'gatewayId'),
    branchId: requireBranchId(branchId),
    protocolVersion: requireText(protocolVersion, 'protocolVersion'),
    state,
    reconnectCursor: reconnectCursor ? requireText(reconnectCursor, 'reconnectCursor') : null,
    connectedAt,
    disconnectedAt,
  })
}

export { TRANSPORT_STATES, createGatewayTransportContract }
export default createGatewayTransportContract
