const clone = (value) => JSON.parse(JSON.stringify(value))

const requireScope = ({ branchId, gatewayId, sessionId }) => {
  if (!branchId || !gatewayId || !sessionId) {
    const error = new Error('branchId, gatewayId and sessionId are required')
    error.code = 'STORE_DEVICE_DURABLE_SCOPE_REQUIRED'
    throw error
  }
}

const requireJobId = (value) => {
  if (!value?.jobId) {
    const error = new Error('jobId is required')
    error.code = 'STORE_DEVICE_DURABLE_JOB_REQUIRED'
    throw error
  }
}

export const createDurableStoreDeviceBinding = ({ transport }) => {
  if (!transport) throw new TypeError('transport is required')

  let cursor = null
  const completed = new Map()

  return {
    async list(scope) {
      requireScope(scope)
      return clone(await transport.list({ ...scope, reconnectCursor: cursor }))
    },

    async lease(scope) {
      requireScope(scope)
      requireJobId(scope)
      const response = await transport.lease({ ...scope, reconnectCursor: cursor })
      if (response.branchId !== scope.branchId) {
        const error = new Error('cross-branch lease rejected')
        error.code = 'STORE_DEVICE_CROSS_BRANCH_LEASE'
        throw error
      }
      cursor = response.reconnectCursor ?? cursor
      return clone(response)
    },

    async acknowledge(input) {
      requireScope(input)
      return clone(await transport.acknowledge(input))
    },

    async progress(input) {
      requireScope(input)
      return clone(await transport.progress(input))
    },

    async complete(input) {
      requireScope(input)
      const key = `${input.branchId}:${input.jobId}:${input.leaseId}`
      if (completed.has(key)) return clone(completed.get(key))
      const result = await transport.complete(input)
      completed.set(key, clone(result))
      cursor = result.reconnectCursor ?? cursor
      return clone(result)
    },

    diagnostics() {
      return Object.freeze({ reconnectCursor: cursor, completedCount: completed.size })
    },
  }
}

export default createDurableStoreDeviceBinding
