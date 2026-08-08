import { resolveDocumentPrinter } from '../preferences/documentPrinterResolutionPolicy.js'

const fail = (code, message) => {
  const error = new Error(message)
  error.code = code
  throw error
}

const resolveDocumentPrintTarget = ({
  documentPurpose,
  bindings = {},
  printers = [],
} = {}) => {
  const resolution = resolveDocumentPrinter({
    documentPurpose,
    bindings,
    printers,
  })

  if (resolution.status !== 'READY' || !resolution.printer?.id) {
    fail(
      'PRINT_TARGET_UNAVAILABLE',
      `No ready printer target for ${documentPurpose}`,
    )
  }

  return Object.freeze({
    documentPurpose: resolution.documentPurpose,
    printerProfileId: resolution.printer.id,
    resolution,
  })
}

export {
  resolveDocumentPrintTarget,
}

export default resolveDocumentPrintTarget
