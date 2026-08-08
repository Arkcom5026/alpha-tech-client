import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()
const componentDir = path.join(
  root,
  'src/features/bill/shortTax/print/workspace/components'
)

const state = fs.readFileSync(path.join(componentDir, 'BillShortTaxPrintState.jsx'), 'utf8')
const toolbar = fs.readFileSync(path.join(componentDir, 'BillShortTaxPrintToolbar.jsx'), 'utf8')
const shell = fs.readFileSync(path.join(componentDir, 'BillShortTaxPrintShell.jsx'), 'utf8')
const allPresentation = `${state}\n${toolbar}\n${shell}`

describe('bill short tax print workspace presentation contract', () => {
  it('keeps extracted presentation free of runtime ownership', () => {
    expect(allPresentation).not.toContain('useBillStore')
    expect(allPresentation).not.toContain('useParams')
    expect(allPresentation).not.toContain('useSearchParams')
    expect(allPresentation).not.toContain('useNavigate')
    expect(allPresentation).not.toContain('useEffect')
    expect(allPresentation).not.toContain('window.print')
    expect(allPresentation).not.toContain('ResizeObserver')
  })

  it('preserves loading, error, empty, and unpaid states', () => {
    expect(state).toContain('กำลังโหลดข้อมูลใบเสร็จรับเงิน')
    expect(state).toContain('เกิดข้อผิดพลาด:')
    expect(state).toContain('ไม่พบข้อมูลใบเสร็จตามรหัสอ้างอิง')
    expect(state).toContain('ใบขายนี้ยังไม่มีการรับชำระ')
  })

  it('preserves back and print intents through explicit props', () => {
    expect(toolbar).toContain('onClick={onBack}')
    expect(toolbar).toContain('onClick={onPrint}')
    expect(toolbar).toContain('Auto print เปิดอยู่')
    expect(toolbar).not.toContain('navigate(')
  })

  it('preserves the 80mm printable shell and document-line editor presentation', () => {
    expect(shell).toContain('@page')
    expect(shell).toContain('size: 80mm auto')
    expect(shell).toContain('--short-tax-receipt-height')
    expect(shell).toContain('ref={printRootRef}')
    expect(shell).toContain('<BillLayoutShortTax')
    expect(shell).toContain('payments={[payment]}')
    expect(shell).toContain('editableDocumentLines')
    expect(shell).toContain('documentLineEditor.actions.save')
  })
})
