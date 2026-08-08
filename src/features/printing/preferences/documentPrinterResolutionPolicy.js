const RESOLUTION_LEVELS = Object.freeze([
  'USER',
  'WORKSTATION',
  'BRANCH',
  'DOCUMENT_DEFAULT',
  'PLATFORM_DEFAULT',
])

const requireText = (value, field) => {
  const normalized = String(value || '').trim()
  if (!normalized) throw new TypeError(`${field} is required`)
  return normalized
}

const normalizeBinding = (binding, authorityLevel) => {
  if (binding == null) return null
  if (!binding || typeof binding !== 'object') {
    throw new TypeError(`${authorityLevel} printer binding must be an object`)
  }

  return Object.freeze({
    authorityLevel,
    printerProfileId: requireText(binding.printerProfileId, `${authorityLevel}.printerProfileId`),
    printerName: binding.printerName == null ? null : requireText(binding.printerName, `${authorityLevel}.printerName`),
    source: binding.source == null ? null : String(binding.source).trim() || null,
    metadata: Object.freeze({ ...(binding.metadata || {}) }),
  })
}

const normalizePrinter = (printer) => {
  if (!printer || typeof printer !== 'object') return null
  const id = String(printer.id || printer.printerProfileId || '').trim()
  if (!id) return null

  return Object.freeze({
    ...printer,
    id,
    isOnline: printer.isOnline !== false && printer.workOffline !== true,
  })
}

const resolveDocumentPrinter = ({
  documentPurpose,
  bindings = {},
  printers = [],
} = {}) => {
  const purpose = requireText(documentPurpose, 'documentPurpose')
  const normalizedPrinters = Array.isArray(printers)
    ? printers.map(normalizePrinter).filter(Boolean)
    : []

  for (const authorityLevel of RESOLUTION_LEVELS) {
    const binding = normalizeBinding(bindings?.[authorityLevel], authorityLevel)
    if (!binding) continue

    const printer = normalizedPrinters.find((candidate) => candidate.id === binding.printerProfileId) || null

    if (!printer) {
      return Object.freeze({
        documentPurpose: purpose,
        authorityLevel,
        binding,
        printer: null,
        status: 'UNAVAILABLE',
        reason: 'CONFIGURED_PRINTER_NOT_DISCOVERED',
        fallbackBlocked: true,
      })
    }

    if (!printer.isOnline) {
      return Object.freeze({
        documentPurpose: purpose,
        authorityLevel,
        binding,
        printer,
        status: 'UNAVAILABLE',
        reason: 'CONFIGURED_PRINTER_OFFLINE',
        fallbackBlocked: true,
      })
    }

    return Object.freeze({
      documentPurpose: purpose,
      authorityLevel,
      binding,
      printer,
      status: 'READY',
      reason: null,
      fallbackBlocked: false,
    })
  }

  return Object.freeze({
    documentPurpose: purpose,
    authorityLevel: null,
    binding: null,
    printer: null,
    status: 'NOT_CONFIGURED',
    reason: 'NO_PRINTER_BINDING_CONFIGURED',
    fallbackBlocked: false,
  })
}

export {
  RESOLUTION_LEVELS,
  resolveDocumentPrinter,
}

export default resolveDocumentPrinter
