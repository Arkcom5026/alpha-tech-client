import { createPrinterPreferenceContract } from './createPrinterPreferenceContract.js'

const STORAGE_NAMESPACE = 'alpha-tech.printing.preferences.hierarchy.v1'
const SCOPE_TYPES = Object.freeze([
  'USER',
  'WORKSTATION',
  'BRANCH',
  'DOCUMENT_DEFAULT',
  'PLATFORM_DEFAULT',
])
const SCOPE_TYPE_SET = new Set(SCOPE_TYPES)

const requireText = (value, field) => {
  const normalized = String(value || '').trim()
  if (!normalized) throw new TypeError(`${field} is required`)
  return normalized
}

const normalizeScope = ({
  scopeType,
  branchId,
  workstationId,
  userId,
  documentPurpose,
} = {}) => {
  const normalizedScopeType = requireText(scopeType, 'scopeType').toUpperCase()
  if (!SCOPE_TYPE_SET.has(normalizedScopeType)) {
    throw new TypeError(`Unsupported scopeType: ${normalizedScopeType}`)
  }

  const purpose = requireText(documentPurpose, 'documentPurpose')
  const scope = {
    scopeType: normalizedScopeType,
    branchId: null,
    workstationId: null,
    userId: null,
    documentPurpose: purpose,
  }

  if (normalizedScopeType === 'USER') {
    scope.branchId = requireText(branchId, 'branchId')
    scope.workstationId = requireText(workstationId, 'workstationId')
    scope.userId = requireText(userId, 'userId')
  } else if (normalizedScopeType === 'WORKSTATION') {
    scope.branchId = requireText(branchId, 'branchId')
    scope.workstationId = requireText(workstationId, 'workstationId')
  } else if (normalizedScopeType === 'BRANCH') {
    scope.branchId = requireText(branchId, 'branchId')
  } else if (normalizedScopeType === 'PLATFORM_DEFAULT') {
    scope.documentPurpose = '*'
  }

  return Object.freeze(scope)
}

const createHierarchicalPrinterPreferenceKey = (scope = {}) => {
  const normalized = normalizeScope(scope)
  return [
    normalized.scopeType,
    normalized.branchId || '*',
    normalized.workstationId || '*',
    normalized.userId || '*',
    normalized.documentPurpose,
  ].map(encodeURIComponent).join(':')
}

const normalizePreference = (input = {}) => {
  const scope = normalizeScope(input)
  const base = createPrinterPreferenceContract({
    branchId: scope.branchId || '*',
    workstationId: scope.workstationId || '*',
    documentPurpose: scope.documentPurpose === '*' ? 'A4_DOCUMENT' : scope.documentPurpose,
    printerProfileId: input.printerProfileId,
    printerName: input.printerName,
    connection: input.connection,
    queueAuthority: input.queueAuthority,
    updatedAt: input.updatedAt,
  })

  return Object.freeze({
    ...scope,
    printerProfileId: base.printerProfileId,
    printerName: base.printerName,
    connection: base.connection,
    queueAuthority: base.queueAuthority,
    updatedAt: base.updatedAt,
  })
}

const createHierarchicalPrinterPreferenceStore = ({ storage } = {}) => {
  if (!storage || typeof storage.getItem !== 'function' || typeof storage.setItem !== 'function') {
    throw new TypeError('storage adapter is required')
  }

  const readAll = () => {
    const raw = storage.getItem(STORAGE_NAMESPACE)
    if (!raw) return {}
    try {
      const parsed = JSON.parse(raw)
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {}
    } catch {
      return {}
    }
  }

  const writeAll = (value) => storage.setItem(STORAGE_NAMESPACE, JSON.stringify(value))

  const save = (input) => {
    const preference = normalizePreference(input)
    const key = createHierarchicalPrinterPreferenceKey(preference)
    writeAll({ ...readAll(), [key]: preference })
    return preference
  }

  const get = (scope) => {
    const key = createHierarchicalPrinterPreferenceKey(scope)
    const stored = readAll()[key]
    if (!stored) return null
    try {
      return normalizePreference(stored)
    } catch {
      return null
    }
  }

  const remove = (scope) => {
    const key = createHierarchicalPrinterPreferenceKey(scope)
    const all = readAll()
    if (!(key in all)) return false
    delete all[key]
    writeAll(all)
    return true
  }

  const list = () => Object.values(readAll())
    .map((item) => {
      try {
        return normalizePreference(item)
      } catch {
        return null
      }
    })
    .filter(Boolean)

  return Object.freeze({
    namespace: STORAGE_NAMESPACE,
    save,
    get,
    remove,
    list,
  })
}

export {
  STORAGE_NAMESPACE,
  SCOPE_TYPES,
  createHierarchicalPrinterPreferenceKey,
  createHierarchicalPrinterPreferenceStore,
  normalizeScope,
}

export default createHierarchicalPrinterPreferenceStore
