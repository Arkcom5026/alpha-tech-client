import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowLeft,
  FileCheck,
  FileText,
  Loader2,
  Printer,
  Smartphone,
} from 'lucide-react'

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
      document.documentElement.style.removeProperty('--customer-receipt-short-height')
    }
  }, [printMode, selectedItem?.id, selectedItem?.allocations?.length])

  useEffect(() => {
    if (!autoPrint) return
    if (detailLoading || printLoading) return
    if (error) return
    if (!selectedItem?.id) return
    if (Number(selectedItem.id) !== Number(id)) return
    if (printedRef.current) return

    printedRef.current = true
    const timer = window.setTimeout(() => {
      window.focus?.()
      window.print?.()
    }, 300)

    return () => window.clearTimeout(timer)
  }, [autoPrint, detailLoading, printLoading, error, id, selectedItem?.id, printMode])

  const handleBack = () => {
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
  }

  const handlePrint = () => {
    window.focus?.()
    window.print?.()
  }

  if (!id) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900 p-6 font-sans text-white">
        <div className="w-full max-w-md space-y-4 rounded-3xl border border-zinc-800 bg-zinc-900 p-6 text-center shadow-xl">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-rose-500/20 bg-rose-500/10 text-rose-400">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-black tracking-tight text-white">ไม่พบเลขที่ใบรับเงิน</h1>
            <p className="mt-1 text-xs font-bold text-zinc-400">
              กรุณาตรวจสอบเส้นทางเอกสารก่อนพิมพ์อีกครั้ง
            </p>
          </div>
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-xs font-black text-zinc-200 transition hover:bg-zinc-700 hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>กลับไปหน้ารายการใบรับเงิน</span>
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <style>{`
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

          #customer-receipt-print-root,
          #customer-receipt-print-root * {
            visibility: visible !important;
          }

          #customer-receipt-print-root {
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

      <div className="min-h-screen bg-slate-900 p-6 font-sans text-white print:min-h-0 print:bg-white print:p-0">
        <div className="mx-auto mb-6 flex max-w-5xl flex-col items-center justify-between gap-4 rounded-2xl border border-zinc-800/80 bg-zinc-900 p-4 shadow-lg backdrop-blur-md print:hidden sm:flex-row">
          <div className="min-w-0 self-start sm:self-center">
            <h1 className="flex items-center gap-1.5 text-base font-black tracking-tight text-white">
              <FileCheck className="h-4 w-4 text-orange-400" />
              พิมพ์ใบเสร็จรับเงินลูกหนี้
            </h1>
            <p className="mt-0.5 text-xs font-bold text-zinc-400">
              เลขที่อ้างอิง:{' '}
              <span className="font-mono font-black text-amber-400">
                {selectedItem?.code || '—'}
              </span>
            </p>
          </div>

          <div className="flex w-full shrink-0 select-none items-center justify-center rounded-xl border border-zinc-800 bg-zinc-950 p-1 sm:w-auto">
            <button
              type="button"
              onClick={() => setPrintMode('SHORT')}
              className={`flex h-7 w-full items-center justify-center gap-1 rounded-md px-3 text-xs font-black transition-all sm:w-auto ${
                printMode === 'SHORT'
                  ? 'bg-gradient-to-b from-amber-400 to-orange-500 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Smartphone className="h-3.5 w-3.5" /> สลิป 80mm
            </button>
            <button
              type="button"
              onClick={() => setPrintMode('FULL')}
              className={`flex h-7 w-full items-center justify-center gap-1 rounded-md px-3 text-xs font-black transition-all sm:w-auto ${
                printMode === 'FULL'
                  ? 'bg-gradient-to-b from-amber-400 to-orange-500 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <FileText className="h-3.5 w-3.5" /> ใบเสร็จ A4
            </button>
          </div>

          <div className="flex w-full shrink-0 items-center gap-2 sm:w-auto">
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex h-9 w-full items-center justify-center gap-1 rounded-xl border border-zinc-700 bg-zinc-800 px-4 text-xs font-black text-zinc-200 shadow-sm transition hover:bg-zinc-700 sm:w-auto"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>กลับ</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              disabled={detailLoading || printLoading || !selectedItem?.id}
              className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-xl border border-amber-500/20 bg-gradient-to-b from-amber-400 to-orange-500 px-4 text-xs font-black text-white shadow-md transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:transform-none disabled:shadow-none sm:w-auto"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>พิมพ์ ({printMode === 'SHORT' ? '80mm' : 'A4'})</span>
            </button>
          </div>
        </div>

        {detailLoading || printLoading ? (
          <div className="mx-auto flex max-w-5xl select-none flex-col items-center justify-center gap-3 rounded-3xl border border-zinc-800 bg-zinc-900 p-12 text-center text-sm font-bold text-zinc-400 shadow-sm print:hidden">
            <Loader2 className="h-6 w-6 animate-spin text-orange-400" />
            <span>กำลังโหลดข้อมูลใบรับเงิน...</span>
          </div>
        ) : error ? (
          <div className="mx-auto max-w-5xl space-y-4 rounded-3xl border border-rose-500/20 bg-zinc-900 p-6 text-center shadow-sm print:hidden">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-rose-500/20 bg-rose-500/10 text-rose-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight text-white">ไม่สามารถโหลดข้อมูลใบรับเงินได้</h2>
              <p className="mt-1 text-xs font-bold text-rose-400">{error}</p>
            </div>
          </div>
        ) : !selectedItem?.id ? (
          <div className="mx-auto max-w-5xl space-y-4 rounded-3xl border border-amber-500/20 bg-zinc-900 p-6 text-center shadow-sm print:hidden">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/10 text-amber-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <h2 className="text-base font-black tracking-tight text-white">ไม่พบข้อมูลใบรับเงิน</h2>
          </div>
        ) : (
          <div className="w-full overflow-x-auto bg-slate-900 p-1 text-black print:bg-white">
            <div
              id="customer-receipt-print-root"
              ref={printRootRef}
              className={
                printMode === 'SHORT'
                  ? 'mx-auto w-[80mm] max-w-[80mm] bg-white text-black shadow-sm print:shadow-none'
                  : 'mx-auto max-w-[210mm] bg-white text-black shadow-sm print:max-w-none print:shadow-none'
              }
            >
              {printMode === 'SHORT' ? (
                <CustomerReceiptShortPrintLayout receipt={selectedItem} />
              ) : (
                <CustomerReceiptPrintLayout receipt={selectedItem} />
              )}
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default PrintCustomerReceiptPage
