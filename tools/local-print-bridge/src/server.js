import http from 'node:http'
import { createDefaultMockRegistry } from './printerRegistry.js'
import { createMockPrinterAdapter } from './mockPrinterAdapter.js'
import { validatePrintJob } from './printJobValidator.js'
import { discoverWindowsPrinters } from './windowsPrinterDiscovery.js'
import { createWindowsRawPrinterAdapter } from './windowsRawPrinterAdapter.js'
import { createPhysicalPilotAdapter } from './physicalPilotAdapter.js'
import { createGatewayStartupRuntime } from './gateway/createGatewayStartupRuntime.js'
import { createPhysicalPilotExecutionRuntime } from './pilot/createPhysicalPilotExecutionRuntime.js'

const HOST = process.env.ALPHA_PRINT_BRIDGE_HOST || '127.0.0.1'
const PORT = Number(process.env.ALPHA_PRINT_BRIDGE_PORT || 17451)
const MAX_BODY_BYTES = 1_000_000
const RAW_ENABLED = process.env.ALPHA_PRINT_BRIDGE_ENABLE_RAW === '1'
const PHYSICAL_PILOT_ENABLED = process.env.ALPHA_PRINT_BRIDGE_ENABLE_PHYSICAL_PILOT === '1'
const PILOT_PRINTER_ID = process.env.ALPHA_PRINT_BRIDGE_PILOT_PRINTER_ID || ''
const PILOT_BRANCH_ID = Number(process.env.ALPHA_PRINT_BRIDGE_PILOT_BRANCH_ID || 0)
const PILOT_GATEWAY_ID = process.env.ALPHA_PRINT_BRIDGE_PILOT_GATEWAY_ID || ''
const PILOT_DEVICE_ID = process.env.ALPHA_PRINT_BRIDGE_PILOT_DEVICE_ID || ''
const PILOT_CONFIRMATION = process.env.ALPHA_PRINT_BRIDGE_PILOT_CONFIRMATION || ''

const registry = createDefaultMockRegistry()
const mockAdapter = createMockPrinterAdapter()
const rawAdapter = createWindowsRawPrinterAdapter({ enabled: RAW_ENABLED })
const physicalPilotAdapter = createPhysicalPilotAdapter()
const gatewayRuntime = createGatewayStartupRuntime()

const resolvePrinter = async (printerProfileId) => {
  const mock = registry.get(printerProfileId)
  if (mock) return mock
  const windowsPrinters = await discoverWindowsPrinters()
  return windowsPrinters.find((printer) => printer.id === printerProfileId) || null
}

const resolveRegisteredPilotDevice = async ({ branchId, gatewayId, deviceId }) => {
  if (
    branchId !== PILOT_BRANCH_ID ||
    gatewayId !== PILOT_GATEWAY_ID ||
    deviceId !== PILOT_DEVICE_ID
  ) return null

  return Object.freeze({
    branchId,
    gatewayId,
    deviceId,
    printerProfileId: PILOT_PRINTER_ID,
    kind: 'PRINTER',
    connectionState: 'ONLINE',
    revokedAt: null,
    capabilities: Object.freeze({ print: true }),
  })
}

const physicalPilotRuntime = createPhysicalPilotExecutionRuntime({
  enabled: PHYSICAL_PILOT_ENABLED,
  allowedBranchId: PILOT_BRANCH_ID,
  allowedGatewayId: PILOT_GATEWAY_ID,
  allowedDeviceId: PILOT_DEVICE_ID,
  allowedPrinterId: PILOT_PRINTER_ID,
  confirmationToken: PILOT_CONFIRMATION,
  resolveRegisteredDevice: resolveRegisteredPilotDevice,
  resolvePrinter,
  physicalAdapter: physicalPilotAdapter,
})

const sendJson = (res, statusCode, payload) => {
  const body = JSON.stringify(payload)
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,X-Alpha-Workstation-Id',
    'Cache-Control': 'no-store',
  })
  res.end(body)
}

const readJsonBody = (req) => new Promise((resolve, reject) => {
  let size = 0
  const chunks = []
  req.on('data', (chunk) => {
    size += chunk.length
    if (size > MAX_BODY_BYTES) {
      reject(Object.assign(new Error('Request body too large'), { statusCode: 413 }))
      req.destroy()
      return
    }
    chunks.push(chunk)
  })
  req.on('end', () => {
    try {
      const raw = Buffer.concat(chunks).toString('utf8')
      resolve(raw ? JSON.parse(raw) : {})
    } catch (error) {
      reject(Object.assign(new Error('Invalid JSON body'), { statusCode: 400, cause: error }))
    }
  })
  req.on('error', reject)
})

