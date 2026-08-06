import { Buffer } from 'node:buffer'
import { createHash, timingSafeEqual } from 'node:crypto'
import { canonicalSerialize, createProtocolProofMaterial } from './canonicalProtocolSerialization.js'

const SHA256_HEX_PATTERN = /^[a-f0-9]{64}$/

const createProtocolMessageDigest = ({ envelope, credentialVersion, challengeId = null }) => {
  const material = createProtocolProofMaterial({ envelope, credentialVersion, challengeId })
  return createHash('sha256').update(canonicalSerialize(material), 'utf8').digest('hex')
}

const verifyProtocolMessageDigest = ({ envelope, credentialVersion, challengeId = null, digest }) => {
  if (!SHA256_HEX_PATTERN.test(String(digest || ''))) return false
  const expected = createProtocolMessageDigest({ envelope, credentialVersion, challengeId })
  return timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(digest, 'hex'))
}

export { createProtocolMessageDigest, verifyProtocolMessageDigest }
export default createProtocolMessageDigest
