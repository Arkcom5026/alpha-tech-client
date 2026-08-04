import { discoverWindowsPrinters } from '../src/windowsPrinterDiscovery.js'
import { certifyLocalPrinterQueue } from '../src/pilot/certifyLocalPrinterQueue.js'

const required = (name) => {
  const value = String(process.env[name] || '').trim()
  if (!value) throw Object.assign(new Error(`${name} is required`), { code: 'STORE_DEVICE_HOST_CERTIFICATION_CONFIG_INVALID' })
  return value
}

const expectedPrinterId = required('ALPHA_PRINT_BRIDGE_PILOT_PRINTER_ID')
const expectedDeviceId = required('ALPHA_PRINT_BRIDGE_PILOT_DEVICE_ID')
const expectedGatewayId = required('ALPHA_PRINT_BRIDGE_PILOT_GATEWAY_ID')

const printers = await discoverWindowsPrinters()
const printer = printers.find((item) => item.id === expectedPrinterId) || null
const certification = certifyLocalPrinterQueue({
  printer,
  expectedPrinterId,
  expectedDeviceId,
  expectedGatewayId,
})

console.log(JSON.stringify({
  result: 'PASS',
  physicalExecution: false,
  certification,
}, null, 2))
