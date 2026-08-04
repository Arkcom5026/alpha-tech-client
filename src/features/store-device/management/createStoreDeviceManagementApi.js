const SENSITIVE_KEY_PATTERN = /proof|credential|token|certificate|secret|privateKey/i

const sanitize = (value) => {
  if (Array.isArray(value)) return value.map(sanitize)
  if (!value || typeof value !== 'object') return value
  return Object.fromEntries(Object.entries(value)
    .filter(([key]) => !SENSITIVE_KEY_PATTERN.test(key))
    .map(([key, item]) => [key, sanitize(item)]))
}

const unavailable = (capability) => {
  const error = new Error(`${capability} is not available in the durable Store Device API yet`)
  error.code = 'STORE_DEVICE_CAPABILITY_NOT_AVAILABLE'
  error.capability = capability
  throw error
}

export const createStoreDeviceManagementApi = ({ http }) => {
  if (!http) throw new TypeError('http is required')

  const path = (suffix = '') => `/api/store-devices${suffix}`

  return Object.freeze({
    async overview() {
      const [diagnostics, jobs] = await Promise.all([
        http.get(path('/diagnostics')),
        http.get(path('/jobs')),
      ])
      return sanitize({ diagnostics, jobs })
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
      return sanitize(await http.post(
        path(`/gateways/${encodeURIComponent(gatewayId)}/rotate`),
        { credentialVersion },
      ))
    },

    async revokeGateway({ gatewayId, confirmation }) {
      if (confirmation !== 'REVOKE') {
        const error = new Error('explicit revoke confirmation required')
        error.code = 'STORE_DEVICE_REVOKE_CONFIRMATION_REQUIRED'
        throw error
      }
      return sanitize(await http.post(
        path(`/gateways/${encodeURIComponent(gatewayId)}/revoke`),
        { confirmation },
      ))
    },

    detailDevice() {
      return unavailable('DEVICE_DETAIL')
    },

    assignWorkstation() {
      return unavailable('WORKSTATION_ASSIGNMENT')
    },
  })
}

export default createStoreDeviceManagementApi
