import assert from 'node:assert/strict'
import test from 'node:test'
import { createGatewayProtocolEnvelope } from '../src/features/store-device/protocol/createGatewayProtocolEnvelope.js'
import {
  canonicalSerialize,
  createChallengeProof,
  createProtocolMessageDigest,
  verifyChallengeProof,
} from '../src/features/store-device/proof/index.js'

const NOW = Date.parse('2026-08-04T12:50:00.000Z')
const PROOF_KEY = 'alpha-tech-contract-proof-key'

const createEnvelope = (overrides = {}) => createGatewayProtocolEnvelope({
  messageId: 'message-001',
  messageType: 'AUTHENTICATE',
  gatewayId: 'gateway-advice01',
  branchId: 2,
  sessionId: 'session-001',
  sequence: 1,
  timestamp: '2026-08-04T12:50:00.000Z',
  nonce: 'nonce-001',
  expiresAt: '2026-08-04T12:52:00.000Z',
  payload: { challengeResponse: 'proof-reference', capabilities: ['PRINT'] },
  ...overrides,
})

test('canonical serialization and digest are stable across key order', () => {
  const first = canonicalSerialize({ z: 1, nested: { b: 2, a: 1 }, a: true })
  const second = canonicalSerialize({ a: true, nested: { a: 1, b: 2 }, z: 1 })
  assert.equal(first, second)

  const envelope = createEnvelope()
  assert.equal(
    createProtocolMessageDigest({ envelope, credentialVersion: 3, challengeId: 'challenge-001' }),
    createProtocolMessageDigest({ envelope, credentialVersion: 3, challengeId: 'challenge-001' })
  )
})

test('creates and verifies challenge proof bound to credential version', () => {
  const envelope = createEnvelope()
  const proof = createChallengeProof({
    envelope,
    credentialVersion: 3,
    challengeId: 'challenge-001',
    proofKey: PROOF_KEY,
    now: NOW,
  })

  assert.equal(Object.isFrozen(proof), true)
  assert.equal(verifyChallengeProof({
    envelope,
    proof,
    expectedCredentialVersion: 3,
    proofKey: PROOF_KEY,
    now: NOW,
  }), true)
  assert.equal(verifyChallengeProof({
    envelope,
    proof,
    expectedCredentialVersion: 4,
    proofKey: PROOF_KEY,
    now: NOW,
  }), false)
})

test('rejects payload tampering and clock-skew violations', () => {
  const envelope = createEnvelope()
  const proof = createChallengeProof({
    envelope,
    credentialVersion: 3,
    challengeId: 'challenge-001',
    proofKey: PROOF_KEY,
    now: NOW,
  })
  const tamperedEnvelope = createEnvelope({ payload: { challengeResponse: 'tampered' } })

  assert.equal(verifyChallengeProof({
    envelope: tamperedEnvelope,
    proof,
    expectedCredentialVersion: 3,
    proofKey: PROOF_KEY,
    now: NOW,
  }), false)

  const futureEnvelope = createEnvelope({
    messageId: 'message-future',
    nonce: 'nonce-future',
    timestamp: '2026-08-04T13:00:00.000Z',
    expiresAt: '2026-08-04T13:02:00.000Z',
  })

  assert.throws(() => createChallengeProof({
    envelope: futureEnvelope,
    credentialVersion: 3,
    challengeId: 'challenge-002',
    proofKey: PROOF_KEY,
    now: NOW,
    maxClockSkewMs: 30_000,
  }), { code: 'PROTOCOL_CLOCK_SKEW_EXCEEDED' })
})
