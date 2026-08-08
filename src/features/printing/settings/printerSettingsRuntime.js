import { createLocalPrintBridgeTransport } from '../authority/localPrintBridgeTransport.js'
import {
  createHierarchicalPrinterPreferenceStore,
  createHierarchicalPrinterResolverService,
  createPrinterDiscoverySelectionService,
  createPrinterPreferenceStore,
} from '../preferences/index.js'
import { createPrinterScopeManagementService } from './printerScopeManagementService.js'
import { createPrinterTestService } from './printerTestService.js'
import { createPrinterSettingsApi } from './printerSettingsApi.js'
import { createServerPrinterSettingsService } from './serverPrinterSettingsService.js'

const WORKSTATION_STORAGE_KEY = 'alpha-tech.printing.workstation-id.v1'

const createWorkstationId = ({ cryptoImpl = globalThis.crypto } = {}) => {
  if (typeof cryptoImpl?.randomUUID === 'function') {
    return `workstation-${cryptoImpl.randomUUID()}`
  }

  return `workstation-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

const resolveWorkstationId = ({ storage, cryptoImpl } = {}) => {
  if (!storage || typeof storage.getItem !== 'function' || typeof storage.setItem !== 'function') {
    throw new TypeError('storage adapter is required')
  }

  const existing = String(storage.getItem(WORKSTATION_STORAGE_KEY) || '').trim()
  if (existing) return existing

  const workstationId = createWorkstationId({ cryptoImpl })
  storage.setItem(WORKSTATION_STORAGE_KEY, workstationId)
  return workstationId
}

const createPrinterSettingsRuntime = ({
  storage,
  fetchImpl = globalThis.fetch,
  cryptoImpl = globalThis.crypto,
  baseUrl,
  apiClient,
} = {}) => {
  const preferenceStore = createPrinterPreferenceStore({ storage })
  const hierarchyStore = createHierarchicalPrinterPreferenceStore({ storage })
  const transport = createLocalPrintBridgeTransport({ baseUrl, fetchImpl })
  const discoverySelectionService = createPrinterDiscoverySelectionService({
    transport,
    preferenceStore,
  })
  const hierarchicalResolverService = createHierarchicalPrinterResolverService({
    transport,
    legacyPreferenceStore: preferenceStore,
    hierarchyStore,
  })
  const printerScopeManagementService = createPrinterScopeManagementService({
    discoverySelectionService,
    hierarchyStore,
    hierarchicalResolverService,
  })
  const printerTestService = createPrinterTestService({ transport })
  const printerSettingsApi = createPrinterSettingsApi({ client: apiClient })
  const serverPrinterSettingsService = createServerPrinterSettingsService({ api: printerSettingsApi })

  return Object.freeze({
    workstationId: resolveWorkstationId({ storage, cryptoImpl }),
    transport,
    preferenceStore,
    hierarchyStore,
    discoverySelectionService,
    hierarchicalResolverService,
    printerScopeManagementService,
    printerTestService,
    printerSettingsApi,
    serverPrinterSettingsService,
  })
}

export {
  WORKSTATION_STORAGE_KEY,
  createPrinterSettingsRuntime,
  createWorkstationId,
  resolveWorkstationId,
}

export default createPrinterSettingsRuntime
