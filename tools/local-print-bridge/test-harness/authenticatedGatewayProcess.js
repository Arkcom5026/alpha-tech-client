import { createGatewayProtocolEnvelope } from '../../../src/features/store-device/protocol/createGatewayProtocolEnvelope.js'
import { createChallengeProof } from '../../../src/features/store-device/proof/protocolProofAuthority.js'
import { createNodeWebSocketClient } from '../src/gateway/createNodeWebSocketClient.js'

const endpoint = process.env.ALPHA_AUTH_HARNESS_ENDPOINT
const gatewayId = process.env.ALPHA_DEVICE_GATEWAY_ID
const branchId = Number(process.env.ALPHA_DEVICE_GATEWAY_BRANCH_ID)
const proofKey = process.env.ALPHA_DEVICE_GATEWAY_PROOF_KEY

if (!endpoint || !gatewayId || !Number.isInteger(branchId) || !proofKey) throw new Error('authenticated gateway process configuration is incomplete')

const socket = createNodeWebSocketClient(endpoint)
let sequence = 1
let sessionId = null
let heartbeatTimer = null

const send = (value) => socket.send(JSON.stringify(value))

socket.onmessage = ({ data }) => {
  const message = JSON.parse(data)
  if (message.messageType === 'CHALLENGE') {
    sessionId = message.sessionId
    const now = new Date()
    const envelope = createGatewayProtocolEnvelope({
      messageId: `authenticate-${process.pid}-${sequence}`,
      messageType: 'AUTHENTICATE', gatewayId, branchId, sequence: sequence++, sessionId,
      timestamp: now.toISOString(), expiresAt: new Date(now.getTime() + 30_000).toISOString(), nonce: `authenticate-nonce-${process.pid}-${sequence}`,
      correlationId: message.messageId,
      payload: { challengeId: message.payload.challengeId },
    })
    const proof = createChallengeProof({ envelope, credentialVersion: message.payload.credentialVersion, challengeId: message.payload.challengeId, proofKey })
    send({ messageType: 'AUTHENTICATE', envelope, proof })
    return
  }
  if (message.messageType === 'AUTHENTICATED') {
    heartbeatTimer = setInterval(() => send({ messageType: 'HEARTBEAT', gatewayId, branchId, sessionId }), 40)
  }
}

const shutdown = () => {
  if (heartbeatTimer) clearInterval(heartbeatTimer)
  socket.close()
  setTimeout(() => process.exit(0), 20).unref()
}
process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
