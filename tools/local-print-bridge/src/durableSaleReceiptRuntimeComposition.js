import process from 'node:process'
import { createDurableSaleReceiptLocalExecutor } from './durableSaleReceiptLocalExecutor.js'
import { createDurableSaleReceiptPilotRuntime } from './durableSaleReceiptPilotRuntime.js'
import { createSaleReceiptWindowsBrowserPdfRenderer } from './windowsBrowserPdfRenderer.js'
import { createSumatraPdfSaleReceiptSubmitter } from './sumatraPdfSaleReceiptSubmitter.js'

const createDurableSaleReceiptRuntimeComposition = ({
  resolvePrinter,
  env = process.env,
  fetchImpl = globalThis.fetch,
  renderer = null,
  submitter = null,
  localExecutor = null,
  leaseClient = null,
  coordinator = null,
  createResultId,
} = {}) => {
  if (typeof resolvePrinter !== 'function') {
    throw new TypeError('resolvePrinter is required')
  }

  const allowedPrinterId = String(env.ALPHA_PRINT_BRIDGE_DURABLE_SALE_RECEIPT_PRINTER_ID || '').trim()
  const physicalEnabled = env.ALPHA_PRINT_BRIDGE_ENABLE_DURABLE_SALE_RECEIPT === '1'
  const pilotEnabled = env.ALPHA_PRINT_BRIDGE_ENABLE_DURABLE_SALE_RECEIPT_PILOT === '1'

  const resolvedRenderer = renderer || createSaleReceiptWindowsBrowserPdfRenderer()
  const resolvedSubmitter = submitter || createSumatraPdfSaleReceiptSubmitter({
    enabled: physicalEnabled,
    allowedPrinterId,
    resolvePrinter,
  })
  const resolvedLocalExecutor = localExecutor || createDurableSaleReceiptLocalExecutor({
    renderer: resolvedRenderer,
    submitter: resolvedSubmitter,
  })

  const runtime = createDurableSaleReceiptPilotRuntime({
    enabled: pilotEnabled,
    allowedPrinterId,
    confirmationToken: env.ALPHA_PRINT_BRIDGE_DURABLE_SALE_RECEIPT_CONFIRMATION || '',
    serverBaseUrl: env.ALPHA_PRINT_BRIDGE_SERVER_BASE_URL || '',
    fetchImpl,
    getAuthorization: () => env.ALPHA_PRINT_BRIDGE_SERVER_AUTHORIZATION || '',
    localExecutor: resolvedLocalExecutor,
    leaseClient,
    coordinator,
    createResultId,
  })

  return Object.freeze({
    runtime,
    renderer: resolvedRenderer,
    submitter: resolvedSubmitter,
    localExecutor: resolvedLocalExecutor,
    readiness: Object.freeze({
      pilotEnabled,
      physicalSubmissionEnabled: physicalEnabled,
      exactPrinterConfigured: Boolean(allowedPrinterId),
      allowedPrinterId: allowedPrinterId || null,
      serverBaseUrlConfigured: Boolean(String(env.ALPHA_PRINT_BRIDGE_SERVER_BASE_URL || '').trim()),
      serverAuthorizationConfigured: Boolean(String(env.ALPHA_PRINT_BRIDGE_SERVER_AUTHORIZATION || '').trim()),
    }),
  })
}

export { createDurableSaleReceiptRuntimeComposition }
export default createDurableSaleReceiptRuntimeComposition
