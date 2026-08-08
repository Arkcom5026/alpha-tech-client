import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()
const pagePath = path.join(root, 'src/features/bill/pages/PrintBillPageShortTax.jsx')
const runtimePath = path.join(
  root,
  'src/features/bill/shortTax/print/workspace/runtime/useBillShortTaxPrintRuntime.js'
)
const page = fs.readFileSync(pagePath, 'utf8')
const runtime = fs.readFileSync(runtimePath, 'utf8')

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

  it('preserves dynamic 80mm print-height measurement and cleanup lifecycle across runtime ownership', () => {
    expect(page).toContain('useBillShortTaxPrintRuntime')
    expect(page).toContain('ref={printRuntime.printRootRef}')
    expect(runtime).toContain("--short-tax-receipt-height")
    expect(runtime).toContain('getBoundingClientRect()')
    expect(runtime).toContain('new ResizeObserver(updatePrintHeight)')
    expect(runtime).toContain("window.addEventListener('beforeprint', updatePrintHeight)")
    expect(runtime).toContain('resizeObserver?.disconnect()')
  })

  it('preserves browser print and afterprint return authority across runtime ownership', () => {
    expect(page).toContain('onClick={printRuntime.printAndReturnToSale}')
    expect(runtime).toContain("window.addEventListener('afterprint', returnOnce")
    expect(runtime).toContain('window.print?.()')
    expect(runtime).toContain('PRINT_RETURN_FALLBACK_MS')
    expect(runtime).toContain('returnToSale()')
  })

  it('preserves guarded one-shot auto-print readiness across runtime ownership', () => {
    expect(page).toContain('autoPrint,')
    expect(page).toContain('saleId: sale?.id || null')
    expect(page).toContain('saleItemsCount: saleItems?.length || 0')
    expect(page).toContain('paymentId: payment?.id || null')
    expect(runtime).toContain('if (!autoPrint) return')
    expect(runtime).toContain('if (printedRef.current) return')
    expect(runtime).toContain('if (!saleId) return')
    expect(runtime).toContain('if (!config) return')
    expect(runtime).toContain('if (!saleItemsCount) return')
    expect(runtime).toContain('if (!paymentId) return')
  })

  it('keeps the current short-tax printable surface and editor presentation intact', () => {
    expect(page).toContain('<BillLayoutShortTax')
    expect(page).toContain('payments={[payment]}')
    expect(page).toContain('hideContactName={hideContactName}')
    expect(page).toContain('editableDocumentLines')
    expect(page).toContain('className="bill-print-root')
  })
})