const sendError = (res, error) => sendJson(res, error.statusCode || 400, {
  code: error.code || (error.name === 'TypeError' ? 'INVALID_REQUEST' : 'REQUEST_REJECTED'),
  message: error.message,
})

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://${HOST}:${PORT}`)

  if (req.method === 'OPTIONS') return sendJson(res, 204, {})

  if (req.method === 'GET' && url.pathname === '/health') {
    return sendJson(res, 200, {
      ok: true,
      service: 'alpha-tech-local-print-bridge',
      version: '0.5.0',
      mode: PHYSICAL_PILOT_ENABLED ? 'LIMITED_PHYSICAL_PILOT_ARMED' : RAW_ENABLED ? 'WINDOWS_RAW_ENABLED' : 'MOCK_WITH_WINDOWS_DISCOVERY',
      rawPrintingEnabled: RAW_ENABLED,
      physicalPilotEnabled: PHYSICAL_PILOT_ENABLED,
      pilotPrinterId: PHYSICAL_PILOT_ENABLED ? PILOT_PRINTER_ID : null,
      physicalPilot: physicalPilotRuntime.diagnostics(),
      gateway: gatewayRuntime.diagnostics,
      host: HOST,
      port: PORT,
      timestamp: new Date().toISOString(),
    })
  }

  if (req.method === 'GET' && url.pathname === '/v1/printers') {
    try {
      const windowsPrinters = await discoverWindowsPrinters()
      return sendJson(res, 200, { printers: [...registry.list(), ...windowsPrinters] })
    } catch (error) {
      return sendJson(res, 200, {
        printers: registry.list(),
        warning: { code: 'WINDOWS_PRINTER_DISCOVERY_FAILED', message: error.message },
      })
    }
  }

  if (req.method === 'POST' && url.pathname === '/v1/physical-pilot') {
    try {
      const request = await readJsonBody(req)
      const result = await physicalPilotRuntime.execute({
        branchId: request.branchId,
        gatewayId: request.gatewayId,
        deviceId: request.deviceId,
        jobId: request.jobId,
        requestSnapshot: request.requestSnapshot || {},
      })
      return sendJson(res, result.replayed ? 200 : 202, { accepted: true, result })
    } catch (error) {
      return sendError(res, error)
    }
  }

  if (req.method === 'POST' && url.pathname === '/v1/print-jobs') {
    try {
      const printJob = validatePrintJob(await readJsonBody(req))
      const printer = await resolvePrinter(printJob.printerProfileId)
      if (!printer) {
        return sendJson(res, 404, {
          code: 'PRINTER_PROFILE_NOT_FOUND',
          message: `Printer profile not found: ${printJob.printerProfileId}`,
        })
      }

      const adapter = printer.connection === 'WINDOWS_QUEUE' ? rawAdapter : mockAdapter
      const result = await adapter.print({ printer, printJob })
      return sendJson(res, 202, { accepted: true, result })
    } catch (error) {
      return sendError(res, error)
    }
  }

  return sendJson(res, 404, { code: 'NOT_FOUND', message: 'Route not found' })
})

server.listen(PORT, HOST, () => {
  console.log(`[local-print-bridge] listening on http://${HOST}:${PORT}`)
  console.log(`[local-print-bridge] rawPrintingEnabled=${RAW_ENABLED}`)
  console.log(`[local-print-bridge] physicalPilotEnabled=${PHYSICAL_PILOT_ENABLED}`)
  console.log(`[local-print-bridge] gatewayEnabled=${gatewayRuntime.enabled}`)
  if (PHYSICAL_PILOT_ENABLED) {
    console.log(`[local-print-bridge] pilotPrinterId=${PILOT_PRINTER_ID}`)
    console.log(`[local-print-bridge] pilotScope=${PILOT_BRANCH_ID}/${PILOT_GATEWAY_ID}/${PILOT_DEVICE_ID}`)
  }
  gatewayRuntime.start()
})

const shutdown = (signal) => {
  console.log(`[local-print-bridge] received ${signal}, shutting down`)
  gatewayRuntime.stop()
  server.close((error) => {
    if (error) {
      console.error('[local-print-bridge] shutdown failed', error)
      process.exitCode = 1
    }
  })
}

process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))

export { gatewayRuntime, physicalPilotRuntime, server }
