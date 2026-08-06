import assert from 'node:assert/strict'
import test from 'node:test'
import {
  WORKSTATION_STORAGE_KEY,
  createPrinterSettingsRuntime,
  resolveWorkstationId,
} from '../src/features/printing/settings/printerSettingsRuntime.js'

const createMemoryStorage = () => {
  const values = new Map()
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key),
  }
}

const createJsonResponse = (payload, { ok = true, status = 200 } = {}) => ({
  ok,
  status,
  json: async () => payload,
})

test('creates and preserves one workstation identity per browser storage', () => {
  const storage = createMemoryStorage()
  const cryptoImpl = { randomUUID: () => 'runtime-test-id' }

  const first = resolveWorkstationId({ storage, cryptoImpl })
  const second = resolveWorkstationId({
    storage,
    cryptoImpl: { randomUUID: () => 'must-not-replace' },
  })

  assert.equal(first, 'workstation-runtime-test-id')
  assert.equal(second, first)
  assert.equal(storage.getItem(WORKSTATION_STORAGE_KEY), first)
})

test('wires local storage bridge transport and discovery selection service', async () => {
  const storage = createMemoryStorage()
  const requests = []
  const fetchImpl = async (url) => {
    requests.push(url)
    return createJsonResponse({
      printers: [{
        id: 'windows:shared-receipt',
        name: 'Shared Receipt Printer',
        connection: 'WINDOWS_QUEUE',
        queueAuthority: 'SHARED_CONNECTION',
        isOnline: true,
        paperWidthMm: 80,
        capabilities: { driverManaged: true, raw: false },
      }],
    })
  }

  const runtime = createPrinterSettingsRuntime({
    storage,
    fetchImpl,
    cryptoImpl: { randomUUID: () => 'counter-1' },
  })

  const discovery = await runtime.discoverySelectionService.discover({
    documentPurpose: 'RECEIPT',
  })

  assert.equal(runtime.workstationId, 'workstation-counter-1')
  assert.equal(discovery.printers.length, 1)
  assert.equal(discovery.printers[0].id, 'windows:shared-receipt')
  assert.equal(requests[0], 'http://127.0.0.1:17451/v1/printers')
})

test('keeps selected printers isolated by branch and workstation runtime scope', async () => {
  const storage = createMemoryStorage()
  const fetchImpl = async () => createJsonResponse({
    printers: [{
      id: 'windows:queue-1',
      name: 'Queue 1',
      connection: 'WINDOWS_QUEUE',
      queueAuthority: 'SHARED_CONNECTION',
      isOnline: true,
      capabilities: { driverManaged: true },
    }],
  })
  const runtime = createPrinterSettingsRuntime({
    storage,
    fetchImpl,
    cryptoImpl: { randomUUID: () => 'counter-1' },
  })

  await runtime.discoverySelectionService.select({
    branchId: 'branch-a',
    workstationId: runtime.workstationId,
    documentPurpose: 'RECEIPT',
    printerProfileId: 'windows:queue-1',
  })

  const ready = await runtime.discoverySelectionService.resolve({
    branchId: 'branch-a',
    workstationId: runtime.workstationId,
    documentPurpose: 'RECEIPT',
  })
  const otherBranch = await runtime.discoverySelectionService.resolve({
    branchId: 'branch-b',
    workstationId: runtime.workstationId,
    documentPurpose: 'RECEIPT',
  })

  assert.equal(ready.selectionStatus, 'READY')
  assert.equal(otherBranch.selectionStatus, 'NOT_CONFIGURED')
})

test('requires persistent browser storage authority', () => {
  assert.throws(
    () => createPrinterSettingsRuntime({ storage: null, fetchImpl: async () => {} }),
    /storage adapter is required/
  )
})
