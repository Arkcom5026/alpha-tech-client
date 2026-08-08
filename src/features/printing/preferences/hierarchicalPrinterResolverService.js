import { resolveDocumentPrinter } from './documentPrinterResolutionPolicy.js'
import { getLegacyDocumentPurposeAliases } from './documentPurposeCatalog.js'

const requireText = (value, field) => {
  const normalized = String(value || '').trim()
  if (!normalized) throw new TypeError(`${field} is required`)
  return normalized
}

const toBinding = (preference, source) => {
  if (!preference) return null
  return Object.freeze({
    printerProfileId: preference.printerProfileId,
    printerName: preference.printerName || null,
    source,
    metadata: Object.freeze({
      connection: preference.connection || null,
      queueAuthority: preference.queueAuthority || null,
      updatedAt: preference.updatedAt || null,
      storedDocumentPurpose: preference.documentPurpose || null,
    }),
  })
}

const normalizePrinters = (payload) => Array.isArray(payload?.printers)
  ? payload.printers.filter((printer) => printer && typeof printer === 'object')
  : []

const firstPreference = (getPreference, purposes) => {
  for (const purpose of purposes) {
    const preference = getPreference(purpose)
    if (preference) return preference
  }
  return null
}

const createHierarchicalPrinterResolverService = ({
  transport,
  legacyPreferenceStore,
  hierarchyStore,
} = {}) => {
  if (!transport || typeof transport.listPrinters !== 'function') {
    throw new TypeError('transport.listPrinters is required')
  }
  if (!legacyPreferenceStore || typeof legacyPreferenceStore.get !== 'function') {
    throw new TypeError('legacyPreferenceStore.get is required')
  }
  if (!hierarchyStore || typeof hierarchyStore.get !== 'function') {
    throw new TypeError('hierarchyStore.get is required')
  }

  const resolve = async ({ branchId, workstationId, userId = null, documentPurpose } = {}) => {
    const branch = requireText(branchId, 'branchId')
    const workstation = requireText(workstationId, 'workstationId')
    const purpose = requireText(documentPurpose, 'documentPurpose')
    const user = userId == null ? null : requireText(userId, 'userId')
    const purposeCandidates = [purpose, ...getLegacyDocumentPurposeAliases(purpose)]

    const userPreference = user
      ? firstPreference((candidatePurpose) => hierarchyStore.get({
        scopeType: 'USER',
        branchId: branch,
        workstationId: workstation,
        userId: user,
        documentPurpose: candidatePurpose,
      }), purposeCandidates)
      : null

    const hierarchicalWorkstationPreference = firstPreference((candidatePurpose) => hierarchyStore.get({
      scopeType: 'WORKSTATION',
      branchId: branch,
      workstationId: workstation,
      documentPurpose: candidatePurpose,
    }), purposeCandidates)
    const legacyWorkstationPreference = firstPreference((candidatePurpose) => legacyPreferenceStore.get({
      branchId: branch,
      workstationId: workstation,
      documentPurpose: candidatePurpose,
    }), purposeCandidates)

    const branchPreference = firstPreference((candidatePurpose) => hierarchyStore.get({
      scopeType: 'BRANCH',
      branchId: branch,
      documentPurpose: candidatePurpose,
    }), purposeCandidates)
    const documentDefaultPreference = firstPreference((candidatePurpose) => hierarchyStore.get({
      scopeType: 'DOCUMENT_DEFAULT',
      documentPurpose: candidatePurpose,
    }), purposeCandidates)
    const platformDefaultPreference = hierarchyStore.get({
      scopeType: 'PLATFORM_DEFAULT',
      documentPurpose: '*',
    })

    const payload = await transport.listPrinters()
    const bindings = Object.freeze({
      USER: toBinding(userPreference, 'HIERARCHY_USER'),
      WORKSTATION: hierarchicalWorkstationPreference
        ? toBinding(hierarchicalWorkstationPreference, 'HIERARCHY_WORKSTATION')
        : toBinding(legacyWorkstationPreference, 'LEGACY_WORKSTATION'),
      BRANCH: toBinding(branchPreference, 'HIERARCHY_BRANCH'),
      DOCUMENT_DEFAULT: toBinding(documentDefaultPreference, 'HIERARCHY_DOCUMENT_DEFAULT'),
      PLATFORM_DEFAULT: toBinding(platformDefaultPreference, 'HIERARCHY_PLATFORM_DEFAULT'),
    })

    const resolution = resolveDocumentPrinter({
      documentPurpose: purpose,
      bindings,
      printers: normalizePrinters(payload),
    })

    return Object.freeze({
      branchId: branch,
      workstationId: workstation,
      userId: user,
      documentPurpose: purpose,
      purposeCandidates: Object.freeze([...purposeCandidates]),
      bindings,
      resolution,
      warning: payload?.warning || null,
    })
  }

  return Object.freeze({ resolve })
}

export { createHierarchicalPrinterResolverService }
export default createHierarchicalPrinterResolverService
