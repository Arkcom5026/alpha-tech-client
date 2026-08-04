import { createLimitedRealAdapterPilot } from './createLimitedRealAdapterPilot.js'

const requiredText = (value, field) => {
  const text = String(value || '').trim()
  if (!text) throw Object.assign(new Error(`${field} is required`), { code: 'STORE_DEVICE_PILOT_CONFIGURATION_INVALID' })
  return text
}

export const createPhysicalPilotExecutionRuntime = ({
  enabled = false,
  allowedBranchId,
  allowedGatewayId,
  allowedDeviceId,
  allowedPrinterId,
  confirmationToken,
  resolveRegisteredDevice,
  resolvePrinter,
  physicalAdapter,
}) => {
  if (typeof resolveRegisteredDevice !== 'function' || typeof resolvePrinter !== 'function' || !physicalAdapter?.print) {
    throw new TypeError('resolveRegisteredDevice, resolvePrinter and physicalAdapter are required')
  }

  const pilot = createLimitedRealAdapterPilot({
    enabled,
    allowedBranchId,
    allowedGatewayId,
    allowedDeviceId,
    resolveDevice: async ({ branchId, gatewayId, deviceId }) => {
      const device = await resolveRegisteredDevice({ branchId, gatewayId, deviceId })
      if (!device) return null
      const printerId = requiredText(device.printerProfileId || device.queueId || allowedPrinterId, 'printerProfileId')
      const printer = await resolvePrinter(printerId)
      if (!printer) return null
      return Object.freeze({
        ...device,
        printerProfileId: printerId,
        printer,
        queueAuthority: printer.queueAuthority,
        isLocalQueue: printer.isLocalQueue === true,
        capabilities: Object.freeze({
          ...(device.capabilities || {}),
          raw: printer.capabilities?.raw === true,
        }),
      })
    },
    executePrint: async ({ jobId, device, requestSnapshot }) => physicalAdapter.print({
      printer: device.printer,
      request: {
        ...requestSnapshot,
        jobId,
        branchId: Number(allowedBranchId),
        gatewayId: String(allowedGatewayId || ''),
        deviceId: String(allowedDeviceId || ''),
        confirmation: confirmationToken,
      },
    }),
  })

  return Object.freeze({
    execute: pilot.execute,
    diagnostics: () => Object.freeze({
      ...pilot.diagnostics(),
      allowedPrinterId: enabled ? String(allowedPrinterId || '') : null,
      adapterEnabled: physicalAdapter.enabled === true,
    }),
  })
}

export default createPhysicalPilotExecutionRuntime
