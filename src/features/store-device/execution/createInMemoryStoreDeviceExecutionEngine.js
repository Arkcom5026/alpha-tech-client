const TERMINAL = new Set(['COMPLETED','FAILED','DEAD_LETTERED','EXPIRED'])

const createInMemoryStoreDeviceExecutionEngine = ({ now = () => Date.now(), maxAttempts = 3 } = {}) => {
  const jobs = new Map()
  const byIdempotency = new Map()

  const createJob = ({ id, branchId, idempotencyKey, capability, payload = {}, expiresAt = null }) => {
    if (!id || !idempotencyKey || !capability) throw new TypeError('id, idempotencyKey and capability are required')
    if (!Number.isInteger(branchId) || branchId <= 0) throw new TypeError('branchId must be a positive integer')
    const authorityKey = `${branchId}:${idempotencyKey}`
    if (byIdempotency.has(authorityKey)) return jobs.get(byIdempotency.get(authorityKey))
    const job = { id, branchId, idempotencyKey, capability, payload: Object.freeze({ ...payload }), status: 'QUEUED', attempts: 0, lease: null, result: null, expiresAt }
    jobs.set(id, job)
    byIdempotency.set(authorityKey, id)
    return Object.freeze({ ...job })
  }

  const lease = ({ jobId, branchId, gatewayId, sessionId, leaseId }) => {
    const job = jobs.get(jobId)
    if (!job || job.branchId !== branchId) throw Object.assign(new Error('job not found for branch'), { code: 'STORE_DEVICE_JOB_NOT_FOUND' })
    if (TERMINAL.has(job.status)) throw new Error('terminal job cannot be leased')
    if (job.expiresAt && Number(job.expiresAt) <= now()) { job.status = 'EXPIRED'; throw Object.assign(new Error('job expired'), { code: 'STORE_DEVICE_JOB_EXPIRED' }) }
    if (job.lease) return Object.freeze({ ...job.lease })
    job.attempts += 1
    job.status = 'LEASED'
    job.lease = Object.freeze({ leaseId, branchId, gatewayId, sessionId, attempt: job.attempts })
    return job.lease
  }

  const acknowledge = ({ jobId, branchId, leaseId }) => {
    const job = jobs.get(jobId)
    if (!job || job.branchId !== branchId || job.lease?.leaseId !== leaseId) throw Object.assign(new Error('lease authority mismatch'), { code: 'STORE_DEVICE_LEASE_AUTHORITY_MISMATCH' })
    job.status = 'ACKNOWLEDGED'
    return Object.freeze({ ...job })
  }

  const progress = ({ jobId, branchId, leaseId, percent }) => {
    const job = jobs.get(jobId)
    if (!job || job.branchId !== branchId || job.lease?.leaseId !== leaseId) throw Object.assign(new Error('lease authority mismatch'), { code: 'STORE_DEVICE_LEASE_AUTHORITY_MISMATCH' })
    if (!Number.isFinite(percent) || percent < 0 || percent > 100) throw new TypeError('percent must be between 0 and 100')
    job.status = 'EXECUTING'
    job.progress = percent
    return Object.freeze({ ...job })
  }

  const complete = ({ jobId, branchId, leaseId, result }) => {
    const job = jobs.get(jobId)
    if (!job || job.branchId !== branchId || job.lease?.leaseId !== leaseId) throw Object.assign(new Error('lease authority mismatch'), { code: 'STORE_DEVICE_LEASE_AUTHORITY_MISMATCH' })
    if (job.result) return job.result
    job.status = 'COMPLETED'
    job.result = Object.freeze({ jobId, branchId, leaseId, status: 'COMPLETED', output: Object.freeze({ ...(result || {}) }) })
    return job.result
  }

  const fail = ({ jobId, branchId, leaseId, error }) => {
    const job = jobs.get(jobId)
    if (!job || job.branchId !== branchId || job.lease?.leaseId !== leaseId) throw Object.assign(new Error('lease authority mismatch'), { code: 'STORE_DEVICE_LEASE_AUTHORITY_MISMATCH' })
    job.lease = null
    job.status = job.attempts >= maxAttempts ? 'DEAD_LETTERED' : 'QUEUED'
    job.lastError = String(error || 'execution failed')
    return Object.freeze({ ...job })
  }

  const get = ({ jobId, branchId }) => {
    const job = jobs.get(jobId)
    return job && job.branchId === branchId ? Object.freeze({ ...job }) : null
  }

  return Object.freeze({ createJob, lease, acknowledge, progress, complete, fail, get })
}

export { createInMemoryStoreDeviceExecutionEngine }
export default createInMemoryStoreDeviceExecutionEngine
