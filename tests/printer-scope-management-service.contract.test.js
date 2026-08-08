import assert from 'node:assert/strict'
import { createPrinterScopeManagementService } from '../src/features/printing/settings/printerScopeManagementService.js'

const printer = Object.freeze({
  id: 'windows:receipt-1',
  name: 'Receipt 1',
  connection: 'WINDOWS_QUEUE',
  queueAuthority: 'LOCAL_QUEUE',
  isOnline: true,
})

const createHarness = () => {
  const stored = new Map()
  const calls = []
  const key = (scope) => JSON.stringify({
    scopeType: scope.scopeType ?? null,
    branchId: scope.branchId ?? null,
    workstationId: scope.workstationId ?? null,
    userId: scope.userId ?? null,
    documentPurpose: scope.documentPurpose ?? null,
  })
  const hierarchyStore = {
    get: (scope) => stored.get(key(scope)) || null,
    save: (value) => {
      const scope = value.scopeType === 'WORKSTATION'
        ? { scopeType: value.scopeType, branchId: value.branchId, workstationId: value.workstationId, documentPurpose: value.documentPurpose }
        : value.scopeType === 'BRANCH'
          ? { scopeType: value.scopeType, branchId: value.branchId, documentPurpose: value.documentPurpose }
          : { scopeType: value.scopeType, documentPurpose: value.documentPurpose }
      stored.set(key(scope), value)
      calls.push({ type: 'save', value })
      return value
    },
    remove: (scope) => {
      calls.push({ type: 'remove', scope })
      return stored.delete(key(scope))
    },
  }
  const discoverySelectionService = {
    discover: async () => ({ printers: [printer], warning: null }),
  }
  const hierarchicalResolverService = {
    resolve: async () => ({
      resolution: {
        status: 'READY',
        authorityLevel: 'BRANCH',
        printer,
      },
    }),
  }

  const service = createPrinterScopeManagementService({
    discoverySelectionService,
    hierarchyStore,
    hierarchicalResolverService,
    now: () => new Date('2026-08-08T03:30:00.000Z'),
  })
  return { service, calls }
}

{
  const { service, calls } = createHarness()
  const saved = await service.save({
    scopeType: 'BRANCH',
    branchId: 'branch-1',
    workstationId: 'workstation-1',
    documentPurpose: 'RECEIPT',
    printerProfileId: printer.id,
  })

  assert.equal(saved.scopeType, 'BRANCH')
  assert.equal(saved.branchId, 'branch-1')
  assert.equal(saved.printerProfileId, printer.id)
  assert.equal(calls[0].value.updatedAt, '2026-08-08T03:30:00.000Z')

  const inspection = await service.inspect({
    scopeType: 'BRANCH',
    branchId: 'branch-1',
    workstationId: 'workstation-1',
    documentPurpose: 'RECEIPT',
  })
  assert.equal(inspection.preference.printerProfileId, printer.id)
  assert.equal(inspection.resolved.authorityLevel, 'BRANCH')
  assert.equal(inspection.resolved.printer.id, printer.id)
}

{
  const { service } = createHarness()
  for (const scopeType of ['USER', 'PLATFORM_DEFAULT']) {
    await assert.rejects(
      async () => service.save({
        scopeType,
        branchId: 'branch-1',
        workstationId: 'workstation-1',
        documentPurpose: 'RECEIPT',
        printerProfileId: printer.id,
      }),
      new RegExp(`Unsupported editable scopeType: ${scopeType}`),
    )
  }
}

{
  const { service } = createHarness()
  await assert.rejects(
    async () => service.save({
      scopeType: 'WORKSTATION',
      branchId: 'branch-1',
      workstationId: 'workstation-1',
      documentPurpose: 'RECEIPT',
      printerProfileId: 'windows:not-found',
    }),
    (error) => error?.code === 'PRINTER_NOT_DISCOVERED',
  )
}

console.log('printer-scope-management-service.contract.test.js: PASS')
