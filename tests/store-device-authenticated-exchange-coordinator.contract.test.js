import assert from 'node:assert/strict'
import test from 'node:test'
import { createGatewayProtocolEnvelope } from '../src/features/store-device/protocol/createGatewayProtocolEnvelope.js'
import { createInMemoryGatewayTransport } from '../src/features/store-device/transport/inMemoryGatewayTransport.js'
import { createAuthenticatedGatewayExchangeCoordinator } from '../src/features/store-device/exchange/authenticatedGatewayExchangeCoordinator.js'

const expiresAt = () => new Date(Date.now() + 60_000).toISOString()
const envelope = ({ messageId, messageType, sequence, sessionId = 'session-1', payload = {}, reconnectCursor = null, branchId = 2 }) =>
  createGatewayProtocolEnvelope({
    messageId,
    messageType,
    gatewayId: 'gateway-1',
    branchId,
    sequence,
    sessionId,
    nonce: `nonce-${messageId}`,
    expiresAt: expiresAt(),
    reconnectCursor,
    payload,
  })

const createCoordinator = () => {
  const transport = createInMemoryGatewayTransport({ gatewayId: 'gateway-1', branchId: 2 })
  const coordinator = createAuthenticatedGatewayExchangeCoordinator({
    gatewayId: 'gateway-1',
    branchId: 2,
    transport,
    verifyProof: ({ proof, credentialVersion, challenge }) =>
      proof === 'valid-proof' && credentialVersion === 3 && challenge.challengeId === 'challenge-1',
  })
  return { coordinator, transport }
}

test('authenticates heartbeat leases and completes branch job', () => {
  const { coordinator, transport } = createCoordinator()
  coordinator.connect()
  coordinator.issueChallenge({ challengeId: 'challenge-1', nonce: 'challenge-nonce', expiresAt: expiresAt() })
  coordinator.authenticate({
    envelope: envelope({ messageId: 'auth-1', messageType: 'AUTHENTICATE', sequence: 1 }),
    proof: 'valid-proof',
    credentialVersion: 3,
  })
  coordinator.heartbeat(envelope({ messageId: 'heartbeat-1', messageType: 'HEARTBEAT', sequence: 2 }))
  const lease = coordinator.acceptJobLease(envelope({
    messageId: 'lease-1',
    messageType: 'JOB_LEASE',
    sequence: 3,
    payload: { jobId: 'job-1', leaseId: 'lease-1' },
  }))
  assert.equal(lease.jobId, 'job-1')
  const completed = coordinator.completeJob({
    jobId: 'job-1',
    resultEnvelope: envelope({
      messageId: 'result-1',
      messageType: 'JOB_RESULT',
      sequence: 4,
      reconnectCursor: 'cursor-1',
      payload: { jobId: 'job-1', status: 'SUCCEEDED' },
    }),
  })
  assert.equal(completed.reconnectCursor, 'cursor-1')
  assert.equal(coordinator.snapshot.state, 'ACTIVE')
  assert.equal(coordinator.snapshot.activeJobIds.length, 0)
  assert.equal(transport.drainOutbound().length, 3)
})

test('rejects invalid proof and cross-branch lease', () => {
  const { coordinator } = createCoordinator()
  coordinator.connect()
  coordinator.issueChallenge({ challengeId: 'challenge-1', nonce: 'challenge-nonce', expiresAt: expiresAt() })
  assert.throws(() => coordinator.authenticate({
    envelope: envelope({ messageId: 'auth-invalid', messageType: 'AUTHENTICATE', sequence: 1 }),
    proof: 'invalid-proof',
    credentialVersion: 3,
  }), /gateway proof is invalid/)

  coordinator.authenticate({
    envelope: envelope({ messageId: 'auth-2', messageType: 'AUTHENTICATE', sequence: 2 }),
    proof: 'valid-proof',
    credentialVersion: 3,
  })
  assert.throws(() => coordinator.acceptJobLease(envelope({
    messageId: 'lease-cross',
    messageType: 'JOB_LEASE',
    sequence: 3,
    branchId: 9,
    payload: { jobId: 'job-x', leaseId: 'lease-x' },
  })), /authority mismatch/)
})

test('resumes with cursor and blocks revoked coordinator', () => {
  const { coordinator } = createCoordinator()
  coordinator.connect()
  coordinator.issueChallenge({ challengeId: 'challenge-1', nonce: 'challenge-nonce', expiresAt: expiresAt() })
  coordinator.authenticate({
    envelope: envelope({ messageId: 'auth-3', messageType: 'AUTHENTICATE', sequence: 1 }),
    proof: 'valid-proof',
    credentialVersion: 3,
  })
  coordinator.acceptJobLease(envelope({
    messageId: 'lease-3',
    messageType: 'JOB_LEASE',
    sequence: 2,
    payload: { jobId: 'job-3', leaseId: 'lease-3' },
  }))
  coordinator.completeJob({
    jobId: 'job-3',
    resultEnvelope: envelope({
      messageId: 'result-3',
      messageType: 'JOB_RESULT',
      sequence: 3,
      reconnectCursor: 'cursor-3',
      payload: { jobId: 'job-3', status: 'SUCCEEDED' },
    }),
  })
  coordinator.disconnect()
  const resumed = coordinator.reconnect()
  assert.equal(resumed.reconnectCursor, 'cursor-3')
  assert.equal(resumed.state, 'AUTHENTICATED')
  coordinator.revoke()
  assert.throws(() => coordinator.connect(), /revoked/)
})
