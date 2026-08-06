/* global Buffer, process */
import http from 'node:http'
import { createDefaultMockRegistry } from './printerRegistry.js'
import { createMockPrinterAdapter } from './mockPrinterAdapter.js'
import { validatePrintJob } from './printJobValidator.js'

const HOST = process.env.ALPHA_PRINT_BRIDGE_HOST || '127.0.0.1'
const PORT = Number(process.env.ALPHA_PRINT_BRIDGE_PORT || 17451)
const MAX_BODY_BYTES = 1_000_000

const registry = createDefaultMockRegistry()
const adapter = createMockPrinterAdapter()

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

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://${HOST}:${PORT}`)

  if (req.method === 'OPTIONS') {
    sendJson(res, 204, {})
    return
  }

  if (req.method === 'GET' && url.pathname === '/health') {
    sendJson(res, 200, {
      ok: true,
      service: 'alpha-tech-local-print-bridge',
      version: '0.1.0',
      mode: 'MOCK',
      host: HOST,
      port: PORT,
      timestamp: new Date().toISOString(),
    })
    return
  }

  if (req.method === 'GET' && url.pathname === '/v1/printers') {
    sendJson(res, 200, { printers: registry.list() })
    return
  }

  if (req.method === 'POST' && url.pathname === '/v1/print-jobs') {
    try {
      const printJob = validatePrintJob(await readJsonBody(req))
      const printer = registry.get(printJob.printerProfileId)

      if (!printer) {
        sendJson(res, 404, {
          code: 'PRINTER_PROFILE_NOT_FOUND',
          message: `Printer profile not found: ${printJob.printerProfileId}`,
        })
        return
      }

      const result = await adapter.print({ printer, printJob })
      sendJson(res, 202, { accepted: true, result })
    } catch (error) {
      sendJson(res, error.statusCode || 400, {
        code: error.name === 'TypeError' ? 'INVALID_PRINT_JOB' : 'PRINT_JOB_REJECTED',
        message: error.message,
      })
    }
    return
  }

  sendJson(res, 404, { code: 'NOT_FOUND', message: 'Route not found' })
})

server.listen(PORT, HOST, () => {
  console.log(`[local-print-bridge] listening on http://${HOST}:${PORT}`)
  console.log('[local-print-bridge] adapter=MOCK printer=mock-epson-tm-t82x')
})

const shutdown = (signal) => {
  console.log(`[local-print-bridge] received ${signal}, shutting down`)
  server.close((error) => {
    if (error) {
      console.error('[local-print-bridge] shutdown failed', error)
      process.exitCode = 1
    }
  })
}

process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))

export { server }
