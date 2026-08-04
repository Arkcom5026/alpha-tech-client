const DEVICE_TRANSPORTS = Object.freeze([
  'WINDOWS_RAW',
  'USB_ESC_POS',
  'TCP_ESC_POS',
  'WIFI_PRINTER',
  'BLUETOOTH_ESC_POS',
  'VENDOR_SDK',
  'SYSTEM_DRIVER',
  'PDF',
])

const DEVICE_STATES = Object.freeze([
  'OFFLINE',
  'ONLINE',
  'BUSY',
  'DEGRADED',
  'ERROR',
])

const assertDeviceAdapter = (adapter) => {
  if (!adapter || typeof adapter !== 'object') throw new TypeError('adapter is required')
  if (!DEVICE_TRANSPORTS.includes(adapter.transport)) {
    throw new TypeError(`Unsupported adapter transport: ${adapter.transport}`)
  }
  for (const method of ['discover', 'health', 'execute']) {
    if (typeof adapter[method] !== 'function') throw new TypeError(`adapter.${method} must be a function`)
  }
  return adapter
}

const createDeviceAdapterDescriptor = ({
  adapterId,
  transport,
  deviceTypes = [],
  capabilities = [],
}) => {
  if (!adapterId) throw new TypeError('adapterId is required')
  if (!DEVICE_TRANSPORTS.includes(transport)) throw new TypeError(`Unsupported transport: ${transport}`)
  return Object.freeze({
    adapterId: String(adapterId),
    transport,
    deviceTypes: Object.freeze([...deviceTypes]),
    capabilities: Object.freeze([...capabilities]),
  })
}

export {
  DEVICE_STATES,
  DEVICE_TRANSPORTS,
  assertDeviceAdapter,
  createDeviceAdapterDescriptor,
}
