import test from 'node:test'
import assert from 'node:assert/strict'
import { createStoreDeviceManagementApi } from '../src/features/store-device/management/createStoreDeviceManagementApi.js'

const createHttp = () => ({
  get: async (url) => ({ url, branchId: 2, devices: [{ id: 'printer-1', token: 'hidden' }], proofKey: 'hidden' }),
  post: async (url, body) => ({ url, body, branchId: 2, credential: 'hidden', status: 'OK' }),
})

test('uses authenticated branch paths for overview and detail', async () => {
  const api = createStoreDeviceManagementApi({ http: createHttp(), getBranchId: () => 2 })
  const overview = await api.list()
  const detail = await api.detail('printer-1')
  assert.equal(overview.url, '/api/store-device/branches/2/overview')
  assert.equal(detail.url, '/api/store-device/branches/2/devices/printer-1')
})

test('removes credential material from server projections', async () => {
  const api = createStoreDeviceManagementApi({ http: createHttp(), getBranchId: () => 2 })
  const overview = await api.list()
  assert.equal('proofKey' in overview, false)
  assert.equal('token' in overview.devices[0], false)
})

test('requires explicit confirmation before gateway revoke', async () => {
  const api = createStoreDeviceManagementApi({ http: createHttp(), getBranchId: () => 2 })
  await assert.rejects(() => api.revokeGateway({ gatewayId: 'gw-1', confirmation: 'yes' }), { code: 'STORE_DEVICE_REVOKE_CONFIRMATION_REQUIRED' })
  const result = await api.revokeGateway({ gatewayId: 'gw-1', confirmation: 'REVOKE' })
  assert.equal(result.status, 'OK')
  assert.equal('credential' in result, false)
})
