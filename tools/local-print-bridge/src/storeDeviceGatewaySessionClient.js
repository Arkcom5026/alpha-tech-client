const fail = (code, message, statusCode = 400, detail = undefined) =>
  Object.assign(new Error(message), { code, statusCode, detail })

const requiredText = (value, code, field) => {
  if (typeof value !== 'string' || !value.trim()) {
    throw fail(code, `${field} is required`)
  }
  return value.trim()
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

const parseJsonResponse = async (response, fallbackCode) => {
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
      body?.code || fallbackCode,
      body?.error || body?.message || 'Store Device gateway request failed',
      Number(response.status) || 502,
      { response: body },
    )
  }

  return body?.data
}

const createHeaders = async (getAuthorization) => {
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
  return headers
}

const createStoreDeviceGatewaySessionClient = ({
  serverBaseUrl,
  fetchImpl = globalThis.fetch,
  getAuthorization = null,
} = {}) => {
  const baseUrl = normalizeBaseUrl(serverBaseUrl)
  if (typeof fetchImpl !== 'function') {
    throw fail('PRINT_BRIDGE_FETCH_REQUIRED', 'A fetch implementation is required', 500)
  }
  if (getAuthorization !== null && typeof getAuthorization !== 'function') {
    throw fail(
      'PRINT_BRIDGE_AUTHORIZATION_PROVIDER_INVALID',
      'getAuthorization must be a function when provided',
      500,
    )
  }

  const post = async (path, body, fallbackCode) => {
    const response = await fetchImpl(`${baseUrl}${path}`, {
      method: 'POST',
      headers: await createHeaders(getAuthorization),
      body: JSON.stringify(body || {}),
    })
    return parseJsonResponse(response, fallbackCode)
  }

  return Object.freeze({
    async register({
      gatewayId,
      credentialVersion = 1,
      capabilitiesSnapshot = null,
      platformSnapshot = null,
    }) {
      const normalizedGatewayId = requiredText(
        gatewayId,
        'PRINT_BRIDGE_GATEWAY_ID_REQUIRED',
        'gatewayId',
      )
      const normalizedCredentialVersion = Number(credentialVersion)
      if (!Number.isInteger(normalizedCredentialVersion) || normalizedCredentialVersion <= 0) {
        throw fail(
          'PRINT_BRIDGE_GATEWAY_CREDENTIAL_VERSION_INVALID',
          'credentialVersion must be a positive integer',
        )
      }
      const gateway = await post(
        '/api/store-devices/gateways',
        {
          gatewayId: normalizedGatewayId,
          credentialVersion: normalizedCredentialVersion,
          capabilitiesSnapshot,
          platformSnapshot,
        },
        'PRINT_BRIDGE_GATEWAY_REGISTER_FAILED',
      )
      if (gateway?.gatewayId !== normalizedGatewayId) {
        throw fail(
          'PRINT_BRIDGE_GATEWAY_RESPONSE_MISMATCH',
          'Registered gateway does not match requested gatewayId',
          502,
        )
      }
      return gateway
    },

    async authenticate({ gatewayId, challengeId = null, expiresAt = null }) {
      const normalizedGatewayId = requiredText(
        gatewayId,
        'PRINT_BRIDGE_GATEWAY_ID_REQUIRED',
        'gatewayId',
      )
      const session = await post(
        `/api/store-devices/gateways/${encodeURIComponent(normalizedGatewayId)}/sessions`,
        { challengeId, expiresAt },
        'PRINT_BRIDGE_GATEWAY_AUTHENTICATE_FAILED',
      )
      if (typeof session?.sessionId !== 'string' || !session.sessionId.trim()) {
        throw fail(
          'PRINT_BRIDGE_GATEWAY_SESSION_INVALID',
          'Authenticated gateway response is missing sessionId',
          502,
        )
      }
      return session
    },

    async heartbeat({ gatewayId, sessionId }) {
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
      const result = await post(
        `/api/store-devices/gateways/${encodeURIComponent(normalizedGatewayId)}/sessions/${encodeURIComponent(normalizedSessionId)}/heartbeat`,
        {},
        'PRINT_BRIDGE_GATEWAY_HEARTBEAT_FAILED',
      )
      if (
        result?.gatewayId !== normalizedGatewayId
        || result?.sessionId !== normalizedSessionId
      ) {
        throw fail(
          'PRINT_BRIDGE_GATEWAY_HEARTBEAT_MISMATCH',
          'Heartbeat response is not bound to the requested gateway session',
          502,
        )
      }
      return result
    },
  })
}

const bootstrapStoreDeviceGatewaySession = async ({
  client,
  gatewayId,
  credentialVersion = 1,
  capabilitiesSnapshot = null,
  platformSnapshot = null,
  challengeId = null,
  expiresAt = null,
} = {}) => {
  if (!client || typeof client.register !== 'function' || typeof client.authenticate !== 'function') {
    throw fail(
      'PRINT_BRIDGE_GATEWAY_CLIENT_REQUIRED',
      'A Store Device gateway session client is required',
      500,
    )
  }

  const gateway = await client.register({
    gatewayId,
    credentialVersion,
    capabilitiesSnapshot,
    platformSnapshot,
  })
  const session = await client.authenticate({
    gatewayId: gateway.gatewayId,
    challengeId,
    expiresAt,
  })
  const heartbeat = typeof client.heartbeat === 'function'
    ? await client.heartbeat({ gatewayId: gateway.gatewayId, sessionId: session.sessionId })
    : null

  return Object.freeze({
    gateway,
    session,
    heartbeat,
    authority: Object.freeze({
      gatewayId: gateway.gatewayId,
      sessionId: session.sessionId,
    }),
  })
}

export {
  bootstrapStoreDeviceGatewaySession,
  createStoreDeviceGatewaySessionClient,
}
