const fail = (code, message) => Object.assign(new Error(message), { code })

const text = (value, field) => {
  const result = String(value || '').trim()
  if (!result) throw fail('STORE_DEVICE_QUEUE_CERTIFICATION_INPUT_INVALID', `${field} is required`)
  return result
}

export const certifyLocalPrinterQueue = ({
  printer,
  expectedPrinterId,
  expectedDeviceId,
  expectedGatewayId,
} = {}) => {
  if (!printer || typeof printer !== 'object') {
    throw fail('STORE_DEVICE_QUEUE_NOT_FOUND', 'Printer queue was not discovered')
  }

  const printerId = text(printer.id, 'printer.id')
  if (printerId !== text(expectedPrinterId, 'expectedPrinterId')) {
    throw fail('STORE_DEVICE_QUEUE_IDENTITY_MISMATCH', 'Discovered printer does not match the configured pilot printer')
  }

  if (printer.connection !== 'WINDOWS_QUEUE') {
    throw fail('STORE_DEVICE_WINDOWS_QUEUE_REQUIRED', 'Physical pilot requires a Windows printer queue')
  }
  if (printer.queueAuthority !== 'LOCAL_QUEUE' || printer.isLocalQueue !== true) {
    throw fail('STORE_DEVICE_LOCAL_QUEUE_REQUIRED', 'Physical pilot requires a local queue on the USB host')
  }
  if (printer.isSharedConnection === true || String(printer.name || '').startsWith('\\\\')) {
    throw fail('STORE_DEVICE_SHARED_QUEUE_REJECTED', 'Shared or UNC printer connections are not eligible')
  }
  if (printer.capabilities?.raw !== true) {
    throw fail('STORE_DEVICE_RAW_CAPABILITY_REQUIRED', 'Printer queue is not RAW capable')
  }
  if (printer.isOnline !== true || printer.workOffline === true) {
    throw fail('STORE_DEVICE_QUEUE_OFFLINE', 'Printer queue is offline')
  }

  return Object.freeze({
    certified: true,
    printerId,
    printerName: printer.name,
    driverName: printer.driverName || null,
    portName: printer.portName || null,
    queueAuthority: printer.queueAuthority,
    raw: true,
    cut: printer.capabilities?.cut === true,
    deviceId: text(expectedDeviceId, 'expectedDeviceId'),
    gatewayId: text(expectedGatewayId, 'expectedGatewayId'),
  })
}

export default certifyLocalPrinterQueue
