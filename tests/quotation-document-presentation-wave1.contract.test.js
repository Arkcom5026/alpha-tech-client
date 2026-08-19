import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import {
  quotationTypographyPx,
  resolveQuotationPaymentAccountDisplay,
  resolveQuotationPaymentAccounts,
  resolveQuotationPresentation,
  resolveQuotationTerms,
} from '../src/features/quotation/presentation/quotationPresentation.js'
import {
  upsertDocumentPresentationLayer,
} from '../src/features/printing/presentation/presentationConfig.js'

const branch = {
  documentHeaderConfig: {
    version: 2,
    shared: { typography: { body: 'md' } },
    documents: {
      QUOTATION: {
        typography: { footer: 'lg' },
        blocks: {
          PAYMENT_TERMS: { visible: true, content: 'ชำระภายใน 7 วัน' },
          NOTES: { visible: true, content: 'หมายเหตุจากร้าน' },
          CUSTOM_FOOTER: { visible: true, content: 'ขอบคุณที่ไว้วางใจ' },
        },
        paymentAccountSelection: {
          accountIds: [2, 1],
          showBankName: true,
          showAccountName: false,
          showAccountNumber: true,
        },
      },
    },
  },
}

const draft = { status: 'DRAFT', paymentTerms: '', notes: '', closingNote: 'ราคานี้มีอายุ 30 วัน' }
const draftPresentation = resolveQuotationPresentation({ quotation: draft, branch })
assert.equal(draftPresentation.documentPurpose, 'QUOTATION')
assert.equal(draftPresentation.resolved.blocks.PAYMENT_TERMS.content, 'ชำระภายใน 7 วัน')

const draftTerms = resolveQuotationTerms({ quotation: draft, presentation: draftPresentation })
assert.equal(draftTerms.paymentTerms, 'ชำระภายใน 7 วัน')
assert.equal(draftTerms.notes, 'หมายเหตุจากร้าน')
assert.equal(draftTerms.closingNote, 'ราคานี้มีอายุ 30 วัน')
assert.equal(quotationTypographyPx(draftPresentation, 'footer'), 12)
assert.deepEqual(resolveQuotationPaymentAccountDisplay(draftPresentation), {
  showBankName: true,
  showAccountName: false,
  showAccountNumber: true,
})

const activeAccounts = [
  { id: 1, accountNumber: '111' },
  { id: 2, accountNumber: '222' },
]
assert.deepEqual(
  resolveQuotationPaymentAccounts({ quotation: draft, activeAccounts, presentation: draftPresentation }).map((row) => row.id),
  [2, 1],
)

const issuedPresentation = {
  version: 2,
  documentPurpose: 'QUOTATION',
  resolved: {
    blocks: { PAYMENT_TERMS: { visible: true, content: 'เงื่อนไขเดิม ณ วันที่ออกเอกสาร' } },
    paymentAccountSelection: {
      accountIds: [9],
      showBankName: false,
      showAccountName: true,
      showAccountNumber: true,
    },
  },
}
const issued = {
  status: 'ISSUED',
  issuedSnapshot: {
    presentation: {
      snapshotVersion: 1,
      presentationVersion: 2,
      documentPurpose: 'QUOTATION',
      rendererFamily: 'A4',
      presentation: issuedPresentation,
    },
    paymentAccounts: [{ id: 9, accountNumber: '999' }],
  },
}
const resolvedIssued = resolveQuotationPresentation({ quotation: issued, branch })
assert.deepEqual(resolvedIssued, issuedPresentation)
assert.deepEqual(
  resolveQuotationPaymentAccounts({ quotation: issued, activeAccounts, presentation: resolvedIssued }).map((row) => row.id),
  [9],
)
assert.deepEqual(resolveQuotationPaymentAccountDisplay(resolvedIssued), {
  showBankName: false,
  showAccountName: true,
  showAccountNumber: true,
})

const upgraded = upsertDocumentPresentationLayer(
  {
    version: 1,
    default: { showLogo: true, storeName: 'ร้านเดิม' },
    documents: {},
  },
  'QUOTATION',
  {
    typography: { footer: 'xl' },
    blocks: { DELIVERY_TERMS: { visible: true, content: 'ส่งภายใน 7 วัน' } },
    paymentAccountSelection: { accountIds: [4] },
  },
)
assert.equal(upgraded.version, 2)
assert.equal(upgraded.shared.header.storeName, 'ร้านเดิม')
assert.equal(upgraded.documents.QUOTATION.typography.footer, 'xl')
assert.equal(upgraded.documents.QUOTATION.blocks.DELIVERY_TERMS.content, 'ส่งภายใน 7 วัน')
assert.deepEqual(upgraded.documents.QUOTATION.paymentAccountSelection.accountIds, [4])

const printPageSource = readFileSync(
  new URL('../src/features/quotation/pages/QuotationPrintPage.jsx', import.meta.url),
  'utf8',
)
const footerSource = readFileSync(
  new URL('../src/features/quotation/components/QuotationPresentationFooter.jsx', import.meta.url),
  'utf8',
)
const settingsPageSource = readFileSync(
  new URL('../src/features/settings/pages/DocumentFormatSettingsPage.jsx', import.meta.url),
  'utf8',
)
const settingsCardSource = readFileSync(
  new URL('../src/features/settings/components/QuotationPresentationSettingsCard.jsx', import.meta.url),
  'utf8',
)
assert.match(printPageSource, /resolveQuotationPresentation/, 'quotation renderer must resolve Draft vs Issued presentation authority')
assert.match(printPageSource, /listStorePaymentAccounts/, 'draft quotation must resolve selected active store payment accounts')
assert.match(printPageSource, /QuotationPresentationFooter/, 'quotation renderer must use the semantic presentation footer')
assert.match(printPageSource, /quotationTerms\.paymentTerms/, 'payment-term display must use document-over-store presentation precedence')
assert.match(footerSource, /บัญชีรับโอน/, 'semantic footer must render selected payment accounts')
assert.match(footerSource, /--quotation-footer-font-size/, 'semantic footer must consume constrained typography tokens')
assert.match(settingsPageSource, /QuotationPresentationSettingsCard/, 'document format settings must remain the single entry point for quotation presentation settings')
assert.match(settingsPageSource, /onBranchChange=\{setBranch\}/, 'saving quotation settings must update branch authority without resetting unsaved header form state')
assert.match(settingsCardSource, /upsertDocumentPresentationLayer/, 'quotation settings must write through the V2 compatibility-safe layer writer')
assert.match(settingsCardSource, /createStorePaymentAccount/, 'quotation settings must create branch-owned payment-account authority instead of free-text account blocks')
assert.match(settingsCardSource, /บันทึกใบเสนอราคา/, 'quotation settings must expose a dedicated document-type save action')

console.log('quotation-document-presentation-wave1.contract.test.js: PASS')
