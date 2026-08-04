import http from 'node:http'
import { createHash } from 'node:crypto'
import { createGatewayProtocolEnvelope } from '../../../src/features/store-device/protocol/createGatewayProtocolEnvelope.js'
import { verifyChallengeProof } from '../../../src/features/store-device/proof/protocolProofAuthority.js'

const encodeTextFrame = (value) => {
  const payload = Buffer.from(JSON.stringify(value), 'utf8')
  if (payload.length >= 126) throw new Error('harness payload is too large')
  return Buffer.concat([Buffer.from([0x81, payload.length]), payload])
}

const decodeClientFrames = (buffer) => {
  const messages = []
  let offset = 0
  while (buffer.length - offset >= 2) {
    const first = buffer[offset]
    const second = buffer[offset + 1]
    const opcode = first & 0x0f
    const masked = (second & 0x80) !== 0
    let length = second & 0x7f
    let headerLength = 2
    if (length === 126) {
      if (buffer.length - offset < 4) break
      length = buffer.readUInt16BE(offset + 2)
      headerLength = 4
    }
    const maskLength = masked ? 4 : 0
    if (buffer.length - offset < headerLength + maskLength + length) break
    const mask = masked ? buffer.subarray(offset + headerLength, offset + headerLength + 4) : null
    const payloadStart = offset + headerLength + maskLength
    const payload = Buffer.from(buffer.subarray(payloadStart, payloadStart + length))
    if (mask) for (let index = 0; index < payload.length; index += 1) payload[index] ^= mask[index % 4]
    if (opcode === 0x1) messages.push(JSON.parse(payload.toString('utf8')))
    offset = payloadStart + length
  }
  return { messages, remaining: buffer.subarray(offset) }
}

const createAuthenticatedWebSocketHarness = ({
  host = '127.0.0.1',
  port = 18453,
  gatewayId = 'gateway-auth-smoke-01',
  branchId = 2,
  credentialVersion = 1,
  proofKey = 'non-production-proof-key-2026',
} = {}) => {
  const stats = { connections: 0, challenges: 0, authenticated: 0, heartbeats: 0, rejected: 0, lastSessionId: null }
  const sockets = new Set()
  const server = http.createServer((req, res) => { res.writeHead(404); res.end() })

  server.on('upgrade', (req, socket) => {
    const key = req.headers['sec-websocket-key']
    if (!key) return socket.destroy()
    const accept = createHash('sha1').update(`${key}258EAFA5-E914-47DA-95CA-C5AB0DC85B11`).digest('base64')
    socket.write(['HTTP/1.1 101 Switching Protocols','Upgrade: websocket','Connection: Upgrade',`Sec-WebSocket-Accept: ${accept}`,'\r\n'].join('\r\n'))
    sockets.add(socket)
    stats.connections += 1

    const now = new Date()
    const challengeId = `challenge-${stats.connections}`
    const sessionId = `session-${stats.connections}`
    const challenge = createGatewayProtocolEnvelope({
      messageId: `challenge-message-${stats.connections}`,
      messageType: 'CHALLENGE', gatewayId, branchId, sequence: 1,
      timestamp: now.toISOString(), expiresAt: new Date(now.getTime() + 30_000).toISOString(),
      nonce: `challenge-nonce-${stats.connections}`, sessionId,
      payload: { challengeId, credentialVersion },
    })
    socket.write(encodeTextFrame(challenge))
    stats.challenges += 1

    let buffer = Buffer.alloc(0)
    let isAuthenticated = false
    socket.on('data', (chunk) => {
      buffer = Buffer.concat([buffer, chunk])
      const decoded = decodeClientFrames(buffer)
      buffer = decoded.remaining
      for (const message of decoded.messages) {
        if (message.messageType === 'AUTHENTICATE') {
          const valid = message.gatewayId === gatewayId && message.branchId === branchId &&
            message.sessionId === sessionId && message.payload?.challengeId === challengeId &&
            verifyChallengeProof({ envelope: message, proof: message.payload?.proof, expectedCredentialVersion: credentialVersion, proofKey })
          if (!valid) { stats.rejected += 1; socket.destroy(); continue }
          isAuthenticated = true
          stats.authenticated += 1
          stats.lastSessionId = sessionId
          socket.write(encodeTextFrame({ messageType: 'AUTHENTICATED', gatewayId, branchId, sessionId }))
          continue
        }
        if (message.messageType === 'HEARTBEAT' && isAuthenticated && message.sessionId === sessionId) {
          stats.heartbeats += 1
          socket.write(encodeTextFrame({ messageType: 'HEARTBEAT_ACK', gatewayId, branchId, sessionId, reconnectCursor: `auth-cursor-${stats.heartbeats}` }))
        }
      }
    })
    socket.on('error', (error) => { if (error.code !== 'ECONNRESET') throw error })
    socket.on('close', () => sockets.delete(socket))
  })

  return Object.freeze({
    get stats() { return Object.freeze({ ...stats }) },
    start: () => new Promise((resolve) => server.listen(port, host, () => resolve({ host, port }))),
    stop: () => new Promise((resolve, reject) => { for (const socket of sockets) socket.destroy(); server.close((error) => error ? reject(error) : resolve()) }),
  })
}

export { createAuthenticatedWebSocketHarness }
export default createAuthenticatedWebSocketHarness
