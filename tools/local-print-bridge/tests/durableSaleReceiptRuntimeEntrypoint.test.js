import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { createDurableSaleReceiptRuntimeComposition } from '../src/durableSaleReceiptRuntimeComposition.js'

const serverPath = fileURLToPath(new URL('../src/server.js', import.meta.url))

test('composition keeps pilot and physical submission behind separate explicit gates', () => {
  const composition = createDurableSaleReceiptRuntimeComposition({
    resolvePrinter: async () => null,
    env: {
      ALPHA_PRINT_BRIDGE_DURABLE_SALE_RECEIPT_PRINTER_ID: 'windows:EPSON',
      ALPHA_PRINT_BRIDGE_SERVER_BASE_URL: 'https://server.example',
      ALPHA_PRINT_BRIDGE_SERVER_AUTHORIZATION: 'Bearer test',
    },
    renderer: { async render() { throw new Error('must not render') } },
    submitter: { async submit() { throw new Error('must not submit') } },
    localExecutor: { async execute() { throw new Error('must not execute') } },
    leaseClient: { async lease() { throw new Error('must not lease') } },
    coordinator: { async execute() { throw new Error('must not coordinate') } },
  })

  assert.equal(composition.readiness.pilotEnabled, false)
  assert.equal(composition.readiness.physicalSubmissionEnabled, false)
  assert.equal(composition.readiness.exactPrinterConfigured, true)
  assert.equal(composition.readiness.serverBaseUrlConfigured, true)
  assert.equal(composition.readiness.serverAuthorizationConfigured, true)
})

test('disabled durable pilot does not require server credentials for local printer discovery startup', () => {
  const composition = createDurableSaleReceiptRuntimeComposition({
    resolvePrinter: async () => null,
    env: {},
    renderer: { async render() { throw new Error('must not render') } },
    submitter: { async submit() { throw new Error('must not submit') } },
    localExecutor: { async execute() { throw new Error('must not execute') } },
  })

  assert.equal(composition.runtime.enabled, false)
  assert.equal(composition.readiness.pilotEnabled, false)
  assert.equal(composition.readiness.serverBaseUrlConfigured, false)
})

test('composition exposes both pilot and physical gates only when explicitly configured', () => {
  const composition = createDurableSaleReceiptRuntimeComposition({
    resolvePrinter: async () => null,
    env: {
      ALPHA_PRINT_BRIDGE_ENABLE_DURABLE_SALE_RECEIPT_PILOT: '1',
      ALPHA_PRINT_BRIDGE_ENABLE_DURABLE_SALE_RECEIPT: '1',
      ALPHA_PRINT_BRIDGE_DURABLE_SALE_RECEIPT_PRINTER_ID: 'windows:EPSON',
      ALPHA_PRINT_BRIDGE_DURABLE_SALE_RECEIPT_CONFIRMATION: 'approved-once',
      ALPHA_PRINT_BRIDGE_SERVER_BASE_URL: 'https://server.example',
      ALPHA_PRINT_BRIDGE_SERVER_AUTHORIZATION: 'Bearer test',
    },
    renderer: { async render() { return {} } },
    submitter: { async submit() { return {} } },
    localExecutor: { async execute() { return {} } },
    leaseClient: { async lease() { return {} } },
    coordinator: { async execute() { return {} } },
  })

  assert.equal(composition.readiness.pilotEnabled, true)
  assert.equal(composition.readiness.physicalSubmissionEnabled, true)
  assert.equal(composition.readiness.allowedPrinterId, 'windows:EPSON')
})

test('server exposes durable worker readiness without replacing manual or default print routes', async () => {
  const source = await readFile(serverPath, 'utf8')

  assert.match(source, /createDurableSaleReceiptGatewayWorker/)
  assert.match(source, /durableSaleReceiptWorker\.readiness/)
  assert.match(source, /durableSaleReceiptWorker\.start\(\)/)
  assert.match(source, /durableSaleReceiptWorker\.stop\(\)/)
  assert.match(source, /DURABLE_SALE_RECEIPT_WORKER_ARMED/)
  assert.match(source, /\/v1\/durable-sale-receipt-pilot/)
  assert.match(source, /durableSaleReceipt\.runtime\.execute/)
  assert.match(source, /\/v1\/physical-pilot/)
  assert.match(source, /\/v1\/print-jobs/)
  assert.match(source, /version: '0\.6\.0'/)
  assert.match(source, /durableSaleReceiptPilot:/)
  assert.match(source, /durableSaleReceiptWorker:/)
})
