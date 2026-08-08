import test from 'node:test'
import assert from 'node:assert/strict'
import { createPrintProfileAuthority } from '../src/features/bill/print-profile/createPrintProfileAuthority.js'

test('publishes immutable branch-scoped receipt profile', () => {
  const authority = createPrintProfileAuthority()
  const revision = authority.createRevision({ profileId: 'receipt-main', branchId: 2, kind: 'RECEIPT_80', revision: 1, documentTypes: ['SHORT_TAX_INVOICE'], settings: { minimumHeightMm: 45 } })
  const published = authority.publish({ profileId: 'receipt-main', branchId: 2, revision: 1 })
  assert.equal(revision.published, false)
  assert.equal(published.published, true)
  assert.equal(authority.resolve({ profileId: 'receipt-main', branchId: 2, documentType: 'SHORT_TAX_INVOICE' }).revision, 1)
  assert.equal(authority.resolve({ profileId: 'receipt-main', branchId: 3, documentType: 'SHORT_TAX_INVOICE' }), null)
})

test('projects dynamic receipt height from actual content', () => {
  const authority = createPrintProfileAuthority()
  authority.createRevision({ profileId: 'receipt-main', branchId: 2, kind: 'RECEIPT_80', revision: 1, documentTypes: ['RECEIPT'], settings: { minimumHeightMm: 40 } })
  const profile = authority.publish({ profileId: 'receipt-main', branchId: 2, revision: 1 })
  assert.equal(authority.projectReceiptHeight({ profile, contentHeightMm: 159.06, feedMm: 8 }), 168)
  assert.equal(authority.projectReceiptHeight({ profile, contentHeightMm: 20, feedMm: 8 }), 40)
})

test('rejects incompatible document type', () => {
  const authority = createPrintProfileAuthority()
  authority.createRevision({ profileId: 'label', branchId: 2, kind: 'LABEL', revision: 1, documentTypes: ['BARCODE_LABEL'] })
  authority.publish({ profileId: 'label', branchId: 2, revision: 1 })
  assert.throws(() => authority.resolve({ profileId: 'label', branchId: 2, documentType: 'TAX_INVOICE' }), { code: 'PRINT_PROFILE_DOCUMENT_INCOMPATIBLE' })
})
