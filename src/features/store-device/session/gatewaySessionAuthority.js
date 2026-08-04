import { createGatewaySessionContract } from './createGatewaySessionContract.js'
import { createGatewayJobLeaseContract } from './gatewayJobLeaseContract.js'

const createGatewaySessionAuthority = () => {
  const sessions = new Map()
  const leases = new Map()

  const authenticate = (input) => {
    const current = createGatewaySessionContract({ ...input, state: 'AUTHENTICATED', authenticatedAt: input.authenticatedAt || new Date().toISOString() })
    sessions.set(current.sessionId, current)
    return current
  }

  const requireActiveSession = ({ sessionId, gatewayId, branchId }) => {
    const session = sessions.get(sessionId)
    if (!session || session.state !== 'AUTHENTICATED') throw new Error('authenticated gateway session is required')
    if (session.gatewayId !== gatewayId || session.branchId !== branchId) throw new Error('gateway session scope mismatch')
    return session
  }

  const leaseJob = (input) => {
    requireActiveSession(input)
    const existing = [...leases.values()].find((lease) => lease.jobId === input.jobId && ['LEASED', 'ACKNOWLEDGED'].includes(lease.state))
    if (existing) return existing
    const lease = createGatewayJobLeaseContract(input)
    leases.set(lease.leaseId, lease)
    return lease
  }

  const acknowledge = ({ leaseId, gatewayId, branchId, at = new Date().toISOString() }) => {
    const lease = leases.get(leaseId)
    if (!lease) throw new Error('lease not found')
    if (lease.gatewayId !== gatewayId || lease.branchId !== branchId) throw new Error('lease scope mismatch')
    const next = createGatewayJobLeaseContract({ ...lease, state: 'ACKNOWLEDGED', acknowledgedAt: at })
    leases.set(leaseId, next)
    return next
  }

  const revokeSession = ({ sessionId, at = new Date().toISOString() }) => {
    const session = sessions.get(sessionId)
    if (!session) throw new Error('session not found')
    const next = createGatewaySessionContract({ ...session, state: 'REVOKED', revokedAt: at })
    sessions.set(sessionId, next)
    return next
  }

  return Object.freeze({ authenticate, requireActiveSession, leaseJob, acknowledge, revokeSession })
}

export { createGatewaySessionAuthority }
export default createGatewaySessionAuthority
