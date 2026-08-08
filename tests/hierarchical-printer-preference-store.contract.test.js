import assert from 'node:assert/strict'
import {
  SCOPE_TYPES,
  createHierarchicalPrinterPreferenceStore,
} from '../src/features/printing/preferences/hierarchicalPrinterPreferenceStore.js'

const createStorage = (seed = {}) => {
  const values = new Map(Object.entries(seed))
  return {
    getItem(key) { return values.has(key) ? values.get(key) : null },
    setItem(key, value) { values.set(key, String(value)) },
    snapshot() { return Object.fromEntries(values.entries()) },
  }
}

const printer = {
  printerProfileId: 'windows:EPSON TM-T82X Receipt',
  printerName: 'EPSON TM-T82X Receipt',
  connection: 'WINDOWS_QUEUE',
  queueAuthority: 'LOCAL_QUEUE',
  updatedAt: '2026-08-08T00:00:00.000Z',
}

const storage = createStorage({
  'alpha-tech.printing.preferences.v1': JSON.stringify({ legacy: { preserved: true } }),
})
const store = createHierarchicalPrinterPreferenceStore({ storage })

assert.deepEqual(SCOPE_TYPES, [
  'USER',
  'WORKSTATION',
  'BRANCH',
  'DOCUMENT_DEFAULT',
  'PLATFORM_DEFAULT',
])

const user = store.save({
  scopeType: 'USER',
  branchId: 'branch-1',
  workstationId: 'ws-1',
  userId: 'user-1',
  documentPurpose: 'RECEIPT',
  ...printer,
})
const workstation = store.save({
  scopeType: 'WORKSTATION',
  branchId: 'branch-1',
  workstationId: 'ws-1',
  documentPurpose: 'RECEIPT',
  ...printer,
})
const branch = store.save({
  scopeType: 'BRANCH',
  branchId: 'branch-1',
  documentPurpose: 'RECEIPT',
  ...printer,
})
const documentDefault = store.save({
  scopeType: 'DOCUMENT_DEFAULT',
  documentPurpose: 'RECEIPT',
  ...printer,
})
const platformDefault = store.save({
  scopeType: 'PLATFORM_DEFAULT',
  documentPurpose: 'IGNORED_FOR_PLATFORM_DEFAULT',
  ...printer,
})

assert.equal(user.userId, 'user-1')
assert.equal(workstation.workstationId, 'ws-1')
assert.equal(branch.branchId, 'branch-1')
assert.equal(documentDefault.documentPurpose, 'RECEIPT')
assert.equal(platformDefault.documentPurpose, '*')

assert.equal(store.get({
  scopeType: 'USER',
  branchId: 'branch-1',
  workstationId: 'ws-1',
  userId: 'user-1',
  documentPurpose: 'RECEIPT',
})?.printerProfileId, printer.printerProfileId)

assert.equal(store.get({
  scopeType: 'WORKSTATION',
  branchId: 'branch-1',
  workstationId: 'ws-1',
  documentPurpose: 'RECEIPT',
})?.scopeType, 'WORKSTATION')

assert.equal(store.get({
  scopeType: 'BRANCH',
  branchId: 'branch-1',
  documentPurpose: 'RECEIPT',
})?.scopeType, 'BRANCH')

assert.equal(store.get({
  scopeType: 'DOCUMENT_DEFAULT',
  documentPurpose: 'RECEIPT',
})?.scopeType, 'DOCUMENT_DEFAULT')

assert.equal(store.get({
  scopeType: 'PLATFORM_DEFAULT',
  documentPurpose: 'ANYTHING',
})?.scopeType, 'PLATFORM_DEFAULT')

assert.equal(store.list().length, 5)
assert.equal(store.remove({
  scopeType: 'USER',
  branchId: 'branch-1',
  workstationId: 'ws-1',
  userId: 'user-1',
  documentPurpose: 'RECEIPT',
}), true)
assert.equal(store.list().length, 4)

const snapshot = storage.snapshot()
assert.equal(
  snapshot['alpha-tech.printing.preferences.v1'],
  JSON.stringify({ legacy: { preserved: true } }),
)
assert.ok(snapshot['alpha-tech.printing.preferences.hierarchy.v1'])

assert.throws(
  () => store.save({
    scopeType: 'USER',
    branchId: 'branch-1',
    workstationId: 'ws-1',
    documentPurpose: 'RECEIPT',
    ...printer,
  }),
  /userId is required/,
)

console.log('hierarchical-printer-preference-store.contract.test.js: PASS')
