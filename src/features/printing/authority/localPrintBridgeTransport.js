const DEFAULT_LOCAL_PRINT_BRIDGE_URL = 'http://127.0.0.1:17451'
const DEFAULT_REQUEST_TIMEOUT_MS = 5000

class LocalPrintBridgeUnavailableError extends Error {
  constructor(message, cause) {
    super(message)
    this.name = 'LocalPrintBridgeUnavailableError'
    this.cause = cause
  }
}

const withTimeout = async (promise, timeoutMs) => {
  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs)

  try {
    return await promise(controller.signal)
  } finally {
    window.clearTimeout(timeoutId)
  }
}

const createLocalPrintBridgeTransport = ({
  baseUrl = DEFAULT_LOCAL_PRINT_BRIDGE_URL,
  timeoutMs = DEFAULT_REQUEST_TIMEOUT_MS,
  fetchImpl = globalThis.fetch,
} = {}) => {
  if (typeof fetchImpl !== 'function') {
    throw new TypeError('fetchImpl must be a function')
  }

  const request = async (path, init = {}) => {
    try {
      const response = await withTimeout(
        (signal) => fetchImpl(`${baseUrl}${path}`, {
          ...init,
          signal,
          headers: {
            'Content-Type': 'application/json',
            ...(init.headers || {}),
          },
        }),
        timeoutMs
      )

      const payload = await response.json().catch(() => null)

      if (!response.ok) {
        const message = payload?.message || `Local print bridge returned ${response.status}`
        throw new Error(message)
      }

      return payload
    } catch (error) {
      throw new LocalPrintBridgeUnavailableError(
        'ไม่สามารถเชื่อมต่อ Alpha-Tech Local Print Bridge ได้',
        error
      )
    }
  }

  return Object.freeze({
    health: () => request('/health'),
    listPrinters: () => request('/v1/printers'),
    dispatchPrintJob: (printJob) => request('/v1/print-jobs', {
      method: 'POST',
      body: JSON.stringify(printJob),
    }),
  })
}

export {
  DEFAULT_LOCAL_PRINT_BRIDGE_URL,
  LocalPrintBridgeUnavailableError,
  createLocalPrintBridgeTransport,
}

export default createLocalPrintBridgeTransport
