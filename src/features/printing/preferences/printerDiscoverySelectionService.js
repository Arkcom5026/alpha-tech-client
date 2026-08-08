import { DOCUMENT_PURPOSES } from './createPrinterPreferenceContract.js'

const DOCUMENT_PURPOSE_SET = new Set(DOCUMENT_PURPOSES)
const RECEIPT_PURPOSES = new Set([
  'RECEIPT',
  'SALE_RECEIPT',
  'SHORT_TAX_INVOICE',
  'DELIVERY_NOTE',
  'REPAIR_INTAKE',
  'REPAIR_RETURN',
])
const A4_PURPOSES = new Set([
  'A4_DOCUMENT',
  'FULL_TAX_INVOICE',
])

const requireText = (value, field) => {
  const normalized = String(value || '').trim()
  if (!normalized) throw new TypeError(`${field} is required`)
  return normalized
}

const requirePurpose = (value) => {
  const purpose = requireText(value, 'documentPurpose')
  if (!DOCUMENT_PURPOSE_SET.has(purpose)) {
    throw new TypeError(`Unsupported documentPurpose: ${purpose}`)
  }
  return purpose
}

const normalizePrinter = (printer) => {
  if (!printer || typeof printer !== 'object') return null

  const id = String(printer.id || '').trim()
  const name = String(printer.name || '').trim()
  const connection = String(printer.connection || '').trim()
  if (!id || !name || !connection) return null

  return Object.freeze({
    ...printer,
    id,
    name,
    connection,
    queueAuthority: printer.queueAuthority == null
      ? null
      : String(printer.queueAuthority).trim() || null,
    isOnline: printer.isOnline !== false && printer.workOffline !== true,
    capabilities: Object.freeze({ ...(printer.capabilities || {}) }),
  })
}

const scorePrinterForPurpose = (printer, documentPurpose) => {
  let score = printer.isOnline ? 100 : -1000
  const searchable = `${printer.name} ${printer.driverName || ''}`.toLowerCase()
  const paperWidthMm = Number(printer.paperWidthMm || 0)

  if (documentPurpose === 'BARCODE_LABEL') {
    if (/barcode|label|zebra|tsc|brother ql/.test(searchable)) score += 80
    if (printer.capabilities?.raw) score += 15
  } else if (A4_PURPOSES.has(documentPurpose)) {
    if (paperWidthMm >= 200) score += 80
    if (/a4|laser|inkjet|canon|brother|hp|epson l/.test(searchable)) score += 30
    if (/receipt|pos|thermal|tm-t|80mm|58mm/.test(searchable)) score -= 50
  } else if (RECEIPT_PURPOSES.has(documentPurpose)) {
    if (paperWidthMm > 0 && paperWidthMm <= 100) score += 70
    if (/receipt|pos|thermal|80mm|58mm/.test(searchable)) score += 50
    if (printer.capabilities?.driverManaged || printer.capabilities?.raw) score += 20
  }

  if (printer.connection === 'MOCK') score -= 20
  return score
}

const createPrinterDiscoverySelectionService = ({
  transport,
  preferenceStore,
  now = () => new Date(),
} = {}) => {
  if (!transport || typeof transport.listPrinters !== 'function') {
    throw new TypeError('transport.listPrinters is required')
  }
  if (!preferenceStore || typeof preferenceStore.get !== 'function' || typeof preferenceStore.save !== 'function') {
    throw new TypeError('preferenceStore get/save methods are required')
  }

  const discover = async ({ documentPurpose } = {}) => {
    const purpose = requirePurpose(documentPurpose)
    const payload = await transport.listPrinters()
    const printers = Array.isArray(payload?.printers)
      ? payload.printers.map(normalizePrinter).filter(Boolean)
      : []

    return Object.freeze({
      documentPurpose: purpose,
      warning: payload?.warning || null,
      printers: Object.freeze(printers
        .map((printer) => Object.freeze({
          ...printer,
          recommendationScore: scorePrinterForPurpose(printer, purpose),
        }))
        .sort((left, right) => (
          right.recommendationScore - left.recommendationScore ||
          left.name.localeCompare(right.name)
        ))),
    })
  }

  const resolve = async (scope = {}) => {
    const branchId = requireText(scope.branchId, 'branchId')
    const workstationId = requireText(scope.workstationId, 'workstationId')
    const documentPurpose = requirePurpose(scope.documentPurpose)
    const preference = preferenceStore.get({ branchId, workstationId, documentPurpose })
    const discovery = await discover({ documentPurpose })
    const selectedPrinter = preference
      ? discovery.printers.find((printer) => printer.id === preference.printerProfileId) || null
      : null

    return Object.freeze({
      branchId,
      workstationId,
      documentPurpose,
      preference,
      selectedPrinter,
      selectionStatus: !preference
        ? 'NOT_CONFIGURED'
        : selectedPrinter?.isOnline
          ? 'READY'
          : 'UNAVAILABLE',
      printers: discovery.printers,
      warning: discovery.warning,
    })
  }

  const select = async ({
    branchId,
    workstationId,
    documentPurpose,
    printerProfileId,
  } = {}) => {
    const normalizedScope = {
      branchId: requireText(branchId, 'branchId'),
      workstationId: requireText(workstationId, 'workstationId'),
      documentPurpose: requirePurpose(documentPurpose),
    }
    const requestedPrinterId = requireText(printerProfileId, 'printerProfileId')
    const discovery = await discover({ documentPurpose: normalizedScope.documentPurpose })
    const printer = discovery.printers.find((candidate) => candidate.id === requestedPrinterId)

    if (!printer) {
      const error = new Error(`Printer is not available from the local bridge: ${requestedPrinterId}`)
      error.code = 'PRINTER_NOT_DISCOVERED'
      throw error
    }
    if (!printer.isOnline) {
      const error = new Error(`Printer is offline: ${requestedPrinterId}`)
      error.code = 'PRINTER_OFFLINE'
      throw error
    }

    return preferenceStore.save({
      ...normalizedScope,
      printerProfileId: printer.id,
      printerName: printer.name,
      connection: printer.connection,
      queueAuthority: printer.queueAuthority,
      updatedAt: now().toISOString(),
    })
  }

  const clear = (scope = {}) => {
    if (typeof preferenceStore.remove !== 'function') {
      throw new TypeError('preferenceStore.remove is required')
    }
    return preferenceStore.remove({
      branchId: requireText(scope.branchId, 'branchId'),
      workstationId: requireText(scope.workstationId, 'workstationId'),
      documentPurpose: requirePurpose(scope.documentPurpose),
    })
  }

  return Object.freeze({ discover, resolve, select, clear })
}

export {
  createPrinterDiscoverySelectionService,
  scorePrinterForPurpose,
}

export default createPrinterDiscoverySelectionService
