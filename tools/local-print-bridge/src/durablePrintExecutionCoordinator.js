import crypto from 'node:crypto'
import { assertExecutionEnvelope } from './durablePrintLeaseClient.js'

const fail = (code, message, statusCode = 400, detail = undefined) =>
  Object.assign(new Error(message), { code, statusCode, detail })

const requiredText = (value, code, field) => {
  if (typeof value !== 'string' || !value.trim()) {
    throw fail(code, `${field} is required`)
  }
  return value.trim()
}

const normalizeBaseUrl = (value) => {
  const raw = requiredText(value, 'PRINT_BRIDGE_SERVER_BASE_URL_REQUIRED', 'serverBaseUrl')
  let url
  try {
    url = new URL(raw)
  } catch (error) {
    throw fail('PRINT_BRIDGE_SERVER_BASE_URL_INVALID', 'serverBaseUrl must be a valid http(s) URL', 400, { cause: error.message })
  }
  if (!['http:', 'https:'].includes(url.protocol)) {
    throw fail('PRINT_BRIDGE_SERVER_BASE_URL_INVALID', 'serverBaseUrl must use http or https')
  }
  return url.toString().replace(/\/$/, '')
}

const parseJsonResponse = async (response, fallbackCode, fallbackMessage) => {
  let body
  try {
    body = await response.json()
  } catch (_error) {
    throw fail('PRINT_BRIDGE_SERVER_RESPONSE_INVALID', 'Store Device API returned a non-JSON response', 502)
  }
  if (!response.ok) {
    throw fail(
      body?.code || fallbackCode,
      body?.error || body?.message || fallbackMessage,
      Number(response.status) || 502,
      { response: body },
    )
  }
  return body
}

const assertLeaseContext = (leaseContext) => {
  const envelope = assertExecutionEnvelope(leaseContext?.executionEnvelope)
  if (
    typeof leaseContext?.lease?.leaseId !== 'string'
    || !leaseContext.lease.leaseId.trim()
    || leaseContext.lease.leaseId !== envelope.lease.leaseId
    || typeof leaseContext?.authority?.gatewayId !== 'string'
    || !leaseContext.authority.gatewayId.trim()
    || typeof leaseContext?.authority?.sessionId !== 'string'
    || !leaseContext.authority.sessionId.trim()
  ) {
    throw fail(
      'PRINT_BRIDGE_LEASE_CONTEXT_INVALID',
      'A certified durable lease context is required before local print execution',
      409,
    )
  }
  return { leaseContext, envelope }
}

const assertLocalExecutionResult = (result) => {
  if (
    result?.schemaVersion !== 1
    || result?.status !== 'SUCCEEDED'
    || typeof result?.adapter !== 'string'
    || !result.adapter.trim()
    || !Number.isFinite(Number(result?.durationMs))
    || Number(result.durationMs) < 0
  ) {
    throw fail(
      'PRINT_BRIDGE_LOCAL_EXECUTION_RESULT_INVALID',
      'Local print executor returned an invalid durable execution result',
      502,
    )
  }
  return result
}

const createDurablePrintExecutionCoordinator = ({
  serverBaseUrl,
  fetchImpl = globalThis.fetch,
  getAuthorization = null,
  localExecutor,
  createResultId = () => `print-result-${crypto.randomUUID()}`,
} = {}) => {
  const baseUrl = normalizeBaseUrl(serverBaseUrl)
  if (typeof fetchImpl !== 'function') {
    throw fail('PRINT_BRIDGE_FETCH_REQUIRED', 'A fetch implementation is required', 500)
  }
  if (!localExecutor || typeof localExecutor.execute !== 'function') {
    throw fail('PRINT_BRIDGE_LOCAL_EXECUTOR_REQUIRED', 'A local print executor is required', 500)
  }
  if (getAuthorization !== null && typeof getAuthorization !== 'function') {
    throw fail('PRINT_BRIDGE_AUTHORIZATION_PROVIDER_INVALID', 'getAuthorization must be a function when provided', 500)
  }
  if (typeof createResultId !== 'function') {
    throw fail('PRINT_BRIDGE_RESULT_ID_FACTORY_INVALID', 'createResultId must be a function', 500)
  }

  const headers = async () => {
    const output = { 'Content-Type': 'application/json', Accept: 'application/json' }
    if (getAuthorization) {
      const authorization = await getAuthorization()
      if (typeof authorization === 'string' && authorization.trim()) {
        output.Authorization = authorization.trim()
      }
    }
    return output
  }

  const postLeaseAction = async ({ leaseId, action, body, fallbackCode, fallbackMessage }) => {
    const response = await fetchImpl(
      `${baseUrl}/api/store-devices/print/leases/${encodeURIComponent(leaseId)}/${action}`,
      { method: 'POST', headers: await headers(), body: JSON.stringify(body) },
    )
    return parseJsonResponse(response, fallbackCode, fallbackMessage)
  }

  return Object.freeze({
    async execute({ leaseContext, executorOptions = {} }) {
      const { envelope } = assertLeaseContext(leaseContext)
      const leaseId = envelope.lease.leaseId
      const gatewayId = leaseContext.authority.gatewayId.trim()
      const sessionId = leaseContext.authority.sessionId.trim()
      const resultId = requiredText(
        createResultId(),
        'PRINT_BRIDGE_RESULT_ID_REQUIRED',
        'resultId',
      )

      await postLeaseAction({
        leaseId,
        action: 'acknowledge',
        body: { gatewayId, sessionId },
        fallbackCode: 'PRINT_BRIDGE_ACKNOWLEDGE_FAILED',
        fallbackMessage: 'Durable print lease acknowledgement failed',
      })

      try {
        const executionResult = assertLocalExecutionResult(
          await localExecutor.execute(envelope, executorOptions),
        )

        const completion = await postLeaseAction({
          leaseId,
          action: 'complete',
          body: {
            gatewayId,
            sessionId,
            resultId,
            executionSnapshot: executionResult,
            adapterEvidence: {
              adapter: executionResult.adapter,
              evidence: executionResult.evidence || null,
            },
            transportEvidence: executionResult.evidence?.transport || null,
          },
          fallbackCode: 'PRINT_BRIDGE_COMPLETE_FAILED',
          fallbackMessage: 'Durable print lease completion failed',
        })

        return Object.freeze({
          lifecycleStatus: 'SUCCEEDED',
          resultId,
          executionResult,
          completion,
        })
      } catch (error) {
        const failureSnapshot = Object.freeze({
          schemaVersion: 1,
          adapter: error?.adapter || 'LOCAL_PRINT_EXECUTOR',
          status: 'FAILED',
          durationMs: 0,
          evidence: null,
          error: Object.freeze({
            code: error?.code || 'PRINT_BRIDGE_LOCAL_EXECUTION_FAILED',
            message: error?.message || 'Local print execution failed',
          }),
        })

        const failure = await postLeaseAction({
          leaseId,
          action: 'fail',
          body: {
            gatewayId,
            sessionId,
            resultId,
            executionSnapshot: failureSnapshot,
            adapterEvidence: {
              adapter: failureSnapshot.adapter,
              evidence: null,
            },
            errorMetadata: {
              code: failureSnapshot.error.code,
              message: failureSnapshot.error.message,
            },
          },
          fallbackCode: 'PRINT_BRIDGE_FAIL_REPORT_FAILED',
          fallbackMessage: 'Durable print lease failure reporting failed',
        })

        return Object.freeze({
          lifecycleStatus: 'FAILED',
          resultId,
          executionResult: failureSnapshot,
          failure,
        })
      }
    },
  })
}

export { createDurablePrintExecutionCoordinator }
