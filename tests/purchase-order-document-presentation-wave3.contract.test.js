import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')

const page = read('src/features/purchaseOrder/print/pages/PrintPurchaseOrderPage.jsx')
const api = read('src/features/purchaseOrder/api/purchaseOrderApi.js')
const presentation = read('src/features/purchaseOrder/presentation/purchaseOrderPresentation.js')
const shell = read('src/features/purchaseOrder/print/workspace/components/PurchaseOrderPrintShell.jsx')
const footer = read('src/features/purchaseOrder/components/PurchaseOrderPresentationFooter.jsx')

describe('Purchase Order Document Presentation Wave 3', () => {
  it('loads an immutable presentation authority alongside the PO', () => {
    expect(api).toContain('getPurchaseOrderPresentation')
    expect(api).toContain('/presentation`')
    expect(page).toContain('Promise.all([')
    expect(page).toContain('getPurchaseOrderPresentation(id)')
    expect(page).toContain('presentationAuthority')
  })

  it('prefers the snapshot and resolves PURCHASE_ORDER presentation', () => {
    expect(presentation).toContain('presentationSnapshot')
    expect(presentation).toContain("documentPurpose: 'PURCHASE_ORDER'")
    expect(page).toContain('resolvePurchaseOrderPresentation')
    expect(page).toContain('applyPurchaseOrderHeaderPresentation')
  })

  it('removes branch-debug presentation and renders semantic header/footer', () => {
    expect(shell).not.toContain('Branch ID:')
    expect(shell).not.toContain('วันที่พิมพ์:')
    expect(shell).toContain('headerConfig')
    expect(shell).toContain('PurchaseOrderPresentationFooter')
    expect(footer).toContain('data-testid="purchase-order-presentation-footer"')
  })

  it('preserves the A4 physical shell contract', () => {
    expect(shell).toContain('@page { size: A4; margin: 4mm; }')
    expect(shell).toContain('width: 201mm !important')
    expect(shell).toContain('height: 288mm !important')
    expect(shell).toContain('signature-space absolute bottom-[8mm]')
  })
})
