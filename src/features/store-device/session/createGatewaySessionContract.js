const SESSION_STATES = Object.freeze(['CHALLENGED', 'AUTHENTICATED', 'DISCONNECTED', 'REVOKED'])

const requireText = (value, field) => {
  const normalized = String(value || '').trim()
  if (!normalized) throw new TypeError(`${field} is required`)
  return normalized
}

const createGatewaySessionContract = (input) => {
  if (!input || typeof input !== 'object') throw new TypeError('session input is required')

  const branchId = Number(input.branchId)
  if (!Number.isInteger(branchId) || branchId <= 0) throw new TypeError('branchId must be a positive integer')

  const state = input.state || 'CHALLENGED'
  if (!SESSION_STATES.includes(state)) throw new TypeError(`unsupported session state: ${state}`)

  return Object.freeze({
    sessionId: requireText(input.sessionId, 'sessionId'),
    gatewayId: requireText(input.gatewayId, 'gatewayId'),
    branchId,
    credentialVersion: Number(input.credentialVersion || 1),
    challengeId: requireText(input.challengeId, 'challengeId'),
    state,
    authenticatedAt: input.authenticatedAt || null,
    disconnectedAt: input.disconnectedAt || null,
    revokedAt: input.revokedAt || null,
    createdAt: input.createdAt || new Date().toISOString(),
    metadata: Object.freeze({ ...(input.metadata || {}) }),
  })
}

export { SESSION_STATES, createGatewaySessionContract }
export default createGatewaySessionContract
