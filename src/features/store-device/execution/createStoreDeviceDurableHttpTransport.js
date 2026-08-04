const unwrap = (response) => response?.data ?? response

export const createStoreDeviceDurableHttpTransport = ({ http }) => {
  if (!http) throw new TypeError('http is required')
  const base = '/api/store-devices'

  return Object.freeze({
    async list() {
      return unwrap(await http.get(`${base}/jobs`))
    },

    async createJob(payload) {
      return unwrap(await http.post(`${base}/jobs`, payload))
    },

    async lease({ jobId, gatewayId, sessionId, expiresAt }) {
      return unwrap(await http.post(`${base}/jobs/${encodeURIComponent(jobId)}/leases`, {
        gatewayId,
        sessionId,
        expiresAt,
      }))
    },

    async acknowledge({ leaseId, gatewayId, sessionId }) {
      return unwrap(await http.post(`${base}/leases/${encodeURIComponent(leaseId)}/acknowledge`, {
        gatewayId,
        sessionId,
      }))
    },

    async progress({ leaseId, gatewayId, sessionId, percent }) {
      return unwrap(await http.post(`${base}/leases/${encodeURIComponent(leaseId)}/progress`, {
        gatewayId,
        sessionId,
        progress: percent,
      }))
    },

    async complete({ leaseId, gatewayId, sessionId, resultId, adapterEvidence, transportEvidence, output }) {
      return unwrap(await http.post(`${base}/leases/${encodeURIComponent(leaseId)}/complete`, {
        gatewayId,
        sessionId,
        resultId,
        adapterEvidence,
        transportEvidence,
        resultSnapshot: output ?? {},
      }))
    },
  })
}

export default createStoreDeviceDurableHttpTransport
