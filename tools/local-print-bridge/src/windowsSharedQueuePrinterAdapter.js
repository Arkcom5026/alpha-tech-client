const createAdapterError = (message, code, statusCode) => {
  const error = new Error(message)
  error.code = code
  error.statusCode = statusCode
  return error
}

const createWindowsSharedQueuePrinterAdapter = ({
  spoolPrintImpl,
  now = () => new Date(),
} = {}) => {
  if (typeof spoolPrintImpl !== 'function') {
    throw new TypeError('spoolPrintImpl is required')
  }

  const print = async ({ printer, printJob }) => {
    if (!printer || printer.connection !== 'WINDOWS_QUEUE') {
      throw createAdapterError(
        'Windows printer queue is required',
        'WINDOWS_QUEUE_REQUIRED',
        409
      )
    }

    if (
      printer.queueAuthority !== 'SHARED_CONNECTION' ||
      printer.isSharedConnection !== true ||
      printer.capabilities?.driverManaged !== true
    ) {
      throw createAdapterError(
        'Driver-managed shared queue authority is required',
        'SHARED_QUEUE_AUTHORITY_REQUIRED',
        409
      )
    }

    if (!printer.isOnline || printer.workOffline) {
      throw createAdapterError(
        `Shared printer is offline: ${printer.id || 'unknown'}`,
        'SHARED_QUEUE_OFFLINE',
        503
      )
    }

    const printerName = String(printer.name || '').trim()
    if (!printerName) throw new TypeError('printer name is required')

    const spool = await spoolPrintImpl({
      printerName,
      documentName: printJob.jobId,
      printJob,
    })

    return Object.freeze({
      jobId: printJob.jobId,
      printerId: printer.id,
      status: 'PRINTED',
      printedAt: now().toISOString(),
      adapter: 'WINDOWS_SHARED_QUEUE_DRIVER',
      driverManaged: true,
      capabilitiesUsed: Object.freeze({
        raw: false,
        cut: false,
        cashDrawer: false,
      }),
      spool: spool && typeof spool === 'object'
        ? Object.freeze({ ...spool })
        : Object.freeze({}),
    })
  }

  return Object.freeze({
    name: 'WINDOWS_SHARED_QUEUE_DRIVER',
    print,
  })
}

export { createWindowsSharedQueuePrinterAdapter }
export default createWindowsSharedQueuePrinterAdapter
