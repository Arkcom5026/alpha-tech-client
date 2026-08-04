import { createStoreDeviceGatewayContract } from './createStoreDeviceGatewayContract.js'

const createStoreDeviceGatewayRegistry = () => {
  const gateways = new Map()

  const register = (input) => {
    const gateway = createStoreDeviceGatewayContract(input)
    const existing = gateways.get(gateway.gatewayId)
    if (existing && existing.branchId !== gateway.branchId) {
      throw new Error('Gateway identity cannot be reassigned across branches')
    }
    gateways.set(gateway.gatewayId, gateway)
    return gateway
  }

  const get = ({ gatewayId, branchId }) => {
    const gateway = gateways.get(String(gatewayId || '')) || null
    if (!gateway) return null
    if (gateway.branchId !== Number(branchId)) return null
    return gateway
  }

  const listByBranch = (branchId) => [...gateways.values()]
    .filter((gateway) => gateway.branchId === Number(branchId))

  const replace = ({ gatewayId, branchId, changes }) => {
    const current = get({ gatewayId, branchId })
    if (!current) throw new Error('Gateway not found for branch')
    return register({ ...current, ...changes, gatewayId: current.gatewayId, branchId: current.branchId })
  }

  return Object.freeze({ register, get, listByBranch, replace })
}

export { createStoreDeviceGatewayRegistry }
export default createStoreDeviceGatewayRegistry
