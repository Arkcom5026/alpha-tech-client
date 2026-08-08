import assert from 'node:assert/strict'
import test from 'node:test'
import { createPrinterSettingsRuntime } from '../src/features/printing/settings/printerSettingsRuntime.js'

const createMemoryStorage = () => {
  const values = new Map()
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key),
  }
}

const createJsonResponse = (payload) => ({
  ok: true,
  status: 200,
  json: async () => payload,
})

const printers = Object.freeze([
  Object.freeze({
    id: 'windows:receipt',
    name: 'Receipt Printer',
    connection: 'WINDOWS_QUEUE',
    queueAuthority: 'SHARED_CONNECTION',
    isOnline: true,
    paperWidthMm: 80,
    capabilities: Object.freeze({ driverManaged: true }),
  }),
  Object.freeze({
    id: 'windows:a4',
    name: 'A4 Printer',
    connection: 'WINDOWS_QUEUE',
    queueAuthority: 'LOCAL_QUEUE',
    isOnline: true,
    paperWidthMm: 210,
    capabilities: Object.freeze({ driverManaged: true }),
  }),
])

test('adopts hierarchy store and resolver without replacing legacy runtime surfaces', async () => {
  const storage = createMemoryStorage()
  const runtime = createPrinterSettingsRuntime({
    storage,
    fetchImpl: async () => createJsonResponse({ printers }),
    cryptoImpl: { randomUUID: () => 'hierarchy-runtime' },
  })

  assert.equal(runtime.workstationId, 'workstation-hierarchy-runtime')
  assert.equal(typeof runtime.preferenceStore.get, 'function')
  assert.equal(typeof runtime.discoverySelectionService.resolve, 'function')
  assert.equal(typeof runtime.hierarchyStore.get, 'function')
  assert.equal(typeof runtime.hierarchicalResolverService.resolve, 'function')

  await runtime.discoverySelectionService.select({
    branchId: 'branch-a',
    workstationId: runtime.workstationId,
    documentPurpose: 'RECEIPT',
    printerProfileId: 'windows:receipt',
  })

  const legacyResolution = await runtime.discoverySelectionService.resolve({
    branchId: 'branch-a',
    workstationId: runtime.workstationId,
    documentPurpose: 'RECEIPT',
  })
  assert.equal(legacyResolution.selectionStatus, 'READY')
  assert.equal(legacyResolution.selectedPrinter.id, 'windows:receipt')

  const hierarchicalResolution = await runtime.hierarchicalResolverService.resolve({
    branchId: 'branch-a',
    workstationId: runtime.workstationId,
    documentPurpose: 'RECEIPT',
  })
  assert.equal(hierarchicalResolution.resolution.status, 'READY')
  assert.equal(hierarchicalResolution.resolution.authorityLevel, 'WORKSTATION')
  assert.equal(hierarchicalResolution.bindings.WORKSTATION.source, 'LEGACY_WORKSTATION')
  assert.equal(hierarchicalResolution.resolution.printer.id, 'windows:receipt')
})

test('runtime hierarchy bindings override legacy workstation only when explicitly configured', async () => {
  const storage = createMemoryStorage()
  const runtime = createPrinterSettingsRuntime({
    storage,
    fetchImpl: async () => createJsonResponse({ printers }),
    cryptoImpl: { randomUUID: () => 'hierarchy-runtime' },
  })

  await runtime.discoverySelectionService.select({
    branchId: 'branch-a',
    workstationId: runtime.workstationId,
    documentPurpose: 'RECEIPT',
    printerProfileId: 'windows:receipt',
  })

  runtime.hierarchyStore.save({
    scopeType: 'WORKSTATION',
    branchId: 'branch-a',
    workstationId: runtime.workstationId,
    documentPurpose: 'RECEIPT',
    printerProfileId: 'windows:a4',
    printerName: 'A4 Printer',
    connection: 'WINDOWS_QUEUE',
    queueAuthority: 'LOCAL_QUEUE',
    updatedAt: '2026-08-08T00:00:00.000Z',
  })

  const resolution = await runtime.hierarchicalResolverService.resolve({
    branchId: 'branch-a',
    workstationId: runtime.workstationId,
    documentPurpose: 'RECEIPT',
  })

  assert.equal(resolution.resolution.status, 'READY')
  assert.equal(resolution.resolution.authorityLevel, 'WORKSTATION')
  assert.equal(resolution.bindings.WORKSTATION.source, 'HIERARCHY_WORKSTATION')
  assert.equal(resolution.resolution.printer.id, 'windows:a4')
})

console.log('printer-settings-hierarchical-runtime.contract.test.js: PASS')
