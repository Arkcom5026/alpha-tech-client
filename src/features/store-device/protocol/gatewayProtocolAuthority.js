const createGatewayProtocolAuthority = ({ now = () => new Date() } = {}) => {
  const acceptedMessageIds = new Set()
  const acceptedNonces = new Set()
  const sequenceBySession = new Map()

  const accept = (envelope, authority = {}) => {
    if (!envelope || typeof envelope !== 'object') throw new TypeError('envelope is required')
    if (authority.gatewayId && authority.gatewayId !== envelope.gatewayId) {
      throw new Error('gateway authority mismatch')
    }
    if (authority.branchId && Number(authority.branchId) !== envelope.branchId) {
      throw new Error('branch authority mismatch')
    }
    if (authority.protocolVersion && authority.protocolVersion !== envelope.protocolVersion) {
      throw new Error('protocol version mismatch')
    }
    if (new Date(envelope.expiresAt) <= now()) throw new Error('protocol message expired')
    if (acceptedMessageIds.has(envelope.messageId)) throw new Error('duplicate messageId')
    if (acceptedNonces.has(envelope.nonce)) throw new Error('replayed nonce')

    const sequenceKey = envelope.sessionId || `${envelope.gatewayId}:${envelope.branchId}`
    const previousSequence = sequenceBySession.get(sequenceKey) || 0
    if (envelope.sequence <= previousSequence) throw new Error('out-of-order sequence')

    acceptedMessageIds.add(envelope.messageId)
    acceptedNonces.add(envelope.nonce)
    sequenceBySession.set(sequenceKey, envelope.sequence)

    return Object.freeze({
      accepted: true,
      messageId: envelope.messageId,
      messageType: envelope.messageType,
      gatewayId: envelope.gatewayId,
      branchId: envelope.branchId,
      sequence: envelope.sequence,
      acceptedAt: now().toISOString(),
    })
  }

  return Object.freeze({ accept })
}

export { createGatewayProtocolAuthority }
export default createGatewayProtocolAuthority
