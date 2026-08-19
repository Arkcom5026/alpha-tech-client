import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import {
  quotationTypographyPx,
  resolveQuotationPaymentAccountDisplay,
  resolveQuotationPaymentAccounts,
  resolveQuotationPresentation,
  resolveQuotationTerms,
} from '../src/features/quotation/presentation/quotationPresentation.js'

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

const printPageSource = readFileSync(
  new URL('../src/features/quotation/pages/QuotationPrintPage.jsx', import.meta.url),
  'utf8',
)
const footerSource = readFileSync(
  new URL('../src/features/quotation/components/QuotationPresentationFooter.jsx', import.meta.url),
  'utf8',
)
assert.match(printPageSource, /resolveQuotationPresentation/, 'quotation renderer must resolve Draft vs Issued presentation authority')
assert.match(printPageSource, /listStorePaymentAccounts/, 'draft quotation must resolve selected active store payment accounts')
assert.match(printPageSource, /QuotationPresentationFooter/, 'quotation renderer must use the semantic presentation footer')
assert.match(printPageSource, /quotationTerms\.paymentTerms/, 'payment-term display must use document-over-store presentation precedence')
assert.match(footerSource, /บัญชีรับโอน/, 'semantic footer must render selected payment accounts')
assert.match(footerSource, /--quotation-footer-font-size/, 'semantic footer must consume constrained typography tokens')

console.log('quotation-document-presentation-wave1.contract.test.js: PASS')
