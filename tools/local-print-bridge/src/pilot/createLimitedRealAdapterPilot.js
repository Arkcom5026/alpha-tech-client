const fail = (code, message) => Object.assign(new Error(message), { code })

const requireText = (value, field) => {
  const text = String(value || '').trim()
  if (!text) throw fail('STORE_DEVICE_PILOT_INPUT_INVALID', `${field} is required`)
  return text
}

export const createLimitedRealAdapterPilot = ({
  enabled = false,
  allowedBranchId,
  allowedGatewayId,
  allowedDeviceId,
  resolveDevice,
  executePrint,
}) => {
  if (typeof resolveDevice !== 'function' || typeof executePrint !== 'function') {
    throw new TypeError('resolveDevice and executePrint are required')
  }

  let activeJobId = null
  let completedJobId = null

  const authorize = async (input = {}) => {
    if (!enabled) throw fail('STORE_DEVICE_PHYSICAL_PILOT_DISABLED', 'Physical pilot is disabled')

    const branchId = Number(input.branchId)
    const gatewayId = requireText(input.gatewayId, 'gatewayId')
    const deviceId = requireText(input.deviceId, 'deviceId')
    const jobId = requireText(input.jobId, 'jobId')

    if (branchId !== Number(allowedBranchId) || gatewayId !== String(allowedGatewayId) || deviceId !== String(allowedDeviceId)) {
      throw fail('STORE_DEVICE_PHYSICAL_PILOT_SCOPE_DENIED', 'Pilot request is outside the explicitly allowed scope')
    }

    const device = await resolveDevice({ branchId, gatewayId, deviceId })
    if (!device || device.branchId !== branchId || device.gatewayId !== gatewayId || device.deviceId !== deviceId) {
      throw fail('STORE_DEVICE_PHYSICAL_PILOT_DEVICE_NOT_REGISTERED', 'Registered device authority was not found')
    }
    if (device.revokedAt || device.connectionState === 'REVOKED') {
      throw fail('STORE_DEVICE_PHYSICAL_PILOT_DEVICE_REVOKED', 'Revoked device cannot execute a physical pilot')
    }
    if (device.kind !== 'PRINTER' || device.capabilities?.print !== true) {
      throw fail('STORE_DEVICE_PHYSICAL_PILOT_CAPABILITY_DENIED', 'Device is not an authorized printer')
    }
    if (device.queueAuthority !== 'LOCAL_QUEUE' || device.isLocalQueue !== true || device.capabilities?.raw !== true) {
      throw fail('STORE_DEVICE_PHYSICAL_PILOT_LOCAL_QUEUE_REQUIRED', 'Physical pilot requires a local RAW-capable queue')
    }
    if (completedJobId === jobId) {
      return Object.freeze({ replayed: true, jobId, deviceId, result: null })
    }
    if (activeJobId && activeJobId !== jobId) {
      throw fail('STORE_DEVICE_PHYSICAL_PILOT_BUSY', 'Another pilot job is already active')
    }

    activeJobId = jobId
    return Object.freeze({ branchId, gatewayId, deviceId, jobId, device })
  }

  const execute = async (input = {}) => {
    const authority = await authorize(input)
    if (authority.replayed) return authority

    try {
      const result = await executePrint({
        jobId: authority.jobId,
        device: authority.device,
        requestSnapshot: input.requestSnapshot,
      })
      completedJobId = authority.jobId
      return Object.freeze({
        replayed: false,
        jobId: authority.jobId,
        deviceId: authority.deviceId,
        result,
      })
    } finally {
      activeJobId = null
    }
  }

  const diagnostics = () => Object.freeze({
    enabled,
    allowedBranchId: enabled ? Number(allowedBranchId) : null,
    allowedGatewayId: enabled ? String(allowedGatewayId || '') : null,
    allowedDeviceId: enabled ? String(allowedDeviceId || '') : null,
    activeJobId,
    completedJobId,
  })

  return Object.freeze({ authorize, execute, diagnostics })
}

export default createLimitedRealAdapterPilot
