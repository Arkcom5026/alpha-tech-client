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

const createMockAuthenticatedWebSocketSessionRuntime = ({
  gatewayId,
  branchId,
  adapter,
  credentialVersion = 1,
} = {}) => {
  const authority = Object.freeze({
    gatewayId: requireString(gatewayId, 'gatewayId'),
    branchId: requireBranchId(branchId),
  })
  if (!adapter || typeof adapter.connect !== 'function' || typeof adapter.send !== 'function') {
    throw new TypeError('adapter is required')
  }
  if (!Number.isInteger(credentialVersion) || credentialVersion <= 0) {
    throw new TypeError('credentialVersion must be a positive integer')
  }

  let state = 'IDLE'
  let challengeId = null
  let sessionId = null
  let reconnectCursor = null
  let lastHeartbeatAt = null
  let activeLease = null
  let revoked = false

  const assertActive = () => {
    if (revoked) {
      const error = new Error('websocket session runtime is revoked')
      error.code = 'WEBSOCKET_SESSION_REVOKED'
      throw error
    }
  }

  const assertAuthority = (message) => {
    if (!message || message.gatewayId !== authority.gatewayId || message.branchId !== authority.branchId) {
      const error = new Error('websocket session authority mismatch')
      error.code = 'WEBSOCKET_SESSION_AUTHORITY_MISMATCH'
      throw error
    }
  }

  const assertAuthenticated = () => {
    assertActive()
    if (state !== 'AUTHENTICATED') {
      const error = new Error('websocket session must be authenticated')
      error.code = 'WEBSOCKET_SESSION_NOT_AUTHENTICATED'
      throw error
    }
  }

  return Object.freeze({
    get snapshot() {
      return Object.freeze({
        ...authority,
        credentialVersion,
        state,
        challengeId,
        sessionId,
        reconnectCursor,
        lastHeartbeatAt,
        activeLease: activeLease ? Object.freeze(structuredClone(activeLease)) : null,
      })
    },

    connect({ cursor = null } = {}) {
      assertActive()
      adapter.connect()
      reconnectCursor = cursor
      state = 'CONNECTED'
      return this.snapshot
    },

    issueChallenge({ challenge, session }) {
      assertActive()
      if (state !== 'CONNECTED' && state !== 'RECONNECTING') throw new Error('runtime must be connected before challenge')
      challengeId = requireString(challenge, 'challengeId')
      sessionId = requireString(session, 'sessionId')
      state = 'CHALLENGED'
      return this.snapshot
    },

    authenticate({ proof, expectedProof }) {
      assertActive()
      if (state !== 'CHALLENGED') throw new Error('runtime must be challenged before authenticate')
      if (!proof || proof !== expectedProof) {
        const error = new Error('invalid websocket challenge proof')
        error.code = 'INVALID_WEBSOCKET_CHALLENGE_PROOF'
        throw error
      }
      state = 'AUTHENTICATED'
      return this.snapshot
    },

    heartbeat(message, now = new Date().toISOString()) {
      assertAuthenticated()
      assertAuthority(message)
      if (message.sessionId !== sessionId) throw new Error('heartbeat session mismatch')
      adapter.send(message)
      lastHeartbeatAt = new Date(now).toISOString()
      return lastHeartbeatAt
    },

    acceptLease(message) {
      assertAuthenticated()
      assertAuthority(message)
      if (message.sessionId !== sessionId) throw new Error('job lease session mismatch')
      const leaseId = requireString(message.payload?.leaseId, 'leaseId')
      const jobId = requireString(message.payload?.jobId, 'jobId')
      if (activeLease && activeLease.jobId === jobId) return Object.freeze(structuredClone(activeLease))
      activeLease = { leaseId, jobId, status: 'LEASED' }
      return Object.freeze(structuredClone(activeLease))
    },

    completeJob(message) {
      assertAuthenticated()
      assertAuthority(message)
      if (!activeLease) throw new Error('no active lease')
      if (message.payload?.leaseId !== activeLease.leaseId) throw new Error('job result lease mismatch')
      adapter.send(message)
      reconnectCursor = requireString(message.reconnectCursor || `job:${activeLease.jobId}`, 'reconnectCursor')
      const completed = Object.freeze({ ...activeLease, status: 'COMPLETED', reconnectCursor })
      activeLease = null
      return completed
    },

    disconnect() {
      if (revoked) return this.snapshot
      adapter.disconnect()
      state = 'DISCONNECTED'
      return this.snapshot
    },

    reconnect() {
      assertActive()
      state = 'RECONNECTING'
      adapter.connect()
      state = 'CONNECTED'
      return this.snapshot
    },

    revoke() {
      revoked = true
      state = 'REVOKED'
      adapter.revoke()
      activeLease = null
      return this.snapshot
    },
  })
}

export { createMockAuthenticatedWebSocketSessionRuntime }
export default createMockAuthenticatedWebSocketSessionRuntime
