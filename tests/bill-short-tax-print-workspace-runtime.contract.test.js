import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const runtimePath = path.resolve(
  __dirname,
  '../src/features/bill/shortTax/print/workspace/runtime/useBillShortTaxPrintRuntime.js'
)
const runtimeSource = fs.readFileSync(runtimePath, 'utf8')

describe('bill short tax print workspace runtime contract', () => {
  it('keeps thermal browser lifecycle in a dedicated runtime owner', () => {
    expect(runtimeSource).toContain('const useBillShortTaxPrintRuntime')
    expect(runtimeSource).toContain('const printRootRef = useRef(null)')
    expect(runtimeSource).toContain("window.addEventListener('beforeprint', updatePrintHeight)")
    expect(runtimeSource).toContain("window.addEventListener('afterprint', returnOnce, { once: true })")
    expect(runtimeSource).toContain('window.print?.()')
  })

  it('preserves dynamic 80mm height measurement and cleanup semantics', () => {
    expect(runtimeSource).toContain("'--short-tax-receipt-height'")
    expect(runtimeSource).toContain('new ResizeObserver(updatePrintHeight)')
    expect(runtimeSource).toContain('window.requestAnimationFrame(updatePrintHeight)')
    expect(runtimeSource).toContain('window.setTimeout(updatePrintHeight, 150)')
    expect(runtimeSource).toContain('resizeObserver?.disconnect()')
    expect(runtimeSource).toContain("style.removeProperty('--short-tax-receipt-height')")
  })

  it('preserves guarded one-shot auto-print and return fallback semantics', () => {
    expect(runtimeSource).toContain('printedRef.current = false')
    expect(runtimeSource).toContain('if (printedRef.current) return')
    expect(runtimeSource).toContain('printedRef.current = true')
    expect(runtimeSource).toContain('PRINT_RETURN_FALLBACK_MS = 60_000')
    expect(runtimeSource).toContain('printAndReturnToSale()')
  })

  it('does not acquire bill hydration, routing, or document-line mutation authority', () => {
    expect(runtimeSource).not.toContain('useBillStore')
    expect(runtimeSource).not.toContain('useParams')
    expect(runtimeSource).not.toContain('useNavigate')
    expect(runtimeSource).not.toContain('useSaleDocumentLineEditor')
    expect(runtimeSource).not.toContain('loadSaleByIdAction')
    expect(runtimeSource).not.toContain('resetAction')
  })
})
