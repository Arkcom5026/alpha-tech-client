import assert from 'node:assert/strict'
import test from 'node:test'
import { createPrinterScopeManagementService } from '../src/features/printing/settings/printerScopeManagementService.js'

const printers = [
  {
    id: 'windows:receipt-slip',
    name: 'Receipt Slip Printer',
    connection: 'WINDOWS_QUEUE',
    queueAuthority: 'LOCAL_QUEUE',
    isOnline: true,
  },
  {
    id: 'windows:full-tax-a4',
    name: 'Full Tax Invoice Printer',
    connection: 'WINDOWS_QUEUE',
    queueAuthority: 'LOCAL_QUEUE',
    isOnline: true,
  },
]

const createHarness = () => {
  const values = new Map()
  const key = ({ scopeType, branchId, workstationId, documentPurpose }) => JSON.stringify({
    scopeType,
    branchId: branchId ?? null,
    workstationId: workstationId ?? null,
    documentPurpose,
  })

  const hierarchyStore = {
    get: (scope) => values.get(key(scope)) || null,
    save: (value) => {
      const scope = value.scopeType === 'WORKSTATION'
        ? {
            scopeType: value.scopeType,
            branchId: value.branchId,
            workstationId: value.workstationId,
            documentPurpose: value.documentPurpose,
          }
        : value.scopeType === 'BRANCH'
          ? {
              scopeType: value.scopeType,
              branchId: value.branchId,
              documentPurpose: value.documentPurpose,
            }
          : {
              scopeType: value.scopeType,
              documentPurpose: value.documentPurpose,
            }
      values.set(key(scope), value)
      return value
    },
    remove: (scope) => values.delete(key(scope)),
  }

  const discoverySelectionService = {
    discover: async () => ({ printers, warning: null }),
  }

  const hierarchicalResolverService = {
    resolve: async ({ branchId, workstationId, documentPurpose }) => {
      const preference = hierarchyStore.get({
        scopeType: 'WORKSTATION',
        branchId,
        workstationId,
        documentPurpose,
      })
      return {
        resolution: {
          status: preference ? 'READY' : 'NOT_CONFIGURED',
          authorityLevel: preference ? 'WORKSTATION' : null,
          printer: preference
            ? printers.find((printer) => printer.id === preference.printerProfileId) || null
            : null,
        },
      }
    },
  }

  return createPrinterScopeManagementService({
    discoverySelectionService,
    hierarchyStore,
    hierarchicalResolverService,
    now: () => new Date('2026-08-08T06:00:00.000Z'),
  })
}

test('binds short and full tax invoices to independent printer profiles', async () => {
  const service = createHarness()
  const context = {
    scopeType: 'WORKSTATION',
    branchId: 'branch-1',
    workstationId: 'workstation-1',
  }

  await service.save({
    ...context,
    documentPurpose: 'SHORT_TAX_INVOICE',
    printerProfileId: 'windows:receipt-slip',
  })

  await service.save({
    ...context,
    documentPurpose: 'FULL_TAX_INVOICE',
    printerProfileId: 'windows:full-tax-a4',
  })

  const shortInspection = await service.inspect({
    ...context,
    documentPurpose: 'SHORT_TAX_INVOICE',
  })
  const fullInspection = await service.inspect({
    ...context,
    documentPurpose: 'FULL_TAX_INVOICE',
  })

  assert.equal(shortInspection.preference.printerProfileId, 'windows:receipt-slip')
  assert.equal(shortInspection.resolved.printer.id, 'windows:receipt-slip')
  assert.equal(fullInspection.preference.printerProfileId, 'windows:full-tax-a4')
  assert.equal(fullInspection.resolved.printer.id, 'windows:full-tax-a4')
})
