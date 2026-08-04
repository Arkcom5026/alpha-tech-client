// src/features/bill/pages/PrintBillPageShortTax.jsx
// 🏛️ Premium Next-Gen POS Print Page: (Short Thermal Receipt Core Logic Restored)

import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import BillLayoutShortTax from '../components/BillLayoutShortTax'
import { useBillStore } from '@/features/bill/store/billStore'
import { useSaleDocumentLineEditor } from '@/features/sales/documents/workspace'

const PRINT_RETURN_FALLBACK_MS = 60_000

const PrintBillPageShortTax = () => {
  const params = useParams()
  const navigate = useNavigate()
  const saleId = params.id || params.saleId
  const saleRoute = `/${params.shopSlug || 'advancetech'}/pos/sales/sale`
  const printedRef = useRef(false)
  const printRootRef = useRef(null)

  const [searchParams] = useSearchParams()

  const paymentId = useMemo(() => {
    const value = searchParams.get('paymentId')
    return value ? String(value) : null
  }, [searchParams])

  const autoPrint = useMemo(() => {
    const value = String(searchParams.get('autoPrint') || '').toLowerCase()
    return value === '1' || value === 'true' || value === 'yes'
  }, [searchParams])

  const {
    sale,
    payment,
    saleItems,
    config,
    loading,
    error,
    loadSaleByIdAction,
    resetAction,
  } = useBillStore()

  const reloadSaleForPrint = useCallback(async () => {
    if (!saleId) return null

    resetAction()
    return loadSaleByIdAction(
      saleId,
      paymentId
        ? {
            paymentId,
            params: { paymentId },
          }
        : undefined
    )
  }, [loadSaleByIdAction, paymentId, resetAction, saleId])

  const documentLineEditor = useSaleDocumentLineEditor({
    saleId,
    reload: reloadSaleForPrint,
  })

  useEffect(() => {
    const run = async () => {
      try {
        documentLineEditor.actions.clearError()
        await reloadSaleForPrint()
      } catch {
        // billStore owns load errors
      }
    }

    run()

    return () => {
      resetAction()
    }
  }, [reloadSaleForPrint, resetAction])

  useEffect(() => {
    printedRef.current = false
  }, [saleId, autoPrint])

  useEffect(() => {
    const updatePrintHeight = () => {
      const element = printRootRef.current
      if (!element || typeof document === 'undefined') return

      const rect = element.getBoundingClientRect()
      const measuredHeight = Math.max(
        Math.ceil(rect.height || 0),
        element.scrollHeight || 0,
        element.offsetHeight || 0
      )

      if (measuredHeight > 0) {
        document.documentElement.style.setProperty(
          '--short-tax-receipt-height',
          `${measuredHeight}px`
        )
      }
    }

    updatePrintHeight()

    const frameId = window.requestAnimationFrame(updatePrintHeight)
    const timerId = window.setTimeout(updatePrintHeight, 150)
    const resizeObserver =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(updatePrintHeight)
        : null

    if (printRootRef.current && resizeObserver) {
      resizeObserver.observe(printRootRef.current)
    }

    window.addEventListener('beforeprint', updatePrintHeight)

    return () => {
      window.cancelAnimationFrame(frameId)
      window.clearTimeout(timerId)
      window.removeEventListener('beforeprint', updatePrintHeight)
      resizeObserver?.disconnect()
      document.documentElement.style.removeProperty('--short-tax-receipt-height')
    }
  }, [sale?.id, saleItems?.length, payment?.id, config])

  useEffect(() => {
    const root = printRootRef.current
    if (!root) return undefined

    const agencyLabel = Array.from(root.querySelectorAll('.row .left.label')).find(
      (element) => element.textContent?.trim() === 'หน่วยงาน'
    )
    const agencyRow = agencyLabel?.parentElement || null
    const agencyValue = agencyRow?.querySelector('.right') || null

    if (!agencyRow || !agencyValue) return undefined

    const previousRowAlignItems = agencyRow.style.alignItems
    const previousValueStyle = {
      flex: agencyValue.style.flex,
      minWidth: agencyValue.style.minWidth,
      whiteSpace: agencyValue.style.whiteSpace,
      overflow: agencyValue.style.overflow,
      textOverflow: agencyValue.style.textOverflow,
      overflowWrap: agencyValue.style.overflowWrap,
      wordBreak: agencyValue.style.wordBreak,
      lineHeight: agencyValue.style.lineHeight,
    }

    agencyRow.style.alignItems = 'flex-start'
    Object.assign(agencyValue.style, {
      flex: '1 1 0%',
      minWidth: '0',
      whiteSpace: 'normal',
      overflow: 'visible',
      textOverflow: 'clip',
      overflowWrap: 'anywhere',
      wordBreak: 'break-word',
      lineHeight: '1.25',
    })

    return () => {
      agencyRow.style.alignItems = previousRowAlignItems
      Object.assign(agencyValue.style, previousValueStyle)
    }
  }, [sale?.id, sale?.customer?.companyName])

  useEffect(() => {
    const root = printRootRef.current
    const branchName = String(config?.branchName || '').trim().replace(/\s+/g, ' ')
    if (!root || !branchName) return undefined

    const branchNameElement = Array.from(
      root.querySelectorAll('.text-center.no-break.tight > .font-bold')
    ).find((element) => element.textContent?.trim().replace(/\s+/g, ' ') === branchName)

    if (!branchNameElement) return undefined

    const designationMatch = branchName.match(
      /\s*(\((?:สำนักงานใหญ่|สาขา[^)]*|สำนักงาน[^)]*)\))\s*$/
    )
    const branchDesignation = designationMatch?.[1] || ''
    const legalBusinessName = designationMatch
      ? branchName.slice(0, designationMatch.index).trim()
      : branchName
    const protectedLegalBusinessName = legalBusinessName.replace(
      /\s+(จำกัด(?:\s*\(มหาชน\))?)$/,
      '\u00a0$1'
    )

    const originalText = branchNameElement.textContent
    const originalStyle = branchNameElement.getAttribute('style')

    const normalizedLength = legalBusinessName.length
    const fontSize =
      normalizedLength >= 68
        ? 12.5
        : normalizedLength >= 52
          ? 13
          : normalizedLength >= 38
            ? 14
            : 16

    branchNameElement.textContent = ''
    Object.assign(branchNameElement.style, {
      fontSize: `${fontSize}px`,
      lineHeight: '1.18',
      letterSpacing: '0px',
      whiteSpace: 'normal',
      overflow: 'visible',
      textOverflow: 'clip',
      overflowWrap: 'normal',
      wordBreak: 'normal',
      textWrap: 'wrap',
      textAlign: 'center',
    })

    const legalNameLine = document.createElement('div')
    legalNameLine.textContent = protectedLegalBusinessName
    Object.assign(legalNameLine.style, {
      display: 'block',
      width: '100%',
      maxWidth: '100%',
      whiteSpace: 'nowrap',
      overflow: 'visible',
      overflowWrap: 'normal',
      wordBreak: 'normal',
      textWrap: 'nowrap',
      textAlign: 'center',
    })
    branchNameElement.appendChild(legalNameLine)

    let designationLine = null
    if (branchDesignation) {
      designationLine = document.createElement('div')
      designationLine.textContent = branchDesignation
      Object.assign(designationLine.style, {
        display: 'block',
        marginTop: '1px',
        fontSize: `${Math.max(fontSize - 1, 11.5)}px`,
        lineHeight: '1.15',
        whiteSpace: 'nowrap',
        textAlign: 'center',
      })
      branchNameElement.appendChild(designationLine)
    }

    const allowNaturalLegalNameWrap = () => {
      if (legalNameLine.scrollWidth <= legalNameLine.clientWidth + 1) return
      Object.assign(legalNameLine.style, {
        whiteSpace: 'normal',
        overflowWrap: 'normal',
        wordBreak: 'normal',
        textWrap: 'balance',
      })
    }

    allowNaturalLegalNameWrap()
    const frameId = window.requestAnimationFrame(allowNaturalLegalNameWrap)

    return () => {
      window.cancelAnimationFrame(frameId)
      branchNameElement.textContent = originalText
      if (originalStyle === null) {
        branchNameElement.removeAttribute('style')
      } else {
        branchNameElement.setAttribute('style', originalStyle)
      }
    }
  }, [config?.branchName, sale?.id])

  const returnToSale = useCallback(() => {
    navigate(saleRoute, { replace: true })
  }, [navigate, saleRoute])

  const printAndReturnToSale = useCallback(() => {
    let returned = false
    let fallbackTimerId = null

    const cleanup = () => {
      window.removeEventListener('afterprint', returnOnce)
      if (fallbackTimerId !== null) {
        window.clearTimeout(fallbackTimerId)
        fallbackTimerId = null
      }
    }

    const returnOnce = () => {
      if (returned) return
      returned = true
      cleanup()
      returnToSale()
    }

    window.addEventListener('afterprint', returnOnce, { once: true })

    try {
      window.focus?.()
      window.print?.()

      // `afterprint` is the lifecycle authority. The long fallback only protects
      // browsers that never dispatch it; it must not navigate away while the
      // print dialog is still opening or being used.
      fallbackTimerId = window.setTimeout(returnOnce, PRINT_RETURN_FALLBACK_MS)
    } catch {
      cleanup()
      returnOnce()
    }
  }, [returnToSale])

  useEffect(() => {
    if (!autoPrint) return
    if (printedRef.current) return
    if (!sale?.id) return
    if (!config) return
    if (!saleItems?.length) return
    if (!payment?.id) return

    printedRef.current = true

    const timerId = setTimeout(() => {
      printAndReturnToSale()
    }, 300)

    return () => clearTimeout(timerId)
  }, [autoPrint, sale?.id, config, saleItems?.length, payment?.id, printAndReturnToSale])

  const workspaceError = error || documentLineEditor.error

  if (loading) {
    return <div className="text-center p-8 text-zinc-400 font-bold bg-slate-900 min-h-screen">⏳ กำลังโหลดข้อมูลใบเสร็จรับเงิน...</div>
  }

  if (workspaceError) {
    return <div className="text-center p-8 text-rose-400 font-bold bg-slate-900 min-h-screen">เกิดข้อผิดพลาด: {workspaceError}</div>
  }

  if (!sale || !saleItems?.length || !config) {
    return <div className="text-center p-8 text-zinc-400 font-bold bg-slate-900 min-h-screen">ไม่พบข้อมูลใบเสร็จตามรหัสอ้างอิง</div>
  }

  if (!payment) {
    return (
      <div className="text-center p-8 text-amber-400 font-bold bg-slate-900 min-h-screen">
        ใบขายนี้ยังไม่มีการรับชำระ จึงยังไม่สามารถพิมพ์ใบเสร็จได้
      </div>
    )
  }

  const customerType = sale.customer?.type || 'PERSON'
  const hideContactName = customerType === 'ORGANIZATION' || customerType === 'GOVERNMENT'

  return (
    <>
      <style>{`
        .bill-print-root {
          font-family: 'THSarabunNew', 'TH Sarabun New', 'Sarabun', system-ui, sans-serif;
        }

        @page {
          size: 80mm auto;
          margin: 0;
        }

        @media print {
          html,
          body,
          #root {
            width: 80mm !important;
            height: var(--short-tax-receipt-height, auto) !important;
            min-height: var(--short-tax-receipt-height, 0) !important;
            max-height: var(--short-tax-receipt-height, none) !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
            background: #fff !important;
          }

          html,
          body {
            position: relative !important;
          }

          body * {
            visibility: hidden !important;
          }

          .bill-print-root,
          .bill-print-root * {
            visibility: visible !important;
          }

          .bill-print-root {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            display: block !important;
            width: 80mm !important;
            max-width: 80mm !important;
            height: auto !important;
            min-height: 0 !important;
            max-height: none !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
            border: 0 !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            background: #fff !important;
          }
        }
      `}</style>

      <div className="w-full bg-white px-4 py-3 print:hidden">
        <div className="mx-auto flex max-w-[80mm] items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={returnToSale}
              className="inline-flex items-center justify-center rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              กลับหน้าขายสินค้า
            </button>

            <button
              type="button"
              onClick={printAndReturnToSale}
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-900"
            >
              พิมพ์ใบเสร็จ
            </button>
          </div>

          {autoPrint ? (
            <span className="text-xs font-medium text-emerald-300">
              Auto print เปิดอยู่
            </span>
          ) : null}
        </div>
      </div>

      <div className="w-full bg-white text-black dark:bg-white dark:text-black py-6 px-4 print:w-auto print:p-0 print:m-0 print:min-h-0 print:h-auto print:bg-white">
        <div
          ref={printRootRef}
          className="bill-print-root mx-auto w-[80mm] max-w-[80mm] bg-white text-black dark:bg-white dark:text-black p-4 rounded-xl border border-zinc-200 shadow-sm print:p-0 print:border-none print:shadow-none"
        >
          <BillLayoutShortTax
            sale={sale}
            saleItems={saleItems}
            payments={[payment]}
            config={{ ...config, hideDate: false }}
            hideContactName={hideContactName}
            editableDocumentLines
            editingLineKey={documentLineEditor.editingLineKey}
            lineDrafts={documentLineEditor.lineDrafts}
            savingLineKey={documentLineEditor.savingLineKey}
            onToggleDocumentLineEdit={documentLineEditor.actions.toggle}
            onChangeDocumentLineDraft={documentLineEditor.actions.change}
            onSaveDocumentLine={documentLineEditor.actions.save}
          />
        </div>
      </div>
    </>
  )
}

export default PrintBillPageShortTax
