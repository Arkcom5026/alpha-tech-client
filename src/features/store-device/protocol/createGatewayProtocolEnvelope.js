const PROTOCOL_VERSION = '1.0'

const MESSAGE_TYPES = Object.freeze([
  'CHALLENGE',
  'AUTHENTICATE',
  'HEARTBEAT',
  'JOB_PULL',
  'JOB_LEASE',
  'JOB_ACK',
  'JOB_RESULT',
  'RECONNECT',
  'REVOKE',
])

const requireNonEmptyString = (value, field) => {
  const normalized = String(value || '').trim()
  if (!normalized) throw new TypeError(`${field} is required`)
  return normalized
}

const requirePositiveInteger = (value, field) => {
  const normalized = Number(value)
  if (!Number.isInteger(normalized) || normalized <= 0) {
    throw new TypeError(`${field} must be a positive integer`)
  }
  return normalized
}

const clonePayload = (payload) => {
  if (payload === undefined) return Object.freeze({})
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new TypeError('payload must be an object')
  }
  return Object.freeze(structuredClone(payload))
}

const createGatewayProtocolEnvelope = ({
  protocolVersion = PROTOCOL_VERSION,
  messageId,
  messageType,
  gatewayId,
  branchId,
  sequence,
  timestamp = new Date().toISOString(),
  correlationId = null,
  causationId = null,
  sessionId = null,
  reconnectCursor = null,
  nonce,
  expiresAt,
  payload = {},
} = {}) => {
  const normalizedType = requireNonEmptyString(messageType, 'messageType')
  if (!MESSAGE_TYPES.includes(normalizedType)) {
    throw new TypeError(`unsupported messageType: ${normalizedType}`)
  }

  const normalizedTimestamp = new Date(timestamp)
  const normalizedExpiresAt = new Date(expiresAt)
  if (Number.isNaN(normalizedTimestamp.getTime())) throw new TypeError('timestamp must be valid')
  if (Number.isNaN(normalizedExpiresAt.getTime())) throw new TypeError('expiresAt must be valid')
  if (normalizedExpiresAt <= normalizedTimestamp) {
    throw new TypeError('expiresAt must be later than timestamp')
  }

  return Object.freeze({
    protocolVersion: requireNonEmptyString(protocolVersion, 'protocolVersion'),
    messageId: requireNonEmptyString(messageId, 'messageId'),
    messageType: normalizedType,
    gatewayId: requireNonEmptyString(gatewayId, 'gatewayId'),
    branchId: requirePositiveInteger(branchId, 'branchId'),
    sequence: requirePositiveInteger(sequence, 'sequence'),
    timestamp: normalizedTimestamp.toISOString(),
    correlationId: correlationId ? requireNonEmptyString(correlationId, 'correlationId') : null,
    causationId: causationId ? requireNonEmptyString(causationId, 'causationId') : null,
    sessionId: sessionId ? requireNonEmptyString(sessionId, 'sessionId') : null,
    reconnectCursor: reconnectCursor ? requireNonEmptyString(reconnectCursor, 'reconnectCursor') : null,
    nonce: requireNonEmptyString(nonce, 'nonce'),
    expiresAt: normalizedExpiresAt.toISOString(),
    payload: clonePayload(payload),
  })
}

export { MESSAGE_TYPES, PROTOCOL_VERSION, createGatewayProtocolEnvelope }
export default createGatewayProtocolEnvelope
