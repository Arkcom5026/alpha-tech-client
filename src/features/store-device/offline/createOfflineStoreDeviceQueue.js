function createError(code, message) {
  const error = new Error(message)
  error.code = code
  return error
}

export function createOfflineStoreDeviceQueue() {
  const jobs = new Map()
  const byIdempotency = new Map()

  function scopedKey(branchId, value) {
    return `${branchId}:${value}`
  }

  function requireJob(branchId, jobId) {
    const job = jobs.get(scopedKey(branchId, jobId))
    if (!job) throw createError('STORE_DEVICE_OFFLINE_JOB_NOT_FOUND', 'Offline job not found')
    return job
  }

  return {
    enqueue(input) {
      if (!input?.branchId || !input?.jobId || !input?.idempotencyKey) {
        throw createError('STORE_DEVICE_OFFLINE_JOB_INVALID', 'branchId, jobId and idempotencyKey are required')
      }

      const idempotencyKey = scopedKey(input.branchId, input.idempotencyKey)
      const existingJobId = byIdempotency.get(idempotencyKey)
      if (existingJobId) return requireJob(input.branchId, existingJobId)

      const job = Object.freeze({
        branchId: input.branchId,
        jobId: input.jobId,
        idempotencyKey: input.idempotencyKey,
        payload: structuredClone(input.payload ?? {}),
        status: 'QUEUED_OFFLINE',
        createdAt: input.createdAt ?? new Date().toISOString(),
        attempts: 0,
      })

      jobs.set(scopedKey(input.branchId, input.jobId), job)
      byIdempotency.set(idempotencyKey, input.jobId)
      return job
    },

    list(branchId) {
      return [...jobs.values()].filter((job) => job.branchId === branchId)
    },

    markSyncing({ branchId, jobId }) {
      const current = requireJob(branchId, jobId)
      if (current.status === 'SYNCED') return current
      const next = Object.freeze({ ...current, status: 'SYNCING', attempts: current.attempts + 1 })
      jobs.set(scopedKey(branchId, jobId), next)
      return next
    },

    markSynced({ branchId, jobId, durableJobId, syncedAt = new Date().toISOString() }) {
      const current = requireJob(branchId, jobId)
      if (current.status === 'SYNCED') return current
      const next = Object.freeze({ ...current, status: 'SYNCED', durableJobId, syncedAt })
      jobs.set(scopedKey(branchId, jobId), next)
      return next
    },

    retry({ branchId, jobId }) {
      const current = requireJob(branchId, jobId)
      if (current.status === 'SYNCED') return current
      const next = Object.freeze({ ...current, status: 'QUEUED_OFFLINE' })
      jobs.set(scopedKey(branchId, jobId), next)
      return next
    },
  }
}
