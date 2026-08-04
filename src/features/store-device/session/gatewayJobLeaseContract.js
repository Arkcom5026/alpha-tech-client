const LEASE_STATES = Object.freeze(['LEASED', 'ACKNOWLEDGED', 'COMPLETED', 'FAILED', 'EXPIRED'])

const createGatewayJobLeaseContract = (input) => {
  if (!input || typeof input !== 'object') throw new TypeError('lease input is required')
  const branchId = Number(input.branchId)
  if (!Number.isInteger(branchId) || branchId <= 0) throw new TypeError('branchId must be a positive integer')

  const required = ['leaseId', 'jobId', 'gatewayId', 'sessionId']
  for (const field of required) {
    if (!String(input[field] || '').trim()) throw new TypeError(`${field} is required`)
  }

  const state = input.state || 'LEASED'
  if (!LEASE_STATES.includes(state)) throw new TypeError(`unsupported lease state: ${state}`)

  const leasedAt = input.leasedAt || new Date().toISOString()
  const expiresAt = input.expiresAt || null
  if (!expiresAt) throw new TypeError('expiresAt is required')

  return Object.freeze({
    leaseId: String(input.leaseId),
    jobId: String(input.jobId),
    gatewayId: String(input.gatewayId),
    sessionId: String(input.sessionId),
    branchId,
    state,
    leasedAt,
    expiresAt,
    acknowledgedAt: input.acknowledgedAt || null,
    completedAt: input.completedAt || null,
    failure: input.failure ? Object.freeze({ ...input.failure }) : null,
  })
}

export { LEASE_STATES, createGatewayJobLeaseContract }
export default createGatewayJobLeaseContract
