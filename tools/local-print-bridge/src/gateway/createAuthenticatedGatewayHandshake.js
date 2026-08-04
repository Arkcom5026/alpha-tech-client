import { createGatewayProtocolEnvelope } from '../../../../src/features/store-device/protocol/createGatewayProtocolEnvelope.js'
import { createChallengeProof } from '../../../../src/features/store-device/proof/protocolProofAuthority.js'

const createAuthenticatedGatewayHandshake = ({ config, client, now = () => new Date() } = {}) => {
  if (!config?.authenticationEnabled) throw new TypeError('authenticated gateway config is required')
  if (!client || typeof client.send !== 'function') throw new TypeError('client is required')

  let authenticated = false
  let sessionId = null
  let lastAuthenticatedAt = null

  const handleEnvelope = (message) => {
    if (message.messageType === 'CHALLENGE') {
      const timestamp = now()
      const envelope = createGatewayProtocolEnvelope({
        messageId: `authenticate-${config.gatewayId}-${timestamp.getTime()}`,
        messageType: 'AUTHENTICATE',
        gatewayId: config.gatewayId,
        branchId: config.branchId,
        sessionId: message.sessionId,
        sequence: 1,
        timestamp: timestamp.toISOString(),
        expiresAt: new Date(timestamp.getTime() + 30_000).toISOString(),
        nonce: `authenticate-nonce-${timestamp.getTime()}`,
        payload: { challengeId: message.payload?.challengeId },
      })
      const proof = createChallengeProof({
        envelope,
        credentialVersion: config.credentialVersion,
        challengeId: message.payload?.challengeId,
        proofKey: config.proofKey,
        now: timestamp.getTime(),
      })
      sessionId = message.sessionId
      client.send({ messageType: 'AUTHENTICATE', gatewayId: config.gatewayId, branchId: config.branchId, envelope, proof })
      return 'AUTHENTICATING'
    }

    if (message.messageType === 'AUTHENTICATED' && message.sessionId === sessionId) {
      authenticated = true
      lastAuthenticatedAt = now().toISOString()
      client.markAuthenticated({ sessionId, credentialVersion: config.credentialVersion, authenticatedAt: lastAuthenticatedAt })
      client.beginHeartbeat({ sessionId })
      return 'AUTHENTICATED'
    }

    return null
  }

  return Object.freeze({
    handleEnvelope,
    get snapshot() {
      return Object.freeze({ authenticated, sessionId, credentialVersion: config.credentialVersion, lastAuthenticatedAt })
    },
  })
}

export { createAuthenticatedGatewayHandshake }
export default createAuthenticatedGatewayHandshake
