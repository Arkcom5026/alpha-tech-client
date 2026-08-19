import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  aliasesForCanonicalDocumentCode,
  toCanonicalDocumentCode,
} from '../src/features/printing/presentation/canonicalDocumentIdentity.js'
import {
  canStoreConfigureBlock,
  getDocumentPresentationCapability,
} from '../src/features/printing/presentation/presentationCapabilityRegistry.js'
import {
  bridgeV1DocumentHeaderConfig,
  normalizeDocumentPresentationConfig,
  resolveDocumentPresentation,
} from '../src/features/printing/presentation/presentationConfig.js'
import { createPresentationSnapshotEnvelope } from '../src/features/printing/presentation/presentationSnapshot.js'

assert.equal(toCanonicalDocumentCode('receipt'), 'SALE_RECEIPT')
assert.equal(toCanonicalDocumentCode('short-tax-receipt'), 'SHORT_TAX_INVOICE')
assert.ok(aliasesForCanonicalDocumentCode('SALE_RECEIPT').includes('RECEIPT'))

assert.equal(getDocumentPresentationCapability('QUOTATION').className, 'COMMERCIAL')
assert.equal(canStoreConfigureBlock('QUOTATION', 'PAYMENT_ACCOUNT'), true)
assert.equal(canStoreConfigureBlock('FULL_TAX_INVOICE', 'TOTALS'), false)

const bridged = bridgeV1DocumentHeaderConfig({
  version: 1,
  default: { logoPosition: 'center', logoSize: 'lg', storeName: 'Alpha' },
  documents: { RECEIPT: { textAlign: 'right' } },
})
assert.equal(bridged.version, 2)
assert.equal(bridged.shared.header.logoSize, 72)
assert.equal(bridged.documents.SALE_RECEIPT.header.textAlign, 'right')

const normalized = normalizeDocumentPresentationConfig({
  version: 2,
  shared: {
    typography: { body: 'lg', invalid: 'giant' },
    blocks: { CUSTOM_FOOTER: { visible: true, content: 'ขอบคุณ', typography: 'sm' } },
  },
  documents: {
    QUOTATION: { paymentAccountSelection: { accountIds: [9, 9, 10, 0], showBankName: true } },
  },
})
assert.deepEqual(normalized.shared.typography, { body: 'lg' })
assert.deepEqual(normalized.documents.QUOTATION.paymentAccountSelection.accountIds, [9, 10])

const resolved = resolveDocumentPresentation({
  systemDefault: { version: 2, shared: { typography: { body: 'sm' } } },
  storeConfig: normalized,
  documentPurpose: 'quotation',
  perDocumentOverride: { typography: { body: 'xl' } },
})
assert.equal(resolved.documentPurpose, 'QUOTATION')
assert.equal(resolved.resolved.typography.body, 'xl')
assert.equal(resolved.resolved.blocks.CUSTOM_FOOTER.content, 'ขอบคุณ')

const statutory = resolveDocumentPresentation({
  storeConfig: {
    version: 2,
    shared: {
      blocks: {
        TOTALS: { visible: false, content: 'must never override tax totals' },
        CUSTOM_FOOTER: { visible: true, content: 'ข้อความร้าน' },
      },
      paymentAccountSelection: { accountIds: [9] },
    },
  },
  documentPurpose: 'FULL_TAX_INVOICE',
})
assert.equal(statutory.resolved.blocks.TOTALS, undefined)
assert.equal(statutory.resolved.blocks.CUSTOM_FOOTER.content, 'ข้อความร้าน')
assert.equal(statutory.resolved.paymentAccountSelection, undefined)

const envelope = createPresentationSnapshotEnvelope({
  businessSnapshot: { documentNo: 'Q-001' },
  presentation: resolved,
  documentPurpose: 'QUOTATION',
  rendererFamily: 'A4',
  issuedAt: '2026-08-19T05:00:00.000Z',
})
assert.equal(envelope.documentPurpose, 'QUOTATION')
assert.equal(envelope.presentation.resolved.typography.body, 'xl')

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const headerSource = fs.readFileSync(
  path.resolve(__dirname, '../src/features/branch/documentHeader/documentHeaderConfig.js'),
  'utf8',
)
assert.match(headerSource, /Number\(config\?\.version\) === 2/)
assert.match(headerSource, /config\?\.shared\?\.header/)
assert.match(headerSource, /currentConfig\?\.version\) === 2/)
assert.match(headerSource, /toCanonicalDocumentCode/)

const paymentApiSource = fs.readFileSync(
  path.resolve(__dirname, '../src/features/printing/presentation/storePaymentAccountApi.js'),
  'utf8',
)
assert.match(paymentApiSource, /\/finance\/store-payment-accounts/)
assert.doesNotMatch(paymentApiSource, /console\.(?:log|error|warn)/)

console.log('document-presentation-v2-foundation.contract.test.js: PASS')
