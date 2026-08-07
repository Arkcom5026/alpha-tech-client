const fail = (code, message, statusCode = 400, detail = undefined) =>
  Object.assign(new Error(message), { code, statusCode, detail })

const requiredText = (value, code, field) => {
  if (typeof value !== 'string' || !value.trim()) {
    throw fail(code, `${field} is required`)
  }
  return value.trim()
}

const positiveInteger = (value, code, field) => {
  const normalized = Number(value)
  if (!Number.isInteger(normalized) || normalized <= 0) {
    throw fail(code, `${field} must be a positive integer`)
  }
  return normalized
}

const normalizeBaseUrl = (value) => {
  const raw = requiredText(
    value,
    'PRINT_BRIDGE_SERVER_BASE_URL_REQUIRED',
    'serverBaseUrl',
  )
  let url
  try {
    url = new URL(raw)
  } catch (error) {
    throw fail(
      'PRINT_BRIDGE_SERVER_BASE_URL_INVALID',
      'serverBaseUrl must be a valid http(s) URL',
      400,
      { cause: error.message },
    )
  }
  if (!['http:', 'https:'].includes(url.protocol)) {
    throw fail(
      'PRINT_BRIDGE_SERVER_BASE_URL_INVALID',
      'serverBaseUrl must use http or https',
    )
  }
  return url.toString().replace(/\/$/, '')
}

const assertExecutionEnvelope = (envelope) => {
  if (
    envelope?.schemaVersion !== 1
    || typeof envelope?.job?.jobId !== 'string'
    || !envelope.job.jobId.trim()
    || envelope?.job?.jobType !== 'PRINT_DOCUMENT'
    || typeof envelope?.lease?.leaseId !== 'string'
    || !envelope.lease.leaseId.trim()
    || !Number.isInteger(Number(envelope?.lease?.attemptNumber))
    || Number(envelope.lease.attemptNumber) <= 0
    || typeof envelope?.lease?.expiresAt !== 'string'
    || !envelope.lease.expiresAt.trim()
    || typeof envelope?.documentPurpose?.code !== 'string'
    || !envelope.documentPurpose.code.trim()
    || typeof envelope?.source?.type !== 'string'
    || !envelope.source.type.trim()
    || !Number.isInteger(Number(envelope?.source?.id))
    || Number(envelope.source.id) <= 0
    || !Number.isInteger(Number(envelope?.print?.copies))
    || Number(envelope.print.copies) <= 0
    || !envelope?.projection
  ) {
    throw fail(
      'PRINT_BRIDGE_EXECUTION_ENVELOPE_INVALID',
      'Server returned an invalid durable print execution envelope',
      502,
    )
  }
  return envelope
}

const parseJsonResponse = async (response) => {
  let body
  try {
    body = await response.json()
  } catch (_error) {
    throw fail(
      'PRINT_BRIDGE_SERVER_RESPONSE_INVALID',
      'Store Device API returned a non-JSON response',
      502,
    )
  }

  if (!response.ok) {
    throw fail(
      body?.code || 'PRINT_BRIDGE_LEASE_REQUEST_FAILED',
      body?.error || body?.message || 'Durable print lease request failed',
      Number(response.status) || 502,
      { response: body },
    )
  }

  return body
}

const createDurablePrintLeaseClient = ({
  serverBaseUrl,
  fetchImpl = globalThis.fetch,
  getAuthorization = null,
} = {}) => {
  const baseUrl = normalizeBaseUrl(serverBaseUrl)
  if (typeof fetchImpl !== 'function') {
    throw fail(
      'PRINT_BRIDGE_FETCH_REQUIRED',
      'A fetch implementation is required for durable print lease requests',
      500,
    )
  }
  if (getAuthorization !== null && typeof getAuthorization !== 'function') {
    throw fail(
      'PRINT_BRIDGE_AUTHORIZATION_PROVIDER_INVALID',
      'getAuthorization must be a function when provided',
      500,
    )
  }

  return Object.freeze({
    async lease({ jobId, gatewayId, sessionId, expiresAt }) {
      const normalizedJobId = requiredText(
        jobId,
        'PRINT_BRIDGE_JOB_ID_REQUIRED',
        'jobId',
      )
      const normalizedGatewayId = requiredText(
        gatewayId,
        'PRINT_BRIDGE_GATEWAY_ID_REQUIRED',
        'gatewayId',
      )
      const normalizedSessionId = requiredText(
        sessionId,
        'PRINT_BRIDGE_SESSION_ID_REQUIRED',
        'sessionId',
      )
      const normalizedExpiresAt = requiredText(
        expiresAt,
        'PRINT_BRIDGE_LEASE_EXPIRY_REQUIRED',
        'expiresAt',
      )
      if (!Number.isFinite(Date.parse(normalizedExpiresAt))) {
        throw fail(
          'PRINT_BRIDGE_LEASE_EXPIRY_INVALID',
          'expiresAt must be a valid date-time value',
        )
      }

      const headers = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      }
      if (getAuthorization) {
        const authorization = await getAuthorization()
        if (typeof authorization === 'string' && authorization.trim()) {
          headers.Authorization = authorization.trim()
        }
      }

      const response = await fetchImpl(
        `${baseUrl}/api/store-devices/print/jobs/${encodeURIComponent(normalizedJobId)}/leases`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({
            gatewayId: normalizedGatewayId,
            sessionId: normalizedSessionId,
            expiresAt: normalizedExpiresAt,
          }),
        },
      )

      const payload = await parseJsonResponse(response)
      const lease = payload?.data?.lease
      const executionEnvelope = assertExecutionEnvelope(payload?.data?.executionEnvelope)

      if (
        typeof lease?.leaseId !== 'string'
        || !lease.leaseId.trim()
        || lease.leaseId !== executionEnvelope.lease.leaseId
        || executionEnvelope.job.jobId !== normalizedJobId
      ) {
        throw fail(
          'PRINT_BRIDGE_LEASE_RESPONSE_MISMATCH',
          'Durable print lease response is not bound to the requested job and lease',
          502,
        )
      }

      return Object.freeze({
        lease,
        executionEnvelope,
        authority: Object.freeze({
          serverBaseUrl: baseUrl,
          jobId: normalizedJobId,
          gatewayId: normalizedGatewayId,
          sessionId: normalizedSessionId,
        }),
      })
    },
  })
}

export {
  assertExecutionEnvelope,
  createDurablePrintLeaseClient,
  positiveInteger,
}
