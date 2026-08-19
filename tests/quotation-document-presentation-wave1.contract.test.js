import assert from 'node:assert/strict'
import {
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
        blocks: {
          PAYMENT_TERMS: { visible: true, content: 'ชำระภายใน 7 วัน' },
          NOTES: { visible: true, content: 'หมายเหตุจากร้าน' },
          CUSTOM_FOOTER: { visible: true, content: 'ขอบคุณที่ไว้วางใจ' },
        },
        paymentAccountSelection: { accountIds: [2, 1] },
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

console.log('quotation-document-presentation-wave1.contract.test.js: PASS')
