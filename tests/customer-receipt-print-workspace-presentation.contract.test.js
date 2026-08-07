import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8')

describe('customer receipt print workspace presentation contract', () => {
  const toolbar = read('src/features/customerReceipt/print/workspace/components/CustomerReceiptPrintToolbar.jsx')
  const state = read('src/features/customerReceipt/print/workspace/components/CustomerReceiptPrintState.jsx')
  const shell = read('src/features/customerReceipt/print/workspace/components/CustomerReceiptPrintShell.jsx')
  const presentation = `${toolbar}\n${state}\n${shell}`

  it('keeps extracted print workspace components presentation-only', () => {
    expect(presentation).not.toContain('useCustomerReceiptStore')
    expect(presentation).not.toContain('useSearchParams')
    expect(presentation).not.toContain('useNavigate')
    expect(presentation).not.toContain('window.')
    expect(presentation).not.toContain('document.')
    expect(presentation).not.toContain('ResizeObserver')
    expect(presentation).not.toContain('loadCustomerReceiptForPrintAction')
  })

  it('preserves print toolbar controls and auto-print feedback', () => {
    expect(toolbar).toContain('onClick={onBack}')
    expect(toolbar).toContain('onClick={onPrint}')
    expect(toolbar).toContain("onChangeMode?.('FULL')")
    expect(toolbar).toContain("onChangeMode?.('SHORT')")
    expect(toolbar).toContain('A4')
    expect(toolbar).toContain('80mm')
    expect(toolbar).toContain('Auto print เปิดอยู่')
  })

  it('preserves missing-id, loading, error, and missing-receipt states', () => {
    expect(state).toContain('ไม่พบเลขที่ใบรับเงิน')
    expect(state).toContain('กำลังโหลดข้อมูลใบรับเงิน...')
    expect(state).toContain('เกิดข้อผิดพลาด: {error}')
    expect(state).toContain('ไม่พบข้อมูลใบรับเงินตามรหัสอ้างอิง')
    expect(state).toContain('role="alert"')
  })

  it('preserves full and short print layouts plus print media presentation', () => {
    expect(shell).toContain("printMode === 'SHORT' ? '80mm auto' : 'A4'")
    expect(shell).toContain("var(--customer-receipt-short-height, auto)")
    expect(shell).toContain('customer-receipt-print-root')
    expect(shell).toContain('<CustomerReceiptShortPrintLayout receipt={receipt} />')
    expect(shell).toContain('<CustomerReceiptPrintLayout receipt={receipt} />')
    expect(shell).toContain('ref={printRootRef}')
  })
})
