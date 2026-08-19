import { resolveDocumentPresentation } from './presentationConfig.js'

const isObject = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value)
const text = (value) => String(value ?? '').trim()

const STATUTORY_HEADER_VISUAL_KEYS = Object.freeze([
  'showLogo',
  'logoUrl',
  'logoPosition',
  'logoSize',
  'textAlign',
  'storeNameSize',
])

const pickStatutoryHeaderVisuals = (header) => {
  if (!isObject(header)) return {}
  return Object.fromEntries(
    STATUTORY_HEADER_VISUAL_KEYS
      .filter((key) => Object.prototype.hasOwnProperty.call(header, key))
      .map((key) => [key, header[key]]),
  )
}

const legalIssuerHeader = ({ issuer, presentation } = {}) => {
  const visual = pickStatutoryHeaderVisuals(presentation?.resolved?.header)
  return {
    ...visual,
    showStoreName: true,
    showAddress: true,
    showTaxId: true,
    storeName: text(issuer?.legalName) || '-',
    address: text(issuer?.registeredAddress) || '-',
    taxId: text(issuer?.taxId) || '-',
    phone: text(issuer?.phone) || '',
  }
}

const resolveStatutoryPresentation = ({
  storeConfig,
  documentPurpose,
  presentationSnapshot,
  issuer,
} = {}) => {
  const presentation = resolveDocumentPresentation({
    storeConfig,
    documentPurpose,
    issuedSnapshot: presentationSnapshot,
  })
  return {
    ...presentation,
    legalHeader: legalIssuerHeader({ issuer, presentation }),
  }
}

const visibleStatutoryBlockContent = (presentation, blockType) => {
  const block = presentation?.resolved?.blocks?.[blockType]
  if (!isObject(block) || block.visible === false) return ''
  return text(block.content)
}

export {
  STATUTORY_HEADER_VISUAL_KEYS,
  legalIssuerHeader,
  pickStatutoryHeaderVisuals,
  resolveStatutoryPresentation,
  visibleStatutoryBlockContent,
}
