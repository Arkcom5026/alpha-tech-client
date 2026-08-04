const ADAPTER_KINDS = Object.freeze(['ESC_POS','WINDOWS_QUEUE','RAW_TCP','USB','BLUETOOTH','WIFI'])

const normalizeCapabilities = (capabilities = {}) => Object.freeze({
  print: capabilities.print === true,
  cut: capabilities.cut === true,
  cashDrawer: capabilities.cashDrawer === true,
  scan: capabilities.scan === true,
  status: capabilities.status === true,
})

const createStoreDeviceAdapterRegistry = () => {
  const adapters = new Map()

  const register = ({ id, kind, branchId, capabilities, discover, execute }) => {
    if (!id) throw new TypeError('adapter id is required')
    if (!ADAPTER_KINDS.includes(kind)) throw new TypeError('unsupported adapter kind')
    if (!Number.isInteger(branchId) || branchId <= 0) throw new TypeError('branchId must be a positive integer')
    if (typeof discover !== 'function' || typeof execute !== 'function') throw new TypeError('discover and execute are required')
    if (adapters.has(id)) throw new Error('adapter id already registered')

    const adapter = Object.freeze({ id, kind, branchId, capabilities: normalizeCapabilities(capabilities), discover, execute })
    adapters.set(id, adapter)
    return adapter
  }

  const get = ({ id, branchId }) => {
    const adapter = adapters.get(id)
    if (!adapter || adapter.branchId !== branchId) return null
    return adapter
  }

  const discover = async ({ id, branchId }) => {
    const adapter = get({ id, branchId })
    if (!adapter) throw Object.assign(new Error('adapter not found for branch'), { code: 'STORE_DEVICE_ADAPTER_NOT_FOUND' })
    return adapter.discover()
  }

  const execute = async ({ id, branchId, capability, job }) => {
    const adapter = get({ id, branchId })
    if (!adapter) throw Object.assign(new Error('adapter not found for branch'), { code: 'STORE_DEVICE_ADAPTER_NOT_FOUND' })
    if (adapter.capabilities[capability] !== true) throw Object.assign(new Error('unsupported adapter capability'), { code: 'STORE_DEVICE_CAPABILITY_UNSUPPORTED' })
    const result = await adapter.execute(Object.freeze({ ...job, branchId }))
    return Object.freeze({ adapterId: id, branchId, capability, ...result })
  }

  return Object.freeze({ register, get, discover, execute })
}

export { ADAPTER_KINDS, createStoreDeviceAdapterRegistry, normalizeCapabilities }
export default createStoreDeviceAdapterRegistry
