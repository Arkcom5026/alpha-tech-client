const SENSITIVE_KEY_PATTERN = /proof|credential|token|certificate|secret|privateKey/i

const sanitize = (value) => {
  if (Array.isArray(value)) return value.map(sanitize)
  if (!value || typeof value !== 'object') return value
  return Object.fromEntries(Object.entries(value)
    .filter(([key]) => !SENSITIVE_KEY_PATTERN.test(key))
    .map(([key, item]) => [key, sanitize(item)]))
}

export const createStoreDeviceManagementApi = ({ http }) => {
  if (!http) throw new TypeError('http is required')

  const path = (suffix = '') => `/api/store-devices${suffix}`

  return Object.freeze({
    async overview() {
      const [diagnostics, jobs, devices] = await Promise.all([
        http.get(path('/diagnostics')),
        http.get(path('/jobs')),
        http.get(path('/devices')),
      ])
      return sanitize({ diagnostics, jobs, devices })
    },

    async listDevices() {
      return sanitize(await http.get(path('/devices')))
    },

    async detailDevice(deviceId) {
      return sanitize(await http.get(path(`/devices/${encodeURIComponent(deviceId)}`)))
    },

    async registerDevice(payload) {
      return sanitize(await http.post(path('/devices'), payload))
    },

    async renameDevice({ deviceId, name }) {
      return sanitize(await http.post(path(`/devices/${encodeURIComponent(deviceId)}/rename`), { name }))
    },

    async assignWorkstation({ deviceId, workstationId }) {
      return sanitize(await http.post(path(`/devices/${encodeURIComponent(deviceId)}/workstation`), { workstationId }))
    },

    async revokeDevice({ deviceId, confirmation }) {
      if (confirmation !== 'REVOKE') {
        const error = new Error('explicit device revoke confirmation required')
        error.code = 'STORE_DEVICE_REVOKE_CONFIRMATION_REQUIRED'
        throw error
      }
      return sanitize(await http.post(path(`/devices/${encodeURIComponent(deviceId)}/revoke`), { confirmation }))
    },

    async listJobs() {
      return sanitize(await http.get(path('/jobs')))
    },

    async getJob(jobId) {
      return sanitize(await http.get(path(`/jobs/${encodeURIComponent(jobId)}`)))
    },

    async registerGateway(payload) {
      return sanitize(await http.post(path('/gateways'), payload))
    },

    async rotateGateway({ gatewayId, credentialVersion }) {
      return sanitize(await http.post(path(`/gateways/${encodeURIComponent(gatewayId)}/rotate`), { credentialVersion }))
    },

    async revokeGateway({ gatewayId, confirmation }) {
      if (confirmation !== 'REVOKE') {
        const error = new Error('explicit revoke confirmation required')
        error.code = 'STORE_DEVICE_REVOKE_CONFIRMATION_REQUIRED'
        throw error
      }
      return sanitize(await http.post(path(`/gateways/${encodeURIComponent(gatewayId)}/revoke`), { confirmation }))
    },
  })
}

export default createStoreDeviceManagementApi
