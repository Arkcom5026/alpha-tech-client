import assert from 'node:assert/strict'
import test from 'node:test'
import {
  createPrinterDiscoverySelectionService,
  scorePrinterForPurpose,
} from '../src/features/printing/preferences/printerDiscoverySelectionService.js'

const printers = [
  {
    id: 'windows:shared-receipt',
    name: '\\\\print-host\\Receipt Queue',
    connection: 'WINDOWS_QUEUE',
    queueAuthority: 'SHARED_CONNECTION',
    isOnline: true,
    paperWidthMm: 80,
    capabilities: { driverManaged: true, raw: false },
  },
  {
    id: 'windows:a4-office',
    name: 'Office A4 Laser',
    connection: 'WINDOWS_QUEUE',
    queueAuthority: 'LOCAL_QUEUE',
    isOnline: true,
    paperWidthMm: 210,
    capabilities: { driverManaged: false, raw: false },
  },
  {
    id: 'windows:offline-label',
    name: 'Barcode Label Queue',
    connection: 'WINDOWS_QUEUE',
    queueAuthority: 'LOCAL_QUEUE',
    isOnline: false,
    capabilities: { raw: true },
  },
]

const createMemoryPreferenceStore = () => {
  const values = new Map()
  const keyOf = ({ branchId, workstationId, documentPurpose }) => (
    `${branchId}:${workstationId}:${documentPurpose}`
  )

  return {
    get: (scope) => values.get(keyOf(scope)) || null,
    save: (preference) => {
      const stored = Object.freeze({ ...preference })
      values.set(keyOf(preference), stored)
      return stored
    },
    remove: (scope) => values.delete(keyOf(scope)),
  }
}

const createService = ({ payload = { printers }, store = createMemoryPreferenceStore() } = {}) => ({
  store,
  service: createPrinterDiscoverySelectionService({
    transport: { listPrinters: async () => payload },
    preferenceStore: store,
    now: () => new Date('2026-08-06T16:00:00.000Z'),
  }),
})

test('discovers and ranks printers without selecting one automatically', async () => {
  const { service } = createService()
  const result = await service.discover({ documentPurpose: 'RECEIPT' })

  assert.equal(result.printers.length, 3)
  assert.equal(result.printers[0].id, 'windows:shared-receipt')
  assert.equal(result.printers[0].capabilities.driverManaged, true)
  assert.equal(result.printers.at(-1).id, 'windows:offline-label')
})

test('uses document purpose to recommend an appropriate queue class', () => {
  assert.ok(
    scorePrinterForPurpose(printers[0], 'RECEIPT') >
    scorePrinterForPurpose(printers[1], 'RECEIPT')
  )
  assert.ok(
    scorePrinterForPurpose(printers[1], 'A4_DOCUMENT') >
    scorePrinterForPurpose(printers[0], 'A4_DOCUMENT')
  )
})

test('saves the explicitly selected discovered printer for the workstation scope', async () => {
  const { service, store } = createService()
  const preference = await service.select({
    branchId: '2',
    workstationId: 'counter-01',
    documentPurpose: 'RECEIPT',
    printerProfileId: 'windows:shared-receipt',
  })

  assert.equal(preference.printerName, '\\\\print-host\\Receipt Queue')
  assert.equal(preference.connection, 'WINDOWS_QUEUE')
  assert.equal(preference.queueAuthority, 'SHARED_CONNECTION')
  assert.equal(preference.updatedAt, '2026-08-06T16:00:00.000Z')
  assert.equal(store.get(preference), preference)
})

test('resolves ready unavailable and not-configured preference states', async () => {
  const store = createMemoryPreferenceStore()
  const { service } = createService({ store })
  const scope = {
    branchId: '2',
    workstationId: 'counter-01',
    documentPurpose: 'RECEIPT',
  }

  assert.equal((await service.resolve(scope)).selectionStatus, 'NOT_CONFIGURED')

  await service.select({ ...scope, printerProfileId: 'windows:shared-receipt' })
  assert.equal((await service.resolve(scope)).selectionStatus, 'READY')

  const offlineService = createService({ payload: { printers: [printers[1]] }, store }).service
  const unavailable = await offlineService.resolve(scope)
  assert.equal(unavailable.selectionStatus, 'UNAVAILABLE')
  assert.equal(unavailable.selectedPrinter, null)
})

test('rejects undiscovered or offline printers and supports clearing a preference', async () => {
  const { service } = createService()

  await assert.rejects(
    () => service.select({
      branchId: '2',
      workstationId: 'counter-01',
      documentPurpose: 'RECEIPT',
      printerProfileId: 'missing-printer',
    }),
    (error) => error.code === 'PRINTER_NOT_DISCOVERED'
  )

  await assert.rejects(
    () => service.select({
      branchId: '2',
      workstationId: 'counter-01',
      documentPurpose: 'BARCODE_LABEL',
      printerProfileId: 'windows:offline-label',
    }),
    (error) => error.code === 'PRINTER_OFFLINE'
  )

  await service.select({
    branchId: '2',
    workstationId: 'counter-01',
    documentPurpose: 'RECEIPT',
    printerProfileId: 'windows:shared-receipt',
  })
  assert.equal(service.clear({
    branchId: '2',
    workstationId: 'counter-01',
    documentPurpose: 'RECEIPT',
  }), true)
})
