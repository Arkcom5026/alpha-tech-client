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

describe('bill short tax print workspace runtime cutover contract', () => {
  it('cuts thermal browser lifecycle over to the dedicated runtime owner', () => {
    expect(page).toContain('useBillShortTaxPrintRuntime({')
    expect(page).toContain('printRootRef={printRuntime.printRootRef}')
    expect(page).toContain('onPrint={printRuntime.printAndReturnToSale}')
    expect(runtime).toContain('const printRootRef = useRef(null)')
    expect(runtime).toContain('const printAndReturnToSale = useCallback')
  })

  it('removes duplicated browser and measurement implementation from the page', () => {
    expect(page).not.toContain('new ResizeObserver(updatePrintHeight)')
    expect(page).not.toContain("window.addEventListener('beforeprint', updatePrintHeight)")
    expect(page).not.toContain("window.addEventListener('afterprint', returnOnce")
    expect(page).not.toContain('window.print?.()')
    expect(page).not.toContain('PRINT_RETURN_FALLBACK_MS')
    expect(page).not.toContain('printedRef.current')
  })

  it('keeps bill hydration, routing, and document-line mutation authority in the page', () => {
    expect(page).toContain('useNavigate()')
    expect(page).toContain('useParams()')
    expect(page).toContain('useBillStore()')
    expect(page).toContain('loadSaleByIdAction(')
    expect(page).toContain('useSaleDocumentLineEditor')
    expect(page).toContain('documentLineEditor={documentLineEditor}')
  })

  it('keeps the runtime owner free of bill hydration and mutation authority', () => {
    expect(runtime).not.toContain('useBillStore')
    expect(runtime).not.toContain('useParams')
    expect(runtime).not.toContain('useNavigate')
    expect(runtime).not.toContain('loadSaleByIdAction')
    expect(runtime).not.toContain('useSaleDocumentLineEditor')
    expect(runtime).not.toContain('documentLineEditor')
  })
})
