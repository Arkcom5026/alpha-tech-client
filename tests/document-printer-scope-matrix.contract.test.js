import assert from 'node:assert/strict'
import { createPrinterSettingsRuntime } from '../src/features/printing/settings/printerSettingsRuntime.js'
import { SYSTEM_DOCUMENT_PURPOSE_CODES } from '../src/features/printing/preferences/documentPurposeCatalog.js'

const createMemoryStorage = () => {
  const values = new Map()
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key),
  }
}

const scopePrefixes = Object.freeze({
  DOCUMENT_DEFAULT: 'document',
  BRANCH: 'branch',
  WORKSTATION: 'workstation',
})

const printers = SYSTEM_DOCUMENT_PURPOSE_CODES.flatMap((purpose) => (
  Object.entries(scopePrefixes).map(([scopeType, prefix]) => Object.freeze({
    id: `windows:${prefix}:${purpose}`,
    name: `${prefix}-${purpose}`,
    connection: 'WINDOWS_QUEUE',
    queueAuthority: 'LOCAL_QUEUE',
    isOnline: true,
    paperWidthMm: purpose === 'SALE_RECEIPT' || purpose === 'SHORT_TAX_INVOICE' ? 80 : 210,
    capabilities: { driverManaged: true, raw: false },
    scopeType,
    purpose,
  }))
))

const runtime = createPrinterSettingsRuntime({
  storage: createMemoryStorage(),
  fetchImpl: async () => ({
    ok: true,
    status: 200,
    json: async () => ({ printers }),
  }),
  cryptoImpl: { randomUUID: () => 'scope-matrix' },
})

const branchId = 'branch-matrix'
const workstationId = runtime.workstationId

for (const purpose of SYSTEM_DOCUMENT_PURPOSE_CODES) {
  for (const scopeType of ['DOCUMENT_DEFAULT', 'BRANCH', 'WORKSTATION']) {
    const printer = printers.find((candidate) => (
      candidate.purpose === purpose && candidate.scopeType === scopeType
    ))

    await runtime.printerScopeManagementService.save({
      scopeType,
      branchId,
      workstationId,
      documentPurpose: purpose,
      printerProfileId: printer.id,
    })
  }
}

for (const purpose of SYSTEM_DOCUMENT_PURPOSE_CODES) {
  const workstationPrinter = printers.find((candidate) => (
    candidate.purpose === purpose && candidate.scopeType === 'WORKSTATION'
  ))
  const branchPrinter = printers.find((candidate) => (
    candidate.purpose === purpose && candidate.scopeType === 'BRANCH'
  ))
  const documentPrinter = printers.find((candidate) => (
    candidate.purpose === purpose && candidate.scopeType === 'DOCUMENT_DEFAULT'
  ))

  const workstationInspection = await runtime.printerScopeManagementService.inspect({
    scopeType: 'WORKSTATION',
    branchId,
    workstationId,
    documentPurpose: purpose,
  })
  assert.equal(workstationInspection.preference.printerProfileId, workstationPrinter.id)
  assert.equal(workstationInspection.resolved.authorityLevel, 'WORKSTATION')
  assert.equal(workstationInspection.resolved.printer.id, workstationPrinter.id)

  assert.equal(runtime.printerScopeManagementService.clear({
    scopeType: 'WORKSTATION',
    branchId,
    workstationId,
    documentPurpose: purpose,
  }), true)

  const branchInspection = await runtime.printerScopeManagementService.inspect({
    scopeType: 'BRANCH',
    branchId,
    workstationId,
    documentPurpose: purpose,
  })
  assert.equal(branchInspection.preference.printerProfileId, branchPrinter.id)
  assert.equal(branchInspection.resolved.authorityLevel, 'BRANCH')
  assert.equal(branchInspection.resolved.printer.id, branchPrinter.id)

  assert.equal(runtime.printerScopeManagementService.clear({
    scopeType: 'BRANCH',
    branchId,
    workstationId,
    documentPurpose: purpose,
  }), true)

  const documentInspection = await runtime.printerScopeManagementService.inspect({
    scopeType: 'DOCUMENT_DEFAULT',
    branchId,
    workstationId,
    documentPurpose: purpose,
  })
  assert.equal(documentInspection.preference.printerProfileId, documentPrinter.id)
  assert.equal(documentInspection.resolved.authorityLevel, 'DOCUMENT_DEFAULT')
  assert.equal(documentInspection.resolved.printer.id, documentPrinter.id)
}

const remaining = runtime.hierarchyStore.list()
assert.equal(remaining.length, SYSTEM_DOCUMENT_PURPOSE_CODES.length)
assert.deepEqual(
  remaining.map((preference) => preference.documentPurpose).sort(),
  [...SYSTEM_DOCUMENT_PURPOSE_CODES].sort(),
)
assert.ok(remaining.every((preference) => preference.scopeType === 'DOCUMENT_DEFAULT'))

console.log('document-printer-scope-matrix.contract.test.js: PASS')
