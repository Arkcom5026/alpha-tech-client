import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()
const pagePath = path.join(root, 'src/features/bill/pages/PrintBillPageShortTax.jsx')
const runtimePath = path.join(
  root,
  'src/features/bill/shortTax/print/workspace/runtime/useBillShortTaxPrintRuntime.js'
)
const shellPath = path.join(
  root,
  'src/features/bill/shortTax/print/workspace/components/BillShortTaxPrintShell.jsx'
)
const toolbarPath = path.join(
  root,
  'src/features/bill/shortTax/print/workspace/components/BillShortTaxPrintToolbar.jsx'
)
const layoutPath = path.join(root, 'src/features/bill/components/BillLayoutShortTax.jsx')
const page = fs.readFileSync(pagePath, 'utf8')
const runtime = fs.readFileSync(runtimePath, 'utf8')
const shell = fs.readFileSync(shellPath, 'utf8')
const toolbar = fs.readFileSync(toolbarPath, 'utf8')
const layout = fs.readFileSync(layoutPath, 'utf8')

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
    expect(page).toContain('documentLineEditor={documentLineEditor}')
    expect(shell).toContain('documentLineEditor.actions.save')
  })

  it('preserves dynamic 80mm print-height measurement and cleanup lifecycle across runtime ownership', () => {
    expect(page).toContain('useBillShortTaxPrintRuntime')
    expect(page).toContain('printRootRef={printRuntime.printRootRef}')
    expect(runtime).toContain("--short-tax-receipt-height")
    expect(runtime).toContain('getBoundingClientRect()')
    expect(runtime).toContain('new ResizeObserver(updatePrintHeight)')
    expect(runtime).toContain("window.addEventListener('beforeprint', updatePrintHeight)")
    expect(runtime).toContain('resizeObserver?.disconnect()')
  })

  it('preserves browser print and afterprint return authority across runtime ownership', () => {
    expect(page).toContain('onPrint={printRuntime.printAndReturnToSale}')
    expect(toolbar).toContain('onClick={onPrint}')
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

  it('keeps the current short-tax printable surface and editor presentation intact across workspace ownership', () => {
    expect(page).toContain('<BillShortTaxPrintShell')
    expect(shell).toContain('<BillLayoutShortTax')
    expect(shell).toContain('payments={[payment]}')
    expect(shell).toContain('hideContactName={hideContactName}')
    expect(shell).toContain('editableDocumentLines')
    expect(shell).toContain('className="bill-print-root')
  })

  it('shows a customer identity on the original short-tax document', () => {
    expect(layout).toContain("customer?.name || customer?.companyName || sale?.customerName || 'ลูกค้าทั่วไป'")
    expect(layout).toContain('{getCustomerNameText(sale.customer)}')
  })
})
