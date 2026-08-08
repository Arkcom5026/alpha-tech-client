import assert from 'node:assert/strict'
import { createHierarchicalPrinterResolverService } from '../src/features/printing/preferences/hierarchicalPrinterResolverService.js'

const printers = [
  { id: 'printer:user', name: 'User Printer', isOnline: true },
  { id: 'printer:workstation', name: 'Workstation Printer', isOnline: true },
  { id: 'printer:legacy', name: 'Legacy Printer', isOnline: true },
  { id: 'printer:branch', name: 'Branch Printer', isOnline: true },
  { id: 'printer:document', name: 'Document Printer', isOnline: true },
  { id: 'printer:platform', name: 'Platform Printer', isOnline: true },
]

const preference = (printerProfileId, printerName = printerProfileId) => ({
  printerProfileId,
  printerName,
  connection: 'WINDOWS_QUEUE',
  queueAuthority: 'LOCAL_QUEUE',
  updatedAt: '2026-08-08T00:00:00.000Z',
})

const createStores = ({ hierarchy = {}, legacy = null } = {}) => ({
  hierarchyStore: {
    get(scope) {
      const key = [scope.scopeType, scope.branchId || '*', scope.workstationId || '*', scope.userId || '*', scope.documentPurpose].join('|')
      return hierarchy[key] || null
    },
  },
  legacyPreferenceStore: {
    get() { return legacy },
  },
})

const scope = {
  branchId: 'branch-1',
  workstationId: 'workstation-1',
  userId: 'user-1',
  documentPurpose: 'RECEIPT',
}

{
  const stores = createStores({
    hierarchy: {
      'USER|branch-1|workstation-1|user-1|RECEIPT': preference('printer:user'),
      'WORKSTATION|branch-1|workstation-1|*|RECEIPT': preference('printer:workstation'),
      'BRANCH|branch-1|*|*|RECEIPT': preference('printer:branch'),
      'DOCUMENT_DEFAULT|*|*|*|RECEIPT': preference('printer:document'),
      'PLATFORM_DEFAULT|*|*|*|*': preference('printer:platform'),
    },
    legacy: preference('printer:legacy'),
  })
  const service = createHierarchicalPrinterResolverService({
    transport: { async listPrinters() { return { printers } } },
    ...stores,
  })
  const result = await service.resolve(scope)
  assert.equal(result.resolution.status, 'READY')
  assert.equal(result.resolution.authorityLevel, 'USER')
  assert.equal(result.resolution.printer.id, 'printer:user')
  assert.equal(result.bindings.WORKSTATION.source, 'HIERARCHY_WORKSTATION')
}

{
  const stores = createStores({ legacy: preference('printer:legacy') })
  const service = createHierarchicalPrinterResolverService({
    transport: { async listPrinters() { return { printers } } },
    ...stores,
  })
  const result = await service.resolve(scope)
  assert.equal(result.resolution.authorityLevel, 'WORKSTATION')
  assert.equal(result.resolution.printer.id, 'printer:legacy')
  assert.equal(result.bindings.WORKSTATION.source, 'LEGACY_WORKSTATION')
}

{
  const stores = createStores({
    hierarchy: {
      'WORKSTATION|branch-1|workstation-1|*|RECEIPT': preference('printer:missing'),
      'BRANCH|branch-1|*|*|RECEIPT': preference('printer:branch'),
    },
    legacy: preference('printer:legacy'),
  })
  const service = createHierarchicalPrinterResolverService({
    transport: { async listPrinters() { return { printers } } },
    ...stores,
  })
  const result = await service.resolve(scope)
  assert.equal(result.resolution.authorityLevel, 'WORKSTATION')
  assert.equal(result.resolution.status, 'UNAVAILABLE')
  assert.equal(result.resolution.reason, 'CONFIGURED_PRINTER_NOT_DISCOVERED')
  assert.equal(result.resolution.fallbackBlocked, true)
}

{
  const stores = createStores({
    hierarchy: {
      'BRANCH|branch-1|*|*|RECEIPT': preference('printer:branch'),
      'DOCUMENT_DEFAULT|*|*|*|RECEIPT': preference('printer:document'),
      'PLATFORM_DEFAULT|*|*|*|*': preference('printer:platform'),
    },
  })
  const service = createHierarchicalPrinterResolverService({
    transport: { async listPrinters() { return { printers, warning: { code: 'DISCOVERY_WARNING' } } } },
    ...stores,
  })
  const result = await service.resolve({ ...scope, userId: null })
  assert.equal(result.resolution.authorityLevel, 'BRANCH')
  assert.equal(result.resolution.printer.id, 'printer:branch')
  assert.equal(result.warning.code, 'DISCOVERY_WARNING')
}

console.log('hierarchical-printer-resolver-service.contract.test.js: PASS')
