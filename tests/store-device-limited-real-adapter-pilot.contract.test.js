import test from 'node:test'
import assert from 'node:assert/strict'
import { createLimitedRealAdapterPilot } from '../tools/local-print-bridge/src/pilot/createLimitedRealAdapterPilot.js'

const registeredPrinter = Object.freeze({
  branchId: 2,
  gatewayId: 'gw-store-2',
  deviceId: 'printer-front',
  kind: 'PRINTER',
  connectionState: 'ONLINE',
  revokedAt: null,
  queueAuthority: 'LOCAL_QUEUE',
  isLocalQueue: true,
  capabilities: { print: true, raw: true, cut: true },
})

const createPilot = (overrides = {}) => createLimitedRealAdapterPilot({
  enabled: true,
  allowedBranchId: 2,
  allowedGatewayId: 'gw-store-2',
  allowedDeviceId: 'printer-front',
  resolveDevice: async () => registeredPrinter,
  executePrint: async ({ jobId }) => ({ status: 'SUCCEEDED', jobId, printed: true }),
  ...overrides,
})

test('executes one explicitly scoped registered local printer pilot', async () => {
  const pilot = createPilot()
  const result = await pilot.execute({
    branchId: 2,
    gatewayId: 'gw-store-2',
    deviceId: 'printer-front',
    jobId: 'job-1',
    requestSnapshot: { documentType: 'SHORT_TAX_INVOICE' },
  })
  assert.equal(result.result.status, 'SUCCEEDED')
  assert.equal(pilot.diagnostics().completedJobId, 'job-1')
})

test('fails closed outside exact branch gateway device and local queue authority', async () => {
  const pilot = createPilot()
  await assert.rejects(() => pilot.execute({ branchId: 3, gatewayId: 'gw-store-2', deviceId: 'printer-front', jobId: 'job-x' }), { code: 'STORE_DEVICE_PHYSICAL_PILOT_SCOPE_DENIED' })

  const sharedQueuePilot = createPilot({
    resolveDevice: async () => ({ ...registeredPrinter, queueAuthority: 'SHARED_CONNECTION', isLocalQueue: false, capabilities: { print: true, raw: false } }),
  })
  await assert.rejects(() => sharedQueuePilot.execute({ branchId: 2, gatewayId: 'gw-store-2', deviceId: 'printer-front', jobId: 'job-x' }), { code: 'STORE_DEVICE_PHYSICAL_PILOT_LOCAL_QUEUE_REQUIRED' })
})

test('is disabled by default and deduplicates a completed pilot job', async () => {
  const disabled = createLimitedRealAdapterPilot({
    resolveDevice: async () => registeredPrinter,
    executePrint: async () => ({ status: 'SUCCEEDED' }),
  })
  await assert.rejects(() => disabled.execute({ branchId: 2, gatewayId: 'gw-store-2', deviceId: 'printer-front', jobId: 'job-1' }), { code: 'STORE_DEVICE_PHYSICAL_PILOT_DISABLED' })

  let executions = 0
  const pilot = createPilot({ executePrint: async () => { executions += 1; return { status: 'SUCCEEDED' } } })
  const input = { branchId: 2, gatewayId: 'gw-store-2', deviceId: 'printer-front', jobId: 'job-2' }
  await pilot.execute(input)
  const replay = await pilot.execute(input)
  assert.equal(replay.replayed, true)
  assert.equal(executions, 1)
})
