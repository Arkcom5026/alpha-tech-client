import { SUPPORTED_DOCUMENT_PURPOSE_CODES } from './documentPurposeCatalog.js'

const DOCUMENT_PURPOSES = SUPPORTED_DOCUMENT_PURPOSE_CODES
const DOCUMENT_PURPOSE_SET = new Set(DOCUMENT_PURPOSES)

const requireText = (value, field) => {
  const normalized = String(value || '').trim()
  if (!normalized) throw new TypeError(`${field} is required`)
  return normalized
}

const createPrinterPreferenceContract = ({
  branchId,
  workstationId,
  documentPurpose,
  printerProfileId,
  printerName,
  connection,
  queueAuthority = null,
  updatedAt = new Date().toISOString(),
} = {}) => {
  const normalizedPurpose = requireText(documentPurpose, 'documentPurpose')

  if (!DOCUMENT_PURPOSE_SET.has(normalizedPurpose)) {
    throw new TypeError(`Unsupported documentPurpose: ${normalizedPurpose}`)
  }

  return Object.freeze({
    branchId: requireText(branchId, 'branchId'),
    workstationId: requireText(workstationId, 'workstationId'),
    documentPurpose: normalizedPurpose,
    printerProfileId: requireText(printerProfileId, 'printerProfileId'),
    printerName: requireText(printerName, 'printerName'),
    connection: requireText(connection, 'connection'),
    queueAuthority: queueAuthority == null ? null : requireText(queueAuthority, 'queueAuthority'),
    updatedAt: requireText(updatedAt, 'updatedAt'),
  })
}

const createPrinterPreferenceKey = ({ branchId, workstationId, documentPurpose } = {}) => [
  requireText(branchId, 'branchId'),
  requireText(workstationId, 'workstationId'),
  requireText(documentPurpose, 'documentPurpose'),
].map(encodeURIComponent).join(':')

export {
  DOCUMENT_PURPOSES,
  createPrinterPreferenceContract,
  createPrinterPreferenceKey,
}

export default createPrinterPreferenceContract
