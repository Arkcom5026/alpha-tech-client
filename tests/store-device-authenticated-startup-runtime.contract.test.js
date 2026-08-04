import test from 'node:test'
import assert from 'node:assert/strict'
import { createAuthenticatedGatewayHandshake } from '../tools/local-print-bridge/src/gateway/createAuthenticatedGatewayHandshake.js'

const config = Object.freeze({
  authenticationEnabled: true,
  gatewayId: 'gateway-startup-01',
  branchId: 2,
  credentialVersion: 1,
  proofKey: 'non-production-proof-key-2026',
})

test('authenticates challenge before starting heartbeat and exposes safe session state', () => {
  const sent = []
  const events = []
  const client = {
    send: (message) => sent.push(message),
    markAuthenticated: (evidence) => events.push(['authenticated', evidence]),
    beginHeartbeat: (evidence) => events.push(['heartbeat', evidence]),
  }
  const now = () => new Date('2026-08-04T14:00:00.000Z')
  const handshake = createAuthenticatedGatewayHandshake({ config, client, now })

  handshake.handleEnvelope({
    messageType: 'CHALLENGE', gatewayId: config.gatewayId, branchId: config.branchId,
    sessionId: 'session-1', payload: { challengeId: 'challenge-1', credentialVersion: 1 },
  })
  assert.equal(sent.length, 1)
  assert.equal(sent[0].messageType, 'AUTHENTICATE')
  assert.equal(events.length, 0)

  handshake.handleEnvelope({ messageType: 'AUTHENTICATED', gatewayId: config.gatewayId, branchId: config.branchId, sessionId: 'session-1' })
  assert.equal(events[0][0], 'authenticated')
  assert.equal(events[1][0], 'heartbeat')
  assert.deepEqual(handshake.snapshot, {
    authenticated: true,
    sessionId: 'session-1',
    credentialVersion: 1,
    lastAuthenticatedAt: '2026-08-04T14:00:00.000Z',
  })
  assert.equal('proofKey' in handshake.snapshot, false)
})
