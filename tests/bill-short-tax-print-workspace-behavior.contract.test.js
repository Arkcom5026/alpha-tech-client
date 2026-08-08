import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()
const pagePath = path.join(root, 'src/features/bill/pages/PrintBillPageShortTax.jsx')
const page = fs.readFileSync(pagePath, 'utf8')

describe('bill short tax print workspace behavior contract', () => {
  it('keeps bill hydration scoped to route sale and optional payment identity', () => {
    expect(page).toContain("const saleId = params.id || params.saleId")
    expect(page).toContain("searchParams.get('paymentId')")
    expect(page).toContain('loadSaleByIdAction(')
    expect(page).toContain('resetAction()')
  })

  it('keeps editable document-line runtime wired through the shared workspace', () => {
    expect(page).toContain('useSaleDocumentLineEditor')
    expect(page).toContain('reload: reloadSaleForPrint')
    expect(page).toContain('documentLineEditor.actions.save')
  })

  it('preserves dynamic 80mm print-height measurement and cleanup lifecycle', () => {
    expect(page).toContain("--short-tax-receipt-height")
    expect(page).toContain('getBoundingClientRect()')
    expect(page).toContain('new ResizeObserver(updatePrintHeight)')
    expect(page).toContain("window.addEventListener('beforeprint', updatePrintHeight)")
    expect(page).toContain('resizeObserver?.disconnect()')
  })

  it('preserves browser print and afterprint return authority', () => {
    expect(page).toContain("window.addEventListener('afterprint', returnOnce")
    expect(page).toContain('window.print?.()')
    expect(page).toContain('PRINT_RETURN_FALLBACK_MS')
    expect(page).toContain('returnToSale()')
  })

  it('preserves guarded one-shot auto-print readiness', () => {
    expect(page).toContain('if (!autoPrint) return')
    expect(page).toContain('if (printedRef.current) return')
    expect(page).toContain('if (!sale?.id) return')
    expect(page).toContain('if (!config) return')
    expect(page).toContain('if (!saleItems?.length) return')
    expect(page).toContain('if (!payment?.id) return')
  })

  it('keeps the current short-tax printable surface and editor presentation intact', () => {
    expect(page).toContain('<BillLayoutShortTax')
    expect(page).toContain('payments={[payment]}')
    expect(page).toContain('hideContactName={hideContactName}')
    expect(page).toContain('editableDocumentLines')
    expect(page).toContain('className="bill-print-root')
  })
})
