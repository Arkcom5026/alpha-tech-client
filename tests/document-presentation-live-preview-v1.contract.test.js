import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const read = (relativePath) => fs.readFileSync(path.resolve(__dirname, '..', relativePath), 'utf8')

const fixtureSource = read('src/features/settings/documentPreview/documentPreviewFixtures.js')
const previewSource = read('src/features/settings/documentPreview/DocumentPresentationLivePreview.jsx')
const settingsPageSource = read('src/features/settings/pages/DocumentFormatSettingsPage.jsx')

const settingsCards = [
  'src/features/settings/components/QuotationPresentationSettingsCard.jsx',
  'src/features/settings/components/DeliveryNotePresentationSettingsCard.jsx',
  'src/features/settings/components/CustomerReceiptPresentationSettingsCard.jsx',
  'src/features/settings/components/PurchaseOrderPresentationSettingsCard.jsx',
  'src/features/settings/components/CombinedBillingPresentationSettingsCard.jsx',
  'src/features/settings/components/FinanceOperationalPresentationSettingsCard.jsx',
  'src/features/settings/components/StatutoryPresentationSettingsCard.jsx',
]

const canonicalPurposes = [
  'QUOTATION',
  'DELIVERY_NOTE',
  'CUSTOMER_RECEIPT',
  'CUSTOMER_MONEY_RECEIPT',
  'DELIVERY_CREDIT_SETTLEMENT',
  'REFUND_RECEIPT',
  'PURCHASE_ORDER',
  'COMBINED_BILLING',
  'FULL_TAX_INVOICE',
  'CREDIT_NOTE',
  'SHORT_TAX_INVOICE',
]

describe('Document Presentation Live Preview V1 contract', () => {
  it('defines one canonical preview fixture for every document workspace', () => {
    for (const purpose of canonicalPurposes) {
      expect(fixtureSource).toContain(`${purpose}: {`)
    }
    expect(fixtureSource).toMatch(/SHORT_TAX_INVOICE:[\s\S]*?rendererFamily:\s*'THERMAL'/)
    expect(fixtureSource).toMatch(/FULL_TAX_INVOICE:[\s\S]*?rendererFamily:\s*'A4'/)
  })

  it('projects unsaved presentation through V2 merge and the canonical header resolver', () => {
    expect(previewSource).toContain('upsertDocumentPresentationLayer')
    expect(previewSource).toContain('buildStoreDocumentHeader')
    expect(previewSource).toContain('draftLayer')
    expect(previewSource).toContain('data-testid="document-presentation-live-preview"')
    expect(previewSource).toContain('data-renderer-family="A4"')
    expect(previewSource).toContain('data-renderer-family="THERMAL"')
    expect(previewSource).not.toMatch(/updateBranch|createQuotation|issueQuotation|window\.print/)
  })

  it('keeps document-specific settings cards on the shared live preview surface', () => {
    for (const file of settingsCards) {
      const source = read(file)
      expect(source, file).toContain('DocumentPresentationLivePreview')
      expect(source, file).toContain('draftLayer=')
    }
  })

  it('reuses document-owned semantic footer primitives instead of duplicating footer semantics', () => {
    expect(read(settingsCards[0])).toContain('QuotationPresentationFooter')
    expect(read(settingsCards[1])).toContain('DeliveryNotePresentationFooter')
    expect(read(settingsCards[2])).toContain('CustomerReceiptPresentationFooter')
    expect(read(settingsCards[3])).toContain('PurchaseOrderPresentationFooter')
    expect(read(settingsCards[4])).toContain('CombinedBillingPresentationFooter')
    expect(read(settingsCards[5])).toContain('FinanceOperationalPresentationFooter')
    expect(read(settingsCards[6])).toContain('StatutoryTaxPresentationFooter')
  })

  it('preserves the single settings entry point and all document workspace mappings', () => {
    expect(settingsPageSource).toContain('document-format-workspace-selector')
    expect(settingsPageSource).toContain('QuotationPresentationSettingsCard')
    expect(settingsPageSource).toContain('DeliveryNotePresentationSettingsCard')
    expect(settingsPageSource).toContain('CustomerReceiptPresentationSettingsCard')
    expect(settingsPageSource).toContain('PurchaseOrderPresentationSettingsCard')
    expect(settingsPageSource).toContain('CombinedBillingPresentationSettingsCard')
    expect(settingsPageSource).toContain('FinanceOperationalPresentationSettingsCard')
    expect(settingsPageSource).toContain('StatutoryPresentationSettingsCard')
  })

  it('keeps statutory authority visible and thermal geometry explicit', () => {
    expect(previewSource).toContain('ข้อมูลทางกฎหมายในตัวอย่างนี้เป็นข้อมูลล็อกโดยระบบ')
    expect(previewSource).toContain('w-[80mm]')
    expect(read(settingsCards[6])).toContain("documentPurpose === 'SHORT_TAX_INVOICE'")
  })
})
