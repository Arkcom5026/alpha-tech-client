const DOCUMENT_TYPE_BY_PURPOSE = Object.freeze({
  SALE_RECEIPT: 'RECEIPT',
  RECEIPT: 'RECEIPT',
  SHORT_TAX_INVOICE: 'SHORT_TAX_INVOICE',
  FULL_TAX_INVOICE: 'DELIVERY_NOTE',
  DELIVERY_NOTE: 'DELIVERY_NOTE',
  REPAIR_INTAKE: 'REPAIR_INTAKE',
  REPAIR_RETURN: 'REPAIR_RETURN',
  BARCODE_LABEL: 'BARCODE_LABEL',
  A4_DOCUMENT: 'DELIVERY_NOTE',
})

const requireText = (value, field) => {
  const normalized = String(value || '').trim()
  if (!normalized) throw new TypeError(`${field} is required`)
  return normalized
}

const createPrinterTestJob = ({
  branchId,
  workstationId,
  documentPurpose,
  printerProfileId,
  now = () => Date.now(),
} = {}) => {
  const normalizedPurpose = requireText(documentPurpose, 'documentPurpose')
  const documentType = DOCUMENT_TYPE_BY_PURPOSE[normalizedPurpose]
  if (!documentType) throw new TypeError(`Unsupported documentPurpose: ${normalizedPurpose}`)

  const timestamp = Number(now())
  if (!Number.isFinite(timestamp)) throw new TypeError('now must return a finite timestamp')

  return Object.freeze({
    jobId: `printer-settings-test-${timestamp}`,
    branchId: requireText(branchId, 'branchId'),
    workstationId: requireText(workstationId, 'workstationId'),
    printerProfileId: requireText(printerProfileId, 'printerProfileId'),
    documentType,
    snapshot: Object.freeze({
      testPrint: true,
      documentPurpose: normalizedPurpose,
      title: 'ALPHA-TECH PRINTER TEST',
      message: 'NO CUSTOMER DATA',
      requestedAt: new Date(timestamp).toISOString(),
    }),
    options: Object.freeze({
      raw: false,
      cut: false,
      cashDrawer: false,
      testPrint: true,
    }),
  })
}

const createPrinterTestService = ({
  transport,
  now = () => Date.now(),
} = {}) => {
  if (!transport || typeof transport.dispatchPrintJob !== 'function') {
    throw new TypeError('transport dispatchPrintJob authority is required')
  }

  const test = async ({
    branchId,
    workstationId,
    documentPurpose,
    printerProfileId,
  } = {}) => {
    const printJob = createPrinterTestJob({
      branchId,
      workstationId,
      documentPurpose,
      printerProfileId,
      now,
    })
    const response = await transport.dispatchPrintJob(printJob)
    const result = response?.result

    if (!response?.accepted || result?.status !== 'PRINTED') {
      const error = new Error('Local Print Bridge did not confirm the test print')
      error.code = 'PRINTER_TEST_NOT_CONFIRMED'
      throw error
    }

    return Object.freeze({
      printJob,
      result: Object.freeze({ ...result }),
    })
  }

  return Object.freeze({ test })
}

export {
  DOCUMENT_TYPE_BY_PURPOSE,
  createPrinterTestJob,
  createPrinterTestService,
}

export default createPrinterTestService
