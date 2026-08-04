const DEFAULT_RECONNECT_POLICY = Object.freeze({
  initialDelayMs: 1_000,
  maxDelayMs: 30_000,
  multiplier: 2,
  jitterRatio: 0.2,
})

const createReconnectBackoffPolicy = (overrides = {}) => {
  const policy = { ...DEFAULT_RECONNECT_POLICY, ...overrides }
  if (!Number.isFinite(policy.initialDelayMs) || policy.initialDelayMs < 0) throw new TypeError('initialDelayMs must be non-negative')
  if (!Number.isFinite(policy.maxDelayMs) || policy.maxDelayMs < policy.initialDelayMs) throw new TypeError('maxDelayMs must be >= initialDelayMs')
  if (!Number.isFinite(policy.multiplier) || policy.multiplier < 1) throw new TypeError('multiplier must be >= 1')
  if (!Number.isFinite(policy.jitterRatio) || policy.jitterRatio < 0 || policy.jitterRatio > 1) throw new TypeError('jitterRatio must be between 0 and 1')

  const delayForAttempt = (attempt, random = Math.random) => {
    if (!Number.isInteger(attempt) || attempt < 0) throw new TypeError('attempt must be a non-negative integer')
    const base = Math.min(policy.maxDelayMs, policy.initialDelayMs * (policy.multiplier ** attempt))
    const jitter = base * policy.jitterRatio * ((random() * 2) - 1)
    return Math.max(0, Math.round(base + jitter))
  }

  return Object.freeze({ ...policy, delayForAttempt })
}

export { DEFAULT_RECONNECT_POLICY, createReconnectBackoffPolicy }
export default createReconnectBackoffPolicy
