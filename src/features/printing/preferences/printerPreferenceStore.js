import {
  createPrinterPreferenceContract,
  createPrinterPreferenceKey,
} from './createPrinterPreferenceContract.js'

const STORAGE_NAMESPACE = 'alpha-tech.printing.preferences.v1'

const createPrinterPreferenceStore = ({ storage } = {}) => {
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

  const writeAll = (preferences) => {
    storage.setItem(STORAGE_NAMESPACE, JSON.stringify(preferences))
  }

  const save = (input) => {
    const preference = createPrinterPreferenceContract(input)
    const key = createPrinterPreferenceKey(preference)
    const preferences = readAll()

    writeAll({
      ...preferences,
      [key]: preference,
    })

    return preference
  }

  const get = (scope) => {
    const key = createPrinterPreferenceKey(scope)
    const stored = readAll()[key]
    if (!stored) return null

    try {
      return createPrinterPreferenceContract(stored)
    } catch {
      return null
    }
  }

  const remove = (scope) => {
    const key = createPrinterPreferenceKey(scope)
    const preferences = readAll()
    if (!(key in preferences)) return false

    delete preferences[key]
    writeAll(preferences)
    return true
  }

  const listForWorkstation = ({ branchId, workstationId } = {}) => {
    const normalizedBranchId = String(branchId || '').trim()
    const normalizedWorkstationId = String(workstationId || '').trim()
    if (!normalizedBranchId) throw new TypeError('branchId is required')
    if (!normalizedWorkstationId) throw new TypeError('workstationId is required')

    return Object.values(readAll())
      .filter((preference) => (
        preference?.branchId === normalizedBranchId &&
        preference?.workstationId === normalizedWorkstationId
      ))
      .map((preference) => {
        try {
          return createPrinterPreferenceContract(preference)
        } catch {
          return null
        }
      })
      .filter(Boolean)
      .sort((left, right) => left.documentPurpose.localeCompare(right.documentPurpose))
  }

  return Object.freeze({
    namespace: STORAGE_NAMESPACE,
    save,
    get,
    remove,
    listForWorkstation,
  })
}

export { STORAGE_NAMESPACE, createPrinterPreferenceStore }
export default createPrinterPreferenceStore
