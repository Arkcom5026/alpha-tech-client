import process from 'node:process'
import { createDurablePrintLeaseClient } from './durablePrintLeaseClient.js'
import { createDurablePrintExecutionCoordinator } from './durablePrintExecutionCoordinator.js'

const fail = (code, message, statusCode = 400, detail = undefined) =>
  Object.assign(new Error(message), { code, statusCode, detail })

const requiredText = (value, code, field) => {
  if (typeof value !== 'string' || !value.trim()) {
    throw fail(code, `${field} is required`)
  }
  return value.trim()
}

const createDurableSaleReceiptPilotRuntime = ({
  enabled = process.env.ALPHA_PRINT_BRIDGE_ENABLE_DURABLE_SALE_RECEIPT_PILOT === '1',
  allowedPrinterId = process.env.ALPHA_PRINT_BRIDGE_DURABLE_SALE_RECEIPT_PRINTER_ID || '',
  confirmationToken = process.env.ALPHA_PRINT_BRIDGE_DURABLE_SALE_RECEIPT_CONFIRMATION || '',
  serverBaseUrl = process.env.ALPHA_PRINT_BRIDGE_SERVER_BASE_URL || '',
  fetchImpl = globalThis.fetch,
  getAuthorization = null,
  localExecutor = null,
  leaseClient = null,
  coordinator = null,
  createResultId,
} = {}) => {
  const normalizedAllowedPrinterId = String(allowedPrinterId || '').trim()
  const normalizedConfirmationToken = String(confirmationToken || '')

  const requireEnabled = () => {
    if (!enabled) {
      throw fail(
        'DURABLE_SALE_RECEIPT_PILOT_DISABLED',
        'Durable Sale Receipt pilot is disabled',
        503,
      )
    }
    if (!normalizedAllowedPrinterId) {
      throw fail(
        'DURABLE_SALE_RECEIPT_PILOT_PRINTER_REQUIRED',
        'An exact printer id must be configured for the Durable Sale Receipt pilot',
        503,
      )
    }
    if (!normalizedConfirmationToken) {
      throw fail(
        'DURABLE_SALE_RECEIPT_PILOT_CONFIRMATION_NOT_CONFIGURED',
        'A confirmation token must be configured for the Durable Sale Receipt pilot',
        503,
      )
    }
  }

  // Keep the local discovery/driver bridge available without requiring
  // durable-server credentials. Durable clients are only valid when the
  // explicitly gated pilot is enabled.
  const resolvedLeaseClient = leaseClient || (enabled
    ? createDurablePrintLeaseClient({
      serverBaseUrl,
      fetchImpl,
      getAuthorization,
    })
    : null)

  const resolvedCoordinator = coordinator || (() => {
    if (!enabled || !localExecutor || typeof localExecutor.execute !== 'function') {
      return null
    }
    return createDurablePrintExecutionCoordinator({
      serverBaseUrl,
      fetchImpl,
      getAuthorization,
      localExecutor,
      createResultId,
    })
  })()

  return Object.freeze({
    enabled,
    allowedPrinterId: normalizedAllowedPrinterId || null,

    async execute({
      jobId,
      gatewayId,
      sessionId,
      expiresAt,
      printerProfileId,
      confirmation,
      executorOptions = {},
    }) {
      requireEnabled()

      const normalizedPrinterProfileId = requiredText(
        printerProfileId,
        'DURABLE_SALE_RECEIPT_PILOT_PRINTER_REQUIRED',
        'printerProfileId',
      )
      if (normalizedPrinterProfileId !== normalizedAllowedPrinterId) {
        throw fail(
          'DURABLE_SALE_RECEIPT_PILOT_PRINTER_NOT_AUTHORIZED',
          'Requested printer is not authorized for the Durable Sale Receipt pilot',
          403,
          {
            requestedPrinterId: normalizedPrinterProfileId,
            allowedPrinterId: normalizedAllowedPrinterId,
          },
        )
      }

      if (confirmation !== normalizedConfirmationToken) {
        throw fail(
          'DURABLE_SALE_RECEIPT_PILOT_CONFIRMATION_REQUIRED',
          'Durable Sale Receipt pilot confirmation token is invalid',
          403,
        )
      }

      if (!resolvedCoordinator || typeof resolvedCoordinator.execute !== 'function') {
        throw fail(
          'DURABLE_SALE_RECEIPT_LOCAL_EXECUTOR_UNAVAILABLE',
          'No certified local Sale Receipt executor is registered for the pilot runtime',
          503,
        )
      }

      const leaseContext = await resolvedLeaseClient.lease({
        jobId,
        gatewayId,
        sessionId,
        expiresAt,
      })

      const purposeCode = String(
        leaseContext?.executionEnvelope?.documentPurpose?.code || '',
      ).trim().toUpperCase()
      if (purposeCode !== 'SALE_RECEIPT') {
        throw fail(
          'DURABLE_SALE_RECEIPT_PURPOSE_REQUIRED',
          'Durable Sale Receipt pilot accepts SALE_RECEIPT jobs only',
          409,
          { documentPurposeCode: purposeCode || null },
        )
      }

      const result = await resolvedCoordinator.execute({
        leaseContext,
        executorOptions: {
          ...executorOptions,
          printerId: normalizedPrinterProfileId,
          printerProfileId: normalizedPrinterProfileId,
          expectedPrinterId: normalizedAllowedPrinterId,
          durableSaleReceiptPilot: true,
        },
      })

      return Object.freeze({
        mode: 'DURABLE_SALE_RECEIPT_PILOT',
        printerProfileId: normalizedPrinterProfileId,
        leaseContext,
        result,
        safety: Object.freeze({
          explicitPilotEnabled: true,
          exactPrinterMatchVerified: true,
          explicitConfirmationVerified: true,
          saleReceiptPurposeVerified: true,
          localExecutorRequired: true,
        }),
      })
    },
  })
}

export { createDurableSaleReceiptPilotRuntime }
export default createDurableSaleReceiptPilotRuntime
