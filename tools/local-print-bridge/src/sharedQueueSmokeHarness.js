const REQUIRED_CONFIRMATION = 'PRINT_SHARED_QUEUE_SMOKE'

const requireText = (value, field) => {
  const normalized = String(value || '').trim()
  if (!normalized) throw new TypeError(`${field} is required`)
  return normalized
}

const createSharedQueueSmokeJob = ({
  printerProfileId,
  confirmation,
  now = () => new Date(),
} = {}) => {
  const normalizedConfirmation = requireText(confirmation, 'confirmation')
  if (normalizedConfirmation !== REQUIRED_CONFIRMATION) {
    const error = new Error(`Shared queue smoke confirmation must equal ${REQUIRED_CONFIRMATION}`)
    error.code = 'SHARED_QUEUE_SMOKE_CONFIRMATION_REQUIRED'
    error.statusCode = 403
    throw error
  }

  const timestamp = now().toISOString()

  return Object.freeze({
    jobId: `shared-queue-smoke-${Date.parse(timestamp)}`,
    branchId: 'SMOKE_TEST_ONLY',
    workstationId: 'LOCAL_PRINT_BRIDGE_SMOKE',
    printerProfileId: requireText(printerProfileId, 'printerProfileId'),
    documentType: 'RECEIPT',
    snapshot: Object.freeze({
      title: 'ALPHA-TECH SHARED QUEUE SMOKE TEST',
      message: 'NO CUSTOMER DATA / DRIVER-MANAGED PRINT',
      generatedAt: timestamp,
    }),
    options: Object.freeze({
      smokeTest: true,
      raw: false,
      cut: false,
      cashDrawer: false,
    }),
  })
}

const runSharedQueueSmoke = async ({
  bridgeUrl = 'http://127.0.0.1:17451',
  printerProfileId,
  confirmation,
  fetchImpl = globalThis.fetch,
  now,
} = {}) => {
  if (typeof fetchImpl !== 'function') throw new TypeError('fetchImpl is required')

  const baseUrl = String(bridgeUrl || '').replace(/\/$/, '')
  const healthResponse = await fetchImpl(`${baseUrl}/health`)
  const health = await healthResponse.json()

  if (!healthResponse.ok || health?.ok !== true) {
    const error = new Error('Local Print Bridge health check failed')
    error.code = 'PRINT_BRIDGE_UNHEALTHY'
    throw error
  }

  if (health.driverManagedPrintingEnabled !== true) {
    const error = new Error('Driver-managed shared queue printing is not enabled')
    error.code = 'DRIVER_MANAGED_PRINTING_REQUIRED'
    throw error
  }

  const printJob = createSharedQueueSmokeJob({ printerProfileId, confirmation, now })
  const response = await fetchImpl(`${baseUrl}/v1/print-jobs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(printJob),
  })
  const payload = await response.json()

  if (!response.ok || payload?.accepted !== true) {
    const error = new Error(payload?.message || 'Shared queue smoke print was rejected')
    error.code = payload?.code || 'SHARED_QUEUE_SMOKE_REJECTED'
    error.statusCode = response.status
    throw error
  }

  if (payload?.result?.adapter !== 'WINDOWS_SHARED_QUEUE_DRIVER') {
    const error = new Error(`Unexpected print adapter: ${payload?.result?.adapter || 'UNKNOWN'}`)
    error.code = 'SHARED_QUEUE_ADAPTER_NOT_USED'
    throw error
  }

  return Object.freeze({
    health: Object.freeze({ ...health }),
    printJob,
    result: Object.freeze({ ...payload.result }),
  })
}

export {
  REQUIRED_CONFIRMATION,
  createSharedQueueSmokeJob,
  runSharedQueueSmoke,
}

export default runSharedQueueSmoke
