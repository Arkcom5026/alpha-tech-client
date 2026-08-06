import { Buffer } from 'node:buffer'
import { createHmac, timingSafeEqual } from 'node:crypto'
import { canonicalSerialize, createProtocolProofMaterial } from './canonicalProtocolSerialization.js'
import { createProtocolMessageDigest } from './protocolMessageDigest.js'

const PROOF_ALGORITHM = 'HMAC-SHA256'
const DEFAULT_CLOCK_SKEW_MS = 60_000
const HEX_64_PATTERN = /^[a-f0-9]{64}$/

const toEpochMs = (value, fieldName) => {
  const epoch = Date.parse(value)
  if (!Number.isFinite(epoch)) throw new TypeError(`${fieldName} must be a valid ISO timestamp`)
  return epoch
}

const assertClockAuthority = ({ envelope, now = Date.now(), maxClockSkewMs = DEFAULT_CLOCK_SKEW_MS }) => {
  if (!Number.isFinite(maxClockSkewMs) || maxClockSkewMs < 0) throw new TypeError('maxClockSkewMs must be non-negative')
  const timestampMs = toEpochMs(envelope.timestamp, 'timestamp')
  const expiresAtMs = toEpochMs(envelope.expiresAt, 'expiresAt')

  if (timestampMs > now + maxClockSkewMs) {
    const error = new Error('protocol message timestamp is too far in the future')
    error.code = 'PROTOCOL_CLOCK_SKEW_EXCEEDED'
    throw error
  }
  if (expiresAtMs < now - maxClockSkewMs) {
    const error = new Error('protocol message proof has expired')
    error.code = 'PROTOCOL_PROOF_EXPIRED'
    throw error
  }
  if (expiresAtMs <= timestampMs) throw new TypeError('expiresAt must be later than timestamp')

  return true
}

const createChallengeProof = ({
  envelope,
  credentialVersion,
  challengeId,
  proofKey,
  now = Date.now(),
  maxClockSkewMs = DEFAULT_CLOCK_SKEW_MS,
}) => {
  if (!challengeId) throw new TypeError('challengeId is required')
  if (typeof proofKey !== 'string' || proofKey.length < 16) throw new TypeError('proofKey must contain at least 16 characters')
  assertClockAuthority({ envelope, now, maxClockSkewMs })

  const material = createProtocolProofMaterial({ envelope, credentialVersion, challengeId })
  const canonical = canonicalSerialize(material)
  const signature = createHmac('sha256', proofKey).update(canonical, 'utf8').digest('hex')

  return Object.freeze({
    algorithm: PROOF_ALGORITHM,
    credentialVersion,
    challengeId,
    digest: createProtocolMessageDigest({ envelope, credentialVersion, challengeId }),
    signature,
  })
}

const verifyChallengeProof = ({
  envelope,
  proof,
  expectedCredentialVersion,
  proofKey,
  now = Date.now(),
  maxClockSkewMs = DEFAULT_CLOCK_SKEW_MS,
}) => {
  if (!proof || typeof proof !== 'object') throw new TypeError('proof is required')
  if (proof.algorithm !== PROOF_ALGORITHM) return false
  if (proof.credentialVersion !== expectedCredentialVersion) return false
  if (!HEX_64_PATTERN.test(String(proof.signature || ''))) return false

  assertClockAuthority({ envelope, now, maxClockSkewMs })
  const expected = createChallengeProof({
    envelope,
    credentialVersion: expectedCredentialVersion,
    challengeId: proof.challengeId,
    proofKey,
    now,
    maxClockSkewMs,
  })

  if (proof.digest !== expected.digest) return false
  return timingSafeEqual(Buffer.from(proof.signature, 'hex'), Buffer.from(expected.signature, 'hex'))
}

export {
  DEFAULT_CLOCK_SKEW_MS,
  PROOF_ALGORITHM,
  assertClockAuthority,
  createChallengeProof,
  verifyChallengeProof,
}
