import {
  PRINT_JOB_STATUSES,
  createPrintJobContract,
} from './createPrintJobContract'
import { createLocalPrintBridgeTransport } from './localPrintBridgeTransport'

const createJobId = () => {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID()
  }

  return `print-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

const isBridgeReady = (health) => (
  health?.ok === true || health?.status === 'ok'
)

const createPrintAuthorityService = ({
  transport = createLocalPrintBridgeTransport(),
  now = () => new Date().toISOString(),
  jobIdFactory = createJobId,
} = {}) => {
  const verifyBridge = async () => {
    const health = await transport.health()

    if (!isBridgeReady(health)) {
      throw new Error('Alpha-Tech Local Print Bridge is not ready')
    }

    return health
  }

  const dispatch = async (input) => {
    const printJob = createPrintJobContract({
      ...input,
      jobId: input.jobId || jobIdFactory(),
      requestedAt: input.requestedAt || now(),
    })

    const result = await transport.dispatchPrintJob(printJob)

    return Object.freeze({
      ...printJob,
      status: result?.status || PRINT_JOB_STATUSES.PRINTED,
      bridgeJobId: result?.bridgeJobId || printJob.jobId,
      printedAt: result?.printedAt || now(),
      printerName: result?.printerName || null,
    })
  }

  return Object.freeze({
    verifyBridge,
    listPrinters: () => transport.listPrinters(),
    dispatch,
  })
}

export { createPrintAuthorityService, isBridgeReady }
export default createPrintAuthorityService
