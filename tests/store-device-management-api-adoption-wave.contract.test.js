import test from 'node:test'
import assert from 'node:assert/strict'
import { createStoreDeviceManagementApi } from '../src/features/store-device/management/createStoreDeviceManagementApi.js'

const createHttp = () => ({
  get: async (url) => {
    if (url.endsWith('/diagnostics')) return { url, branchId: 2, gateways: 1, sessions: 1, jobs: 2, proofKey: 'hidden' }
    if (url.endsWith('/jobs')) return [{ jobId: 'job-1', token: 'hidden' }]
    return { url, jobId: 'job-1', credential: 'hidden' }
  },
  post: async (url, body) => ({ url, body, status: 'OK', secret: 'hidden' }),
})

test('uses authenticated durable Store Device routes without client branch paths', async () => {
  const api = createStoreDeviceManagementApi({ http: createHttp() })
  const overview = await api.overview()
  const detail = await api.getJob('job-1')
  assert.equal(overview.diagnostics.url, '/api/store-devices/diagnostics')
  assert.equal(detail.url, '/api/store-devices/jobs/job-1')
  assert.equal(JSON.stringify(overview).includes('/branches/'), false)
})

test('removes credential material recursively from server projections', async () => {
  const api = createStoreDeviceManagementApi({ http: createHttp() })
  const overview = await api.overview()
  assert.equal('proofKey' in overview.diagnostics, false)
  assert.equal('token' in overview.jobs[0], false)
})

test('supports gateway lifecycle and requires explicit revoke confirmation', async () => {
  const api = createStoreDeviceManagementApi({ http: createHttp() })
  const registered = await api.registerGateway({ gatewayId: 'gw-1', credentialVersion: 1 })
  const rotated = await api.rotateGateway({ gatewayId: 'gw-1', credentialVersion: 2 })
  await assert.rejects(() => api.revokeGateway({ gatewayId: 'gw-1', confirmation: 'yes' }), { code: 'STORE_DEVICE_REVOKE_CONFIRMATION_REQUIRED' })
  const revoked = await api.revokeGateway({ gatewayId: 'gw-1', confirmation: 'REVOKE' })
  assert.equal(registered.url, '/api/store-devices/gateways')
  assert.equal(rotated.url, '/api/store-devices/gateways/gw-1/rotate')
  assert.equal(revoked.url, '/api/store-devices/gateways/gw-1/revoke')
  assert.equal('secret' in revoked, false)
})

test('fails closed for device detail and workstation assignment until server authority exists', () => {
  const api = createStoreDeviceManagementApi({ http: createHttp() })
  assert.throws(() => api.detailDevice('printer-1'), { code: 'STORE_DEVICE_CAPABILITY_NOT_AVAILABLE' })
  assert.throws(() => api.assignWorkstation({ deviceId: 'printer-1', workstationId: 'pos-1' }), { code: 'STORE_DEVICE_CAPABILITY_NOT_AVAILABLE' })
})
