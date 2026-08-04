import test from 'node:test'
import assert from 'node:assert/strict'
import { createPhysicalPilotExecutionRuntime } from '../tools/local-print-bridge/src/pilot/createPhysicalPilotExecutionRuntime.js'

const printer = Object.freeze({
  id: 'windows:EPSON-T82X',
  name: 'EPSON TM-T82X Receipt',
  queueAuthority: 'LOCAL_QUEUE',
  isLocalQueue: true,
  capabilities: { raw: true, cut: true },
})

const device = Object.freeze({
  branchId: 2,
  gatewayId: 'gw-store-2',
  deviceId: 'printer-front',
  printerProfileId: printer.id,
  kind: 'PRINTER',
  connectionState: 'ONLINE',
  revokedAt: null,
  capabilities: { print: true, cut: true },
})

test('binds exact pilot authority to the physical adapter once', async () => {
  const calls = []
  const runtime = createPhysicalPilotExecutionRuntime({
    enabled: true,
    allowedBranchId: 2,
    allowedGatewayId: 'gw-store-2',
    allowedDeviceId: 'printer-front',
    allowedPrinterId: printer.id,
    confirmationToken: 'confirm-once',
    resolveRegisteredDevice: async () => device,
    resolvePrinter: async () => printer,
    physicalAdapter: {
      enabled: true,
      print: async (input) => { calls.push(input); return { status: 'PRINTED', pilotId: 'pilot-1' } },
    },
  })

  const input = {
    branchId: 2,
    gatewayId: 'gw-store-2',
    deviceId: 'printer-front',
    jobId: 'job-physical-1',
    requestSnapshot: { documentType: 'SHORT_TAX_INVOICE' },
  }
  const first = await runtime.execute(input)
  const replay = await runtime.execute(input)

  assert.equal(first.result.status, 'PRINTED')
  assert.equal(replay.replayed, true)
  assert.equal(calls.length, 1)
  assert.equal(calls[0].printer.id, printer.id)
  assert.equal(calls[0].request.confirmation, 'confirm-once')
  assert.equal(calls[0].request.jobId, 'job-physical-1')
})

test('fails closed for shared queues and disabled execution', async () => {
  const disabled = createPhysicalPilotExecutionRuntime({
    resolveRegisteredDevice: async () => device,
    resolvePrinter: async () => printer,
    physicalAdapter: { enabled: false, print: async () => ({}) },
  })
  await assert.rejects(() => disabled.execute({ branchId: 2, gatewayId: 'gw-store-2', deviceId: 'printer-front', jobId: 'job-x' }), {
    code: 'STORE_DEVICE_PHYSICAL_PILOT_DISABLED',
  })

  const sharedRuntime = createPhysicalPilotExecutionRuntime({
    enabled: true,
    allowedBranchId: 2,
    allowedGatewayId: 'gw-store-2',
    allowedDeviceId: 'printer-front',
    allowedPrinterId: printer.id,
    confirmationToken: 'confirm-once',
    resolveRegisteredDevice: async () => device,
    resolvePrinter: async () => ({ ...printer, queueAuthority: 'SHARED_CONNECTION', isLocalQueue: false, capabilities: { raw: false } }),
    physicalAdapter: { enabled: true, print: async () => ({}) },
  })
  await assert.rejects(() => sharedRuntime.execute({ branchId: 2, gatewayId: 'gw-store-2', deviceId: 'printer-front', jobId: 'job-x' }), {
    code: 'STORE_DEVICE_PHYSICAL_PILOT_LOCAL_QUEUE_REQUIRED',
  })
})
