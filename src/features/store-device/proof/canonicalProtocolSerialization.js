const normalizeCanonicalValue = (value) => {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return value

  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new TypeError('canonical values must use finite numbers')
    return value
  }

  if (Array.isArray(value)) return value.map(normalizeCanonicalValue)

  if (typeof value === 'object') {
    return Object.keys(value)
      .sort()
      .reduce((result, key) => {
        const item = value[key]
        if (typeof item === 'undefined' || typeof item === 'function' || typeof item === 'symbol') return result
        result[key] = normalizeCanonicalValue(item)
        return result
      }, {})
  }

  throw new TypeError(`unsupported canonical value type: ${typeof value}`)
}

const canonicalSerialize = (value) => JSON.stringify(normalizeCanonicalValue(value))

const createProtocolProofMaterial = ({ envelope, credentialVersion, challengeId = null }) => {
  if (!envelope || typeof envelope !== 'object') throw new TypeError('envelope is required')
  if (!Number.isInteger(credentialVersion) || credentialVersion < 1) {
    throw new TypeError('credentialVersion must be a positive integer')
  }

  return Object.freeze({
    protocolVersion: envelope.protocolVersion,
    messageId: envelope.messageId,
    messageType: envelope.messageType,
    gatewayId: envelope.gatewayId,
    branchId: envelope.branchId,
    sessionId: envelope.sessionId,
    sequence: envelope.sequence,
    nonce: envelope.nonce,
    issuedAt: envelope.issuedAt,
    expiresAt: envelope.expiresAt,
    correlationId: envelope.correlationId || null,
    causationId: envelope.causationId || null,
    reconnectCursor: envelope.reconnectCursor || null,
    payload: envelope.payload || {},
    credentialVersion,
    challengeId,
  })
}

export { canonicalSerialize, createProtocolProofMaterial, normalizeCanonicalValue }
export default canonicalSerialize
