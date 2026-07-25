import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'

import useCustomerReceiptStore from '../store/customerReceiptStore'
import CustomerReceiptPrintLayout from '../components/CustomerReceiptPrintLayout'
import CustomerReceiptShortPrintLayout from '../components/CustomerReceiptShortPrintLayout'

const PrintCustomerReceiptPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const printedRef = useRef(false)
  const printRootRef = useRef(null)
  const [printMode, setPrintMode] = useState('FULL')

  const autoPrint = useMemo(() => {
    const value = String(searchParams.get('autoPrint') || '').toLowerCase()
    return value === '1' || value === 'true' || value === 'yes'
  }, [searchParams])

  const requestedMode = useMemo(() => {
    const value = String(searchParams.get('mode') || '').toUpperCase()
    return value === 'SHORT' ? 'SHORT' : 'FULL'
  }, [searchParams])

  const selectedItem = useCustomerReceiptStore((state) => state.selectedItem)
  const detailLoading = useCustomerReceiptStore((state) => state.detailLoading)
  const printLoading = useCustomerReceiptStore((state) => state.printLoading)
  const error = useCustomerReceiptStore((state) => state.error)
  const loadCustomerReceiptForPrintAction = useCustomerReceiptStore(
    (state) => state.loadCustomerReceiptForPrintAction
  )
  const clearCustomerReceiptMessagesAction = useCustomerReceiptStore(
    (state) => state.clearCustomerReceiptMessagesAction
  )
  const clearSelectedCustomerReceiptAction = useCustomerReceiptStore(
    (state) => state.clearSelectedCustomerReceiptAction
  )

  useEffect(() => {
    setPrintMode(requestedMode)
  }, [requestedMode])

  useEffect(() => {
    printedRef.current = false
    clearCustomerReceiptMessagesAction()

    if (!id) return undefined

    loadCustomerReceiptForPrintAction(Number(id)).catch(() => null)

    return () => {
      clearCustomerReceiptMessagesAction()
      clearSelectedCustomerReceiptAction()
    }
  }, [
    id,
    loadCustomerReceiptForPrintAction,
    clearCustomerReceiptMessagesAction,
    clearSelectedCustomerReceiptAction,
  ])

  useEffect(() => {
    const updatePrintHeight = () => {
      if (printMode !== 'SHORT') return
      if (typeof document === 'undefined') return

      const element = printRootRef.current
      if (!element) return

      const rect = element.getBoundingClientRect()
      const measuredHeight = Math.max(
        Math.ceil(rect.height || 0),
        element.scrollHeight || 0,
        element.offsetHeight || 0
      )

      if (measuredHeight > 0) {
        document.documentElement.style.setProperty(
          '--customer-receipt-short-height',
          `${measuredHeight}px`
        )
      }
    }

    updatePrintHeight()
    const frameId = window.requestAnimationFrame(updatePrintHeight)
    const timerId = window.setTimeout(updatePrintHeight, 150)
    const resizeObserver =
      typeof ResizeObserver !== 'undefined' ? new ResizeObserver(updatePrintHeight) : null

    if (printRootRef.current && resizeObserver) {
      resizeObserver.observe(printRootRef.current)
    }

    window.addEventListener('beforeprint', updatePrintHeight)

    return () => {
      window.cancelAnimationFrame(frameId)
      window.clearTimeout(timerId)
      window.removeEventListener('beforeprint', updatePrintHeight)
      resizeObserver?.disconnect()
      document.documentElement.style.removeProperty('--customer-receipt-short-height')
    }
  }, [printMode, selectedItem?.id, selectedItem?.allocations?.length])

  const handleBack = useCallback(() => {
    const currentPath = window.location.pathname
    const printIndex = currentPath.indexOf('/print')

    if (printIndex >= 0) {
      navigate(currentPath.substring(0, printIndex))
      return
    }

    const listIndex = currentPath.indexOf('/customer-receipts')
    if (listIndex >= 0) {
      navigate(`${currentPath.substring(0, listIndex)}/customer-receipts`)
      return
    }

    navigate(-1)
  }, [navigate])

  const handlePrint = useCallback(() => {
    try {
      window.focus?.()
      window.print?.()
    } catch {
      // Ignore browser print failures; the document remains available for retry.
    }
  }, [])

  useEffect(() => {
    if (!autoPrint) return
    if (detailLoading || printLoading) return
    if (error) return
    if (!selectedItem?.id) return
    if (Number(selectedItem.id) !== Number(id)) return
    if (printedRef.current) return

    printedRef.current = true
    const timer = window.setTimeout(handlePrint, 300)
    return () => window.clearTimeout(timer)
  }, [autoPrint, detailLoading, printLoading, error, id, selectedItem?.id, handlePrint])

  if (!id) {
    return (
      <div className="min-h-screen bg-slate-900 p-8 text-center font-bold text-rose-400">
        ไม่พบเลขที่ใบรับเงิน
      </div>
    )
  }

  if (detailLoading || printLoading) {
    return (
      <div className="min-h-screen bg-slate-900 p-8 text-center font-bold text-zinc-400">
        กำลังโหลดข้อมูลใบรับเงิน...
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 p-8 text-center font-bold text-rose-400">
        เกิดข้อผิดพลาด: {error}
      </div>
    )
  }

  if (!selectedItem?.id) {
    return (
      <div className="min-h-screen bg-slate-900 p-8 text-center font-bold text-zinc-400">
        ไม่พบข้อมูลใบรับเงินตามรหัสอ้างอิง
      </div>
    )
  }

  return (
    <>
      <style>{`
        .customer-receipt-print-root {
          font-family: 'THSarabunNew', 'TH Sarabun New', 'Sarabun', system-ui, sans-serif;
        }

        @page {
          size: ${printMode === 'SHORT' ? '80mm auto' : 'A4'};
          margin: ${printMode === 'SHORT' ? '0' : '10mm'};
        }

        @media print {
          html,
          body,
          #root {
            width: ${printMode === 'SHORT' ? '80mm' : 'auto'} !important;
            height: ${
              printMode === 'SHORT'
                ? 'var(--customer-receipt-short-height, auto)'
                : 'auto'
            } !important;
            min-height: ${
              printMode === 'SHORT'
                ? 'var(--customer-receipt-short-height, 0)'
                : '0'
            } !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
            background: #fff !important;
          }

          body * {
            visibility: hidden !important;
          }

          .customer-receipt-print-root,
          .customer-receipt-print-root * {
            visibility: visible !important;
          }

          .customer-receipt-print-root {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            display: block !important;
            width: ${printMode === 'SHORT' ? '80mm' : '100%'} !important;
            max-width: ${printMode === 'SHORT' ? '80mm' : 'none'} !important;
            height: auto !important;
            min-height: 0 !important;
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
        <div className="mx-auto flex max-w-[210mm] flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center justify-center rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-slate-700"
            >
              กลับ
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
            >
              พิมพ์ใบเสร็จ
            </button>
          </div>

          <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 p-1">
            <button
              type="button"
              onClick={() => setPrintMode('FULL')}
              className={`rounded-md px-3 py-1.5 text-sm font-bold ${
                printMode === 'FULL' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
              }`}
            >
              A4
            </button>
            <button
              type="button"
              onClick={() => setPrintMode('SHORT')}
              className={`rounded-md px-3 py-1.5 text-sm font-bold ${
                printMode === 'SHORT' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
              }`}
            >
              80mm
            </button>
          </div>

          <div className="text-right text-xs font-medium text-slate-500">
            <div>{selectedItem?.code || '-'}</div>
            {autoPrint ? <div className="text-emerald-600">Auto print เปิดอยู่</div> : null}
          </div>
        </div>
      </div>

      <div
        className={`w-full bg-white text-black dark:bg-white dark:text-black ${
          printMode === 'SHORT'
            ? 'px-4 py-6 print:m-0 print:h-auto print:min-h-0 print:w-auto print:p-0'
            : 'px-4 py-8 print:p-0'
        }`}
      >
        <div
          ref={printRootRef}
          className={`customer-receipt-print-root mx-auto bg-white text-black dark:bg-white dark:text-black ${
            printMode === 'SHORT'
              ? 'w-[80mm] max-w-[80mm] rounded-xl border border-zinc-200 shadow-sm print:border-none print:shadow-none'
              : 'max-w-[210mm] rounded-2xl border border-zinc-200 shadow-sm print:border-none print:shadow-none'
          }`}
        >
          {printMode === 'SHORT' ? (
            <CustomerReceiptShortPrintLayout receipt={selectedItem} />
          ) : (
            <CustomerReceiptPrintLayout receipt={selectedItem} />
          )}
        </div>
      </div>
    </>
  )
}

export default PrintCustomerReceiptPage
