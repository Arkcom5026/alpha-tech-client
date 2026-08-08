import process from 'node:process'
import {
  bootstrapStoreDeviceGatewaySession,
  createStoreDeviceGatewaySessionClient,
} from './storeDeviceGatewaySessionClient.js'

const fail = (code, message, statusCode = 400, detail = undefined) =>
  Object.assign(new Error(message), { code, statusCode, detail })

const requiredText = (value, code, field) => {
  if (typeof value !== 'string' || !value.trim()) throw fail(code, `${field} is required`)
  return value.trim()
}

const positiveInteger = (value, fallback) => {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback
}

const parseJsonResponse = async (response, fallbackCode) => {
  let body
  try {
    body = await response.json()
  } catch (_error) {
    throw fail('PRINT_BRIDGE_SERVER_RESPONSE_INVALID', 'Store Device API returned a non-JSON response', 502)
  }
  if (!response.ok) {
    throw fail(
      body?.code || fallbackCode,
      body?.error || body?.message || 'Store Device worker request failed',
      Number(response.status) || 502,
      { response: body },
    )
  }
  return body?.data
}

const createDurableSaleReceiptGatewayWorker = ({
  enabled = process.env.ALPHA_PRINT_BRIDGE_ENABLE_DURABLE_SALE_RECEIPT_WORKER === '1',
  serverBaseUrl = process.env.ALPHA_PRINT_BRIDGE_SERVER_BASE_URL || '',
  authorization = process.env.ALPHA_PRINT_BRIDGE_SERVER_AUTHORIZATION || '',
  gatewayId = process.env.ALPHA_PRINT_BRIDGE_GATEWAY_ID || '',
  credentialVersion = Number(process.env.ALPHA_PRINT_BRIDGE_GATEWAY_CREDENTIAL_VERSION || 1),
  printerProfileId = process.env.ALPHA_PRINT_BRIDGE_DURABLE_SALE_RECEIPT_PRINTER_ID || '',
  confirmation = process.env.ALPHA_PRINT_BRIDGE_DURABLE_SALE_RECEIPT_CONFIRMATION || '',
  pollIntervalMs = positiveInteger(process.env.ALPHA_PRINT_BRIDGE_DURABLE_SALE_RECEIPT_POLL_MS, 5000),
  leaseDurationMs = positiveInteger(process.env.ALPHA_PRINT_BRIDGE_DURABLE_SALE_RECEIPT_LEASE_MS, 15 * 60 * 1000),
  sessionDurationMs = positiveInteger(process.env.ALPHA_PRINT_BRIDGE_GATEWAY_SESSION_MS, 60 * 60 * 1000),
  fetchImpl = globalThis.fetch,
  runtime,
  gatewayClient = null,
  bootstrapSession = bootstrapStoreDeviceGatewaySession,
  setIntervalImpl = setInterval,
  clearIntervalImpl = clearInterval,
  now = () => new Date(),
  logger = console,
} = {}) => {
  if (!runtime || typeof runtime.execute !== 'function') {
    throw fail('PRINT_BRIDGE_DURABLE_RUNTIME_REQUIRED', 'Durable Sale Receipt runtime is required', 500)
  }
  if (typeof fetchImpl !== 'function') {
    throw fail('PRINT_BRIDGE_FETCH_REQUIRED', 'A fetch implementation is required', 500)
  }

  const normalizedBaseUrl = String(serverBaseUrl || '').trim().replace(/\/$/, '')
  const normalizedGatewayId = String(gatewayId || '').trim()
  const normalizedPrinterProfileId = String(printerProfileId || '').trim()
  const normalizedConfirmation = String(confirmation || '')
  const blockedJobIds = new Set()
  const inFlightJobIds = new Set()
  let authority = null
  let timer = null
  let ticking = false

  const requireConfigured = () => {
    if (!enabled) throw fail('DURABLE_SALE_RECEIPT_WORKER_DISABLED', 'Durable Sale Receipt gateway worker is disabled', 503)
    requiredText(normalizedBaseUrl, 'PRINT_BRIDGE_SERVER_BASE_URL_REQUIRED', 'serverBaseUrl')
    requiredText(normalizedGatewayId, 'PRINT_BRIDGE_GATEWAY_ID_REQUIRED', 'gatewayId')
    requiredText(normalizedPrinterProfileId, 'DURABLE_SALE_RECEIPT_PILOT_PRINTER_REQUIRED', 'printerProfileId')
    requiredText(normalizedConfirmation, 'DURABLE_SALE_RECEIPT_PILOT_CONFIRMATION_NOT_CONFIGURED', 'confirmation')
  }

  const headers = () => {
    const value = typeof authorization === 'string' ? authorization.trim() : ''
    return {
      Accept: 'application/json',
      ...(value ? { Authorization: value } : {}),
    }
  }

  const listJobs = async () => {
    const response = await fetchImpl(`${normalizedBaseUrl}/api/store-devices/jobs`, {
      method: 'GET',
      headers: headers(),
    })
    const jobs = await parseJsonResponse(response, 'PRINT_BRIDGE_JOB_LIST_FAILED')
    if (!Array.isArray(jobs)) {
      throw fail('PRINT_BRIDGE_JOB_LIST_INVALID', 'Store Device jobs response must be an array', 502)
    }
    return jobs
  }

  const selectJob = (jobs) => jobs.find((job) => {
    const purposeCode = String(job?.requestSnapshot?.documentPurpose?.code || job?.source || '').trim().toUpperCase()
    return job?.jobType === 'PRINT_DOCUMENT'
      && purposeCode === 'SALE_RECEIPT'
      && ['PENDING', 'LEASED'].includes(job?.status)
      && typeof job?.jobId === 'string'
      && !blockedJobIds.has(job.jobId)
      && !inFlightJobIds.has(job.jobId)
  }) || null

  const ensureAuthority = async () => {
    if (authority) return authority
    const client = gatewayClient || createStoreDeviceGatewaySessionClient({
      serverBaseUrl: normalizedBaseUrl,
      fetchImpl,
      getAuthorization: async () => authorization,
    })
    authority = await bootstrapSession({
      client,
      gatewayId: normalizedGatewayId,
      credentialVersion,
      capabilitiesSnapshot: {
        durablePrint: true,
        saleReceipt: true,
        browserPdf: true,
        sumatraPdf: true,
        worker: true,
      },
      platformSnapshot: {
        os: process.platform,
        node: process.version,
        computerName: process.env.COMPUTERNAME || null,
      },
      expiresAt: new Date(now().getTime() + sessionDurationMs).toISOString(),
    })
    return authority
  }

  const heartbeat = async () => {
    const current = await ensureAuthority()
    const client = gatewayClient || createStoreDeviceGatewaySessionClient({
      serverBaseUrl: normalizedBaseUrl,
      fetchImpl,
      getAuthorization: async () => authorization,
    })
    return client.heartbeat(current.authority)
  }

  const tick = async () => {
    requireConfigured()
    if (ticking) return { mode: 'SKIPPED_OVERLAPPING_TICK' }
    ticking = true
    try {
      const current = await ensureAuthority()
      await heartbeat()
      const jobs = await listJobs()
      const job = selectJob(jobs)
      if (!job) return { mode: 'NO_ELIGIBLE_JOB' }

      inFlightJobIds.add(job.jobId)
      try {
        const result = await runtime.execute({
          jobId: job.jobId,
          gatewayId: current.authority.gatewayId,
          sessionId: current.authority.sessionId,
          expiresAt: new Date(now().getTime() + leaseDurationMs).toISOString(),
          printerProfileId: normalizedPrinterProfileId,
          confirmation: normalizedConfirmation,
        })
        return { mode: 'EXECUTED', jobId: job.jobId, result }
      } catch (error) {
        if (error?.code === 'DURABLE_PRINT_COMPLETION_UNCONFIRMED') {
          blockedJobIds.add(job.jobId)
          logger.error?.('[local-print-bridge] completion unconfirmed; automatic physical retry blocked', {
            jobId: job.jobId,
            code: error.code,
          })
        }
        throw error
      } finally {
        inFlightJobIds.delete(job.jobId)
      }
    } finally {
      ticking = false
    }
  }

  const start = async () => {
    requireConfigured()
    await ensureAuthority()
    await heartbeat()
    if (!timer) {
      timer = setIntervalImpl(() => {
        tick().catch((error) => logger.error?.('[local-print-bridge] durable worker tick failed', {
          code: error?.code,
          message: error?.message,
        }))
      }, pollIntervalMs)
      timer?.unref?.()
    }
    return { enabled: true, gatewayId: authority.authority.gatewayId, sessionId: authority.authority.sessionId }
  }

  const stop = () => {
    if (timer) clearIntervalImpl(timer)
    timer = null
  }

  return Object.freeze({
    start,
    stop,
    tick,
    get readiness() {
      return Object.freeze({
        enabled,
        gatewayConfigured: Boolean(normalizedGatewayId),
        exactPrinterConfigured: Boolean(normalizedPrinterProfileId),
        serverBaseUrlConfigured: Boolean(normalizedBaseUrl),
        authorizationConfigured: Boolean(String(authorization || '').trim()),
        pollIntervalMs,
        leaseDurationMs,
        blockedJobIds: [...blockedJobIds],
      })
    },
  })
}

export { createDurableSaleReceiptGatewayWorker }
export default createDurableSaleReceiptGatewayWorker
