const FORBIDDEN_KEYS = new Set(['proofKey', 'credential', 'token', 'certificate', 'secret'])

const sanitize = (value) => {
  if (Array.isArray(value)) return value.map(sanitize)
  if (!value || typeof value !== 'object') return value
  return Object.fromEntries(Object.entries(value)
    .filter(([key]) => !FORBIDDEN_KEYS.has(key))
    .map(([key, item]) => [key, sanitize(item)]))
}

export const createStoreDeviceManagementApi = ({ http, getBranchId }) => {
  if (!http || typeof getBranchId !== 'function') throw new TypeError('http and getBranchId are required')

  const branchPath = (suffix = '') => `/api/store-device/branches/${getBranchId()}${suffix}`

  return {
    async list() {
      return sanitize(await http.get(branchPath('/overview')))
    },
    async detail(deviceId) {
      return sanitize(await http.get(branchPath(`/devices/${encodeURIComponent(deviceId)}`)))
    },
    async assignWorkstation({ deviceId, workstationId }) {
      return sanitize(await http.post(branchPath(`/devices/${encodeURIComponent(deviceId)}/workstation`), { workstationId }))
    },
    async revokeGateway({ gatewayId, confirmation }) {
      if (confirmation !== 'REVOKE') {
        const error = new Error('explicit revoke confirmation required')
        error.code = 'STORE_DEVICE_REVOKE_CONFIRMATION_REQUIRED'
        throw error
      }
      return sanitize(await http.post(branchPath(`/gateways/${encodeURIComponent(gatewayId)}/revoke`), { confirmation }))
    },
  }
}

export default createStoreDeviceManagementApi
