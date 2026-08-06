const PRINT_DOCUMENT_TYPES = Object.freeze({
  SHORT_TAX_RECEIPT: 'SHORT_TAX_RECEIPT',
  RECEIPT: 'RECEIPT',
  DELIVERY_NOTE: 'DELIVERY_NOTE',
  REPAIR_INTAKE: 'REPAIR_INTAKE',
  BARCODE_LABEL: 'BARCODE_LABEL',
})

const PRINT_JOB_STATUSES = Object.freeze({
  CREATED: 'CREATED',
  DISPATCHING: 'DISPATCHING',
  PRINTED: 'PRINTED',
  FAILED: 'FAILED',
})

const assertNonEmptyString = (value, fieldName) => {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new TypeError(`${fieldName} must be a non-empty string`)
  }

  return value.trim()
}

const assertPositiveInteger = (value, fieldName) => {
  if (!Number.isInteger(value) || value <= 0) {
    throw new TypeError(`${fieldName} must be a positive integer`)
  }

  return value
}

const createPrintJobContract = ({
  jobId,
  documentType,
  documentId,
  documentNumber,
  branchId,
  workstationId,
  printerProfileId,
  revision = 1,
  snapshot,
  requestedAt = new Date().toISOString(),
}) => {
  if (!Object.values(PRINT_DOCUMENT_TYPES).includes(documentType)) {
    throw new TypeError(`Unsupported print document type: ${documentType}`)
  }

  if (!snapshot || typeof snapshot !== 'object' || Array.isArray(snapshot)) {
    throw new TypeError('snapshot must be an object')
  }

  return Object.freeze({
    jobId: assertNonEmptyString(jobId, 'jobId'),
    documentType,
    documentId: assertNonEmptyString(String(documentId), 'documentId'),
    documentNumber: assertNonEmptyString(documentNumber, 'documentNumber'),
    branchId: assertPositiveInteger(Number(branchId), 'branchId'),
    workstationId: assertNonEmptyString(workstationId, 'workstationId'),
    printerProfileId: assertNonEmptyString(printerProfileId, 'printerProfileId'),
    revision: assertPositiveInteger(Number(revision), 'revision'),
    requestedAt: assertNonEmptyString(requestedAt, 'requestedAt'),
    status: PRINT_JOB_STATUSES.CREATED,
    snapshot: Object.freeze({ ...snapshot }),
  })
}

export {
  PRINT_DOCUMENT_TYPES,
  PRINT_JOB_STATUSES,
  createPrintJobContract,
}

export default createPrintJobContract
