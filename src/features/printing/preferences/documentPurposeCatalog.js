const SYSTEM_DOCUMENT_PURPOSES = Object.freeze([
  Object.freeze({
    code: 'SALE_RECEIPT',
    displayName: 'ใบเสร็จรับเงิน',
    categoryCode: 'SALES',
    printEligible: true,
  }),
  Object.freeze({
    code: 'DELIVERY_NOTE',
    displayName: 'ใบส่งสินค้า',
    categoryCode: 'SALES',
    printEligible: true,
  }),
  Object.freeze({
    code: 'SHORT_TAX_INVOICE',
    displayName: 'ใบกำกับภาษีอย่างย่อ',
    categoryCode: 'TAX',
    printEligible: true,
  }),
  Object.freeze({
    code: 'FULL_TAX_INVOICE',
    displayName: 'ใบกำกับภาษีเต็มรูป',
    categoryCode: 'TAX',
    printEligible: true,
  }),
])

const SYSTEM_DOCUMENT_PURPOSE_CODES = Object.freeze(
  SYSTEM_DOCUMENT_PURPOSES.map((purpose) => purpose.code),
)

const LEGACY_DOCUMENT_PURPOSE_CODES = Object.freeze([
  'RECEIPT',
  'REPAIR_INTAKE',
  'REPAIR_RETURN',
  'BARCODE_LABEL',
  'A4_DOCUMENT',
])

const DOCUMENT_PURPOSE_ALIASES = Object.freeze({
  SALE_RECEIPT: Object.freeze(['RECEIPT']),
})

const SUPPORTED_DOCUMENT_PURPOSE_CODES = Object.freeze([
  ...SYSTEM_DOCUMENT_PURPOSE_CODES,
  ...LEGACY_DOCUMENT_PURPOSE_CODES.filter((code) => !SYSTEM_DOCUMENT_PURPOSE_CODES.includes(code)),
])

const getLegacyDocumentPurposeAliases = (documentPurpose) => Object.freeze([
  ...(DOCUMENT_PURPOSE_ALIASES[String(documentPurpose || '').trim()] || []),
])

export {
  DOCUMENT_PURPOSE_ALIASES,
  LEGACY_DOCUMENT_PURPOSE_CODES,
  SUPPORTED_DOCUMENT_PURPOSE_CODES,
  SYSTEM_DOCUMENT_PURPOSE_CODES,
  SYSTEM_DOCUMENT_PURPOSES,
  getLegacyDocumentPurposeAliases,
}
