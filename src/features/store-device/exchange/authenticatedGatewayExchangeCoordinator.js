const EXCHANGE_STATES = Object.freeze([
  'IDLE',
  'CHALLENGED',
  'AUTHENTICATED',
  'ACTIVE',
  'DISCONNECTED',
  'REVOKED',
])

const requireString = (value, field) => {
  const normalized = String(value || '').trim()
  if (!normalized) throw new TypeError(`${field} is required`)
  return normalized
}

const requireBranchId = (value) => {
  const normalized = Number(value)
  if (!Number.isInteger(normalized) || normalized <= 0) throw new TypeError('branchId must be a positive integer')
  return normalized
}

const createAuthenticatedGatewayExchangeCoordinator = ({
  gatewayId,
  branchId,
  transport,
  verifyProof,
} = {}) => {
  const authority = Object.freeze({
    gatewayId: requireString(gatewayId, 'gatewayId'),
    branchId: requireBranchId(branchId),
  })
  if (!transport || typeof transport.connect !== 'function' || typeof transport.send !== 'function') {
    throw new TypeError('transport is required')
  }
  if (typeof verifyProof !== 'function') throw new TypeError('verifyProof is required')

  let state = 'IDLE'
  let challenge = null
  let sessionId = null
  let reconnectCursor = null
  let lastHeartbeatAt = null
  const activeJobs = new Map()

  const assertNotRevoked = () => {
    if (state === 'REVOKED') {
      const error = new Error('gateway exchange is revoked')
      error.code = 'GATEWAY_EXCHANGE_REVOKED'
      throw error
    }
  }

  const assertAuthority = (value) => {
    if (value.gatewayId !== authority.gatewayId || value.branchId !== authority.branchId) {
      const error = new Error('gateway exchange authority mismatch')
      error.code = 'GATEWAY_EXCHANGE_AUTHORITY_MISMATCH'
      throw error
    }
  }

  const snapshot = () => Object.freeze({
    ...authority,
    state,
    sessionId,
    reconnectCursor,
    lastHeartbeatAt,
    activeJobIds: Object.freeze([...activeJobs.keys()]),
  })

  return Object.freeze({
    get snapshot() {
      return snapshot()
    },
    connect({ cursor = null } = {}) {
      assertNotRevoked()
      transport.connect({ reconnectCursor: cursor })
      reconnectCursor = cursor
      state = 'IDLE'
      return snapshot()
    },
    issueChallenge({ challengeId, nonce, expiresAt }) {
      assertNotRevoked()
      challenge = Object.freeze({
        challengeId: requireString(challengeId, 'challengeId'),
        nonce: requireString(nonce, 'nonce'),
        expiresAt: new Date(expiresAt).toISOString(),
      })
      state = 'CHALLENGED'
      return challenge
    },
    authenticate({ envelope, proof, credentialVersion }) {
      assertNotRevoked()
      if (state !== 'CHALLENGED' || !challenge) throw new Error('challenge is required before authentication')
      assertAuthority(envelope)
      const valid = verifyProof({ envelope, proof, credentialVersion, challenge })
      if (!valid) {
        const error = new Error('gateway proof is invalid')
        error.code = 'GATEWAY_PROOF_INVALID'
        throw error
      }
      sessionId = requireString(envelope.sessionId, 'sessionId')
      state = 'AUTHENTICATED'
      transport.send(envelope)
      return snapshot()
    },
    heartbeat(envelope) {
      assertNotRevoked()
      if (!['AUTHENTICATED', 'ACTIVE'].includes(state)) throw new Error('authenticated session is required')
      assertAuthority(envelope)
      if (envelope.sessionId !== sessionId) throw new Error('heartbeat session mismatch')
      transport.send(envelope)
      lastHeartbeatAt = envelope.timestamp || new Date().toISOString()
      state = 'ACTIVE'
      return snapshot()
    },
    acceptJobLease(envelope) {
      assertNotRevoked()
      if (!['AUTHENTICATED', 'ACTIVE'].includes(state)) throw new Error('authenticated session is required')
      assertAuthority(envelope)
      if (envelope.sessionId !== sessionId) throw new Error('job lease session mismatch')
      const jobId = requireString(envelope.payload?.jobId, 'payload.jobId')
      const existing = activeJobs.get(jobId)
      if (existing) return existing
      const lease = Object.freeze({ jobId, leaseId: requireString(envelope.payload?.leaseId, 'payload.leaseId') })
      activeJobs.set(jobId, lease)
      transport.receive(envelope)
      return lease
    },
    completeJob({ jobId, resultEnvelope }) {
      assertNotRevoked()
      assertAuthority(resultEnvelope)
      if (resultEnvelope.sessionId !== sessionId) throw new Error('job result session mismatch')
      const lease = activeJobs.get(jobId)
      if (!lease) throw new Error('active job lease not found')
      transport.send(resultEnvelope)
      activeJobs.delete(jobId)
      reconnectCursor = resultEnvelope.reconnectCursor || resultEnvelope.messageId
      return Object.freeze({ jobId, reconnectCursor })
    },
    disconnect() {
      if (state === 'REVOKED') return snapshot()
      transport.disconnect()
      state = 'DISCONNECTED'
      return snapshot()
    },
    reconnect() {
      assertNotRevoked()
      transport.connect({ reconnectCursor })
      state = sessionId ? 'AUTHENTICATED' : 'IDLE'
      return snapshot()
    },
    revoke() {
      transport.revoke()
      state = 'REVOKED'
      activeJobs.clear()
      return snapshot()
    },
  })
}

export { EXCHANGE_STATES, createAuthenticatedGatewayExchangeCoordinator }
export default createAuthenticatedGatewayExchangeCoordinator
