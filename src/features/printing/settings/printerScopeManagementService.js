const EDITABLE_SCOPE_TYPES = Object.freeze([
  'WORKSTATION',
  'BRANCH',
  'DOCUMENT_DEFAULT',
])
const EDITABLE_SCOPE_SET = new Set(EDITABLE_SCOPE_TYPES)

const requireText = (value, field) => {
  const normalized = String(value || '').trim()
  if (!normalized) throw new TypeError(`${field} is required`)
  return normalized
}

const requireEditableScope = (value) => {
  const scopeType = requireText(value, 'scopeType').toUpperCase()
  if (!EDITABLE_SCOPE_SET.has(scopeType)) {
    throw new TypeError(`Unsupported editable scopeType: ${scopeType}`)
  }
  return scopeType
}

const createPreferenceInput = ({
  scopeType,
  branchId,
  workstationId,
  documentPurpose,
  printer,
  updatedAt,
}) => {
  const input = {
    scopeType,
    documentPurpose,
    printerProfileId: printer.id,
    printerName: printer.name,
    connection: printer.connection,
    queueAuthority: printer.queueAuthority ?? null,
    updatedAt,
  }

  if (scopeType === 'WORKSTATION') {
    input.branchId = branchId
    input.workstationId = workstationId
  } else if (scopeType === 'BRANCH') {
    input.branchId = branchId
  }

  return input
}

const createScopeInput = ({ scopeType, branchId, workstationId, documentPurpose }) => {
  const input = { scopeType, documentPurpose }
  if (scopeType === 'WORKSTATION') {
    input.branchId = branchId
    input.workstationId = workstationId
  } else if (scopeType === 'BRANCH') {
    input.branchId = branchId
  }
  return input
}

const createPrinterScopeManagementService = ({
  discoverySelectionService,
  hierarchyStore,
  hierarchicalResolverService,
  now = () => new Date(),
} = {}) => {
  if (!discoverySelectionService || typeof discoverySelectionService.discover !== 'function') {
    throw new TypeError('discoverySelectionService.discover is required')
  }
  if (!hierarchyStore || typeof hierarchyStore.get !== 'function' || typeof hierarchyStore.save !== 'function' || typeof hierarchyStore.remove !== 'function') {
    throw new TypeError('hierarchyStore get/save/remove methods are required')
  }
  if (!hierarchicalResolverService || typeof hierarchicalResolverService.resolve !== 'function') {
    throw new TypeError('hierarchicalResolverService.resolve is required')
  }

  const normalizeContext = ({ branchId, workstationId, documentPurpose } = {}) => ({
    branchId: requireText(branchId, 'branchId'),
    workstationId: requireText(workstationId, 'workstationId'),
    documentPurpose: requireText(documentPurpose, 'documentPurpose'),
  })

  const inspect = async (input = {}) => {
    const scopeType = requireEditableScope(input.scopeType)
    const context = normalizeContext(input)
    const discovery = await discoverySelectionService.discover({ documentPurpose: context.documentPurpose })
    const scope = createScopeInput({ scopeType, ...context })
    const preference = hierarchyStore.get(scope)
    const resolved = await hierarchicalResolverService.resolve(context)

    return Object.freeze({
      ...context,
      scopeType,
      preference,
      printers: discovery.printers,
      warning: discovery.warning || null,
      resolved: resolved.resolution,
    })
  }

  const save = async (input = {}) => {
    const scopeType = requireEditableScope(input.scopeType)
    const context = normalizeContext(input)
    const printerProfileId = requireText(input.printerProfileId, 'printerProfileId')
    const discovery = await discoverySelectionService.discover({ documentPurpose: context.documentPurpose })
    const printer = discovery.printers.find((candidate) => candidate.id === printerProfileId) || null

    if (!printer) {
      const error = new Error(`Printer is not available from the local bridge: ${printerProfileId}`)
      error.code = 'PRINTER_NOT_DISCOVERED'
      throw error
    }
    if (printer.isOnline === false) {
      const error = new Error(`Printer is offline: ${printerProfileId}`)
      error.code = 'PRINTER_OFFLINE'
      throw error
    }

    return hierarchyStore.save(createPreferenceInput({
      scopeType,
      ...context,
      printer,
      updatedAt: now().toISOString(),
    }))
  }

  const clear = (input = {}) => {
    const scopeType = requireEditableScope(input.scopeType)
    const context = normalizeContext(input)
    return hierarchyStore.remove(createScopeInput({ scopeType, ...context }))
  }

  return Object.freeze({ inspect, save, clear })
}

export {
  EDITABLE_SCOPE_TYPES,
  createPrinterScopeManagementService,
}

export default createPrinterScopeManagementService
