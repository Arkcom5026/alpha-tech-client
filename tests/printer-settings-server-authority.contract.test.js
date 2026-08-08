import assert from 'node:assert/strict'
import test from 'node:test'
import { createPrinterSettingsApi, unwrapData } from '../src/features/printing/settings/printerSettingsApiFactory.js'
import { createServerPrinterSettingsService } from '../src/features/printing/settings/serverPrinterSettingsService.js'

test('unwraps both direct and standard data envelopes', () => {
  assert.deepEqual(unwrapData({ data: [1] }), [1])
  assert.deepEqual(unwrapData({ data: { data: [2] } }), [2])
})

test('uses server authority endpoints for routes, profiles, and physical devices', async () => {
  const calls = []
  const client = {
    get: async (path, config) => { calls.push(['get', path, config]); return { data: { data: [] } } },
    put: async (path, payload) => { calls.push(['put', path, payload]); return { data: { data: payload } } },
    post: async (path, payload) => { calls.push(['post', path, payload]); return { data: { data: payload } } },
    patch: async (path, payload) => { calls.push(['patch', path, payload]); return { data: { data: payload } } },
    delete: async (path) => { calls.push(['delete', path]); return { data: { data: {} } } },
  }
  const api = createPrinterSettingsApi({ client })

  await api.listDocumentPurposes()
  await api.listPrintRoutes()
  await api.listPrinterProfiles()
  await api.listDevices()
  await api.configurePrintRoute({ definitionId: 7, printerProfileId: 9 })
  await api.assignPrinterProfile({ deviceId: 'counter/receipt', printerProfileCode: 'EPSON_T82' })
  await api.registerPrinterDevice({ deviceId: 'windows:p2021', kind: 'PRINTER' })

  assert.deepEqual(calls.slice(0, 4).map((call) => call[1]), [
    '/document-purposes',
    '/document-purposes/print-routes',
    '/store-devices/printer-profiles',
    '/store-devices/devices',
  ])
  assert.equal(calls[4][1], '/document-purposes/7/print-route')
  assert.equal(calls[5][1], '/store-devices/devices/counter%2Freceipt/printer-profile')
  assert.equal(calls[6][1], '/store-devices/devices')
})

test('filters configuration catalog to eligible purposes and usable printer devices', async () => {
  const api = {
    listDocumentPurposes: async () => [
      { id: 1, lifecycleState: 'ACTIVE', metadata: { printEligible: true } },
      { id: 2, lifecycleState: 'ACTIVE', metadata: { printEligible: false } },
    ],
    listPrinterProfiles: async () => [{ id: 3 }],
    listPrintRoutes: async () => [{ id: 4 }],
    listDevices: async () => [
      { deviceId: 'printer', kind: 'PRINTER', revokedAt: null },
      { deviceId: 'scanner', kind: 'SCANNER', revokedAt: null },
      { deviceId: 'old', kind: 'PRINTER', revokedAt: '2026-01-01' },
    ],
  }
  const service = createServerPrinterSettingsService({ api })
  const result = await service.load()

  assert.deepEqual(result.purposes.map((item) => item.id), [1])
  assert.deepEqual(result.devices.map((item) => item.deviceId), ['printer'])
  assert.equal(Object.isFrozen(result), true)
})

test('preserves available catalog data when one authority endpoint is temporarily unavailable', async () => {
  const service = createServerPrinterSettingsService({
    api: {
      listDocumentPurposes: async () => [{ id: 1, lifecycleState: 'ACTIVE', metadata: { printEligible: true } }],
      listPrinterProfiles: async () => { throw new Error('profiles unavailable') },
      listPrintRoutes: async () => [],
      listDevices: async () => [],
    },
  })

  const result = await service.load()
  assert.deepEqual(result.purposes.map((item) => item.id), [1])
  assert.deepEqual(result.profiles, [])
  assert.match(result.warnings[0], /โปรไฟล์: profiles unavailable/)
})

test('registers a locally discovered printer through branch device authority', async () => {
  let registered
  const service = createServerPrinterSettingsService({
    api: {
      registerPrinterDevice: async (payload) => { registered = payload; return payload },
    },
  })

  await service.registerLocalPrinter({
    workstationId: 'workstation-1',
    printer: {
      id: 'windows:p2021',
      name: 'P2021',
      connection: 'WINDOWS',
      isOnline: true,
      driverName: 'P2021 Driver',
      capabilities: { driverManaged: true },
    },
  })

  assert.equal(registered.deviceId, 'windows:p2021')
  assert.equal(registered.gatewayId, 'workstation-1')
  assert.equal(registered.kind, 'PRINTER')
  assert.equal(registered.connectionState, 'ONLINE')
  assert.equal(registered.metadata.driverName, 'P2021 Driver')
})
