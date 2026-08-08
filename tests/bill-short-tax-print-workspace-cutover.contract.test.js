import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()
const pagePath = path.join(root, 'src/features/bill/pages/PrintBillPageShortTax.jsx')
const statePath = path.join(
  root,
  'src/features/bill/shortTax/print/workspace/components/BillShortTaxPrintState.jsx'
)
const toolbarPath = path.join(
  root,
  'src/features/bill/shortTax/print/workspace/components/BillShortTaxPrintToolbar.jsx'
)
const shellPath = path.join(
  root,
  'src/features/bill/shortTax/print/workspace/components/BillShortTaxPrintShell.jsx'
)
const runtimePath = path.join(
  root,
  'src/features/bill/shortTax/print/workspace/runtime/useBillShortTaxPrintRuntime.js'
)

const page = fs.readFileSync(pagePath, 'utf8')
const state = fs.readFileSync(statePath, 'utf8')
const toolbar = fs.readFileSync(toolbarPath, 'utf8')
const shell = fs.readFileSync(shellPath, 'utf8')
const runtime = fs.readFileSync(runtimePath, 'utf8')

describe('bill short tax print workspace cutover contract', () => {
  it('composes state, toolbar, and printable shell from workspace owners', () => {
    expect(page).toContain('<BillShortTaxPrintState')
    expect(page).toContain('<BillShortTaxPrintToolbar')
    expect(page).toContain('<BillShortTaxPrintShell')
  })

  it('keeps hydration, routing, and document-line authority in the page', () => {
    expect(page).toContain('useParams()')
    expect(page).toContain('useNavigate()')
    expect(page).toContain('useBillStore()')
    expect(page).toContain('loadSaleByIdAction(')
    expect(page).toContain('useSaleDocumentLineEditor')
  })

  it('keeps thermal browser lifecycle in the dedicated runtime owner', () => {
    expect(page).toContain('useBillShortTaxPrintRuntime({')
    expect(runtime).toContain('new ResizeObserver(updatePrintHeight)')
    expect(runtime).toContain("window.addEventListener('afterprint', returnOnce")
    expect(runtime).toContain('window.print?.()')
    expect(page).not.toContain('window.print?.()')
  })

  it('keeps presentation owners free of store, routing, and browser lifecycle authority', () => {
    for (const source of [state, toolbar, shell]) {
      expect(source).not.toContain('useBillStore')
      expect(source).not.toContain('useParams')
      expect(source).not.toContain('useNavigate')
      expect(source).not.toContain('useEffect')
      expect(source).not.toContain('window.print')
      expect(source).not.toContain('ResizeObserver')
    }
  })
})
