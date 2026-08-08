const sanitizeDevice = (device) => Object.freeze({
  id: device.id,
  branchId: device.branchId,
  gatewayId: device.gatewayId,
  name: device.name,
  kind: device.kind,
  connectionState: device.connectionState || 'UNKNOWN',
  authenticated: device.authenticated === true,
  lastHeartbeatAt: device.lastHeartbeatAt || null,
  capabilities: Object.freeze({ ...(device.capabilities || {}) }),
  workstationId: device.workstationId || null,
  recentError: device.recentError || null,
})

const createStoreDeviceManagementProjection = ({ branchId, devices = [], gateways = [] } = {}) => {
  if (!Number.isInteger(branchId) || branchId <= 0) throw new TypeError('branchId must be a positive integer')
  const ownedDevices = devices.filter((item) => item.branchId === branchId).map(sanitizeDevice)
  const ownedGateways = gateways.filter((item) => item.branchId === branchId).map((item) => Object.freeze({
    id: item.id,
    branchId: item.branchId,
    name: item.name,
    state: item.state || 'UNKNOWN',
    authenticated: item.authenticated === true,
    lastHeartbeatAt: item.lastHeartbeatAt || null,
    deviceCount: ownedDevices.filter((device) => device.gatewayId === item.id).length,
  }))

  return Object.freeze({
    branchId,
    summary: Object.freeze({
      gatewayCount: ownedGateways.length,
      deviceCount: ownedDevices.length,
      onlineDeviceCount: ownedDevices.filter((item) => item.connectionState === 'ONLINE').length,
      errorDeviceCount: ownedDevices.filter((item) => item.recentError).length,
    }),
    gateways: Object.freeze(ownedGateways),
    devices: Object.freeze(ownedDevices),
    findDevice: (id) => ownedDevices.find((item) => item.id === id) || null,
    createIntent: ({ action, deviceId, confirmation = false }) => {
      if (!['REGISTER','RENAME','ASSIGN_WORKSTATION','REVOKE'].includes(action)) throw new TypeError('unsupported management action')
      if (action === 'REVOKE' && confirmation !== true) throw Object.assign(new Error('explicit confirmation is required'), { code: 'STORE_DEVICE_CONFIRMATION_REQUIRED' })
      const device = ownedDevices.find((item) => item.id === deviceId)
      if (!device && action !== 'REGISTER') throw Object.assign(new Error('device not found for branch'), { code: 'STORE_DEVICE_NOT_FOUND' })
      return Object.freeze({ action, branchId, deviceId: deviceId || null, requiresServerRevalidation: true })
    },
  })
}

export { createStoreDeviceManagementProjection }
export default createStoreDeviceManagementProjection
