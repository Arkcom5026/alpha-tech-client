import assert from 'node:assert/strict'
import test from 'node:test'
import { createGatewaySessionAuthority } from '../src/features/store-device/session/index.js'

const sessionInput = {
  sessionId: 'session-001',
  gatewayId: 'gateway-advice01',
  branchId: 2,
  credentialVersion: 1,
  challengeId: 'challenge-001',
}

test('authenticates outbound gateway session and leases branch job', () => {
  const authority = createGatewaySessionAuthority()
  const session = authority.authenticate(sessionInput)
  assert.equal(session.state, 'AUTHENTICATED')

  const lease = authority.leaseJob({
    leaseId: 'lease-001',
    jobId: 'job-001',
    gatewayId: session.gatewayId,
    sessionId: session.sessionId,
    branchId: session.branchId,
    expiresAt: '2026-08-04T20:00:00.000Z',
  })
  assert.equal(lease.state, 'LEASED')
})

test('prevents cross-branch gateway session and lease use', () => {
  const authority = createGatewaySessionAuthority()
  authority.authenticate(sessionInput)
  assert.throws(() => authority.leaseJob({
    leaseId: 'lease-cross-branch',
    jobId: 'job-cross-branch',
    gatewayId: sessionInput.gatewayId,
    sessionId: sessionInput.sessionId,
    branchId: 3,
    expiresAt: '2026-08-04T20:00:00.000Z',
  }), /scope mismatch/)
})

test('reuses active job lease and blocks revoked session', () => {
  const authority = createGatewaySessionAuthority()
  authority.authenticate(sessionInput)
  const first = authority.leaseJob({
    leaseId: 'lease-001',
    jobId: 'job-idempotent',
    gatewayId: sessionInput.gatewayId,
    sessionId: sessionInput.sessionId,
    branchId: sessionInput.branchId,
    expiresAt: '2026-08-04T20:00:00.000Z',
  })
  const repeated = authority.leaseJob({
    leaseId: 'lease-002',
    jobId: 'job-idempotent',
    gatewayId: sessionInput.gatewayId,
    sessionId: sessionInput.sessionId,
    branchId: sessionInput.branchId,
    expiresAt: '2026-08-04T20:00:00.000Z',
  })
  assert.equal(repeated.leaseId, first.leaseId)

  authority.revokeSession({ sessionId: sessionInput.sessionId })
  assert.throws(() => authority.leaseJob({
    leaseId: 'lease-after-revoke',
    jobId: 'job-after-revoke',
    gatewayId: sessionInput.gatewayId,
    sessionId: sessionInput.sessionId,
    branchId: sessionInput.branchId,
    expiresAt: '2026-08-04T20:00:00.000Z',
  }), /authenticated gateway session is required/)
})
