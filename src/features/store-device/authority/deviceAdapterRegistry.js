import { assertDeviceAdapter } from './deviceAdapterContract.js'

const createDeviceAdapterRegistry = () => {
  const adapters = new Map()

  return Object.freeze({
    register(adapter) {
      const valid = assertDeviceAdapter(adapter)
      if (adapters.has(valid.transport)) throw new Error(`Adapter already registered: ${valid.transport}`)
      adapters.set(valid.transport, valid)
      return valid
    },
    get(transport) {
      return adapters.get(transport) || null
    },
    list() {
      return [...adapters.values()]
    },
    async discoverAll(context) {
      const results = []
      for (const adapter of adapters.values()) {
        const devices = await adapter.discover(context)
        results.push({ transport: adapter.transport, devices: devices || [] })
      }
      return results
    },
  })
}

export { createDeviceAdapterRegistry }
export default createDeviceAdapterRegistry
