const ALLOWED_DOCUMENT_TYPES = new Set([
  'SHORT_TAX_INVOICE',
  'FULL_TAX_INVOICE',
  'RECEIPT',
  'DELIVERY_NOTE',
  'REPAIR_INTAKE',
  'REPAIR_RETURN',
  'BARCODE_LABEL',
])

const requireText = (value, field) => {
  const normalized = String(value || '').trim()
  if (!normalized) throw new TypeError(`${field} is required`)
  return normalized
}

const validatePrintJob = (job) => {
  if (!job || typeof job !== 'object' || Array.isArray(job)) {
    throw new TypeError('printJob must be an object')
  }

  const normalized = {
    jobId: requireText(job.jobId, 'jobId'),
    branchId: requireText(job.branchId, 'branchId'),
    workstationId: requireText(job.workstationId, 'workstationId'),
    printerProfileId: requireText(job.printerProfileId, 'printerProfileId'),
    documentType: requireText(job.documentType, 'documentType'),
    snapshot: job.snapshot,
    options: job.options && typeof job.options === 'object' ? job.options : {},
  }

  if (!ALLOWED_DOCUMENT_TYPES.has(normalized.documentType)) {
    throw new TypeError(`Unsupported documentType: ${normalized.documentType}`)
  }

  if (!normalized.snapshot || typeof normalized.snapshot !== 'object' || Array.isArray(normalized.snapshot)) {
    throw new TypeError('snapshot must be an object')
  }

  return Object.freeze({
    ...normalized,
    snapshot: structuredClone(normalized.snapshot),
    options: structuredClone(normalized.options),
  })
}

export { ALLOWED_DOCUMENT_TYPES, validatePrintJob }
export default validatePrintJob
