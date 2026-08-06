const createRoutingError = (message, code, statusCode) => {
  const error = new Error(message)
  error.code = code
  error.statusCode = statusCode
  return error
}

const createPrintAdapterRouter = ({
  mockAdapter,
  rawAdapter,
  sharedQueueAdapter,
} = {}) => {
  if (!mockAdapter || typeof mockAdapter.print !== 'function') {
    throw new TypeError('mockAdapter is required')
  }
  if (!rawAdapter || typeof rawAdapter.print !== 'function') {
    throw new TypeError('rawAdapter is required')
  }
  if (!sharedQueueAdapter || typeof sharedQueueAdapter.print !== 'function') {
    throw new TypeError('sharedQueueAdapter is required')
  }

  const resolve = (printer) => {
    if (!printer) {
      throw createRoutingError('Printer is required', 'PRINTER_REQUIRED', 404)
    }

    if (printer.connection !== 'WINDOWS_QUEUE') return mockAdapter

    if (
      printer.queueAuthority === 'SHARED_CONNECTION' &&
      printer.isSharedConnection === true &&
      printer.capabilities?.driverManaged === true
    ) {
      return sharedQueueAdapter
    }

    if (printer.queueAuthority === 'LOCAL_QUEUE') return rawAdapter

    throw createRoutingError(
      `Unsupported Windows printer queue authority: ${printer.queueAuthority || 'UNKNOWN_QUEUE'}`,
      'WINDOWS_QUEUE_AUTHORITY_UNSUPPORTED',
      409
    )
  }

  return Object.freeze({ resolve })
}

export { createPrintAdapterRouter }
export default createPrintAdapterRouter
