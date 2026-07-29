// src/features/bill/pages/PrintBillPageFullTax.jsx
// 🏛️ Premium Next-Gen POS Print Page: (Full A4 Tax Invoice Core Logic Restored)

import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import BillLayoutFullTax from '@/features/bill/components/BillLayoutFullTax'
import { useBillStore } from '@/features/bill/store/billStore'
import { useSaleDocumentLineEditor } from '@/features/sales/documents/workspace'

const PrintBillPageFullTax = () => {
  const params = useParams()
  const saleId = params.saleId || params.id
  const printedRef = useRef(false)

  const [searchParams] = useSearchParams()

  const paymentId = useMemo(() => {
    const value = searchParams.get('paymentId')
    return value ? String(value) : null
  }, [searchParams])

  // Document Workspace baseline:
  // - default: do not auto print, allowing document-line review first
  // - opt in to the previous behavior with ?autoPrint=1
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

    // Clear the same-sale cache so a successful document-line mutation is
    // always followed by authoritative server hydration.
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

  // Auto-print remains opt-in only via ?autoPrint=1.
  useEffect(() => {
    if (!autoPrint) return
    if (printedRef.current) return
    if (!sale?.id) return
    if (!config) return
    if (!Array.isArray(saleItems) || saleItems.length === 0) return
    if (!payment) return

    printedRef.current = true

    const timerId = setTimeout(() => {
      try {
        window.focus?.()
        window.print?.()
      } catch {
        // Printing remains a browser-owned operation.
      }
    }, 300)

    return () => clearTimeout(timerId)
  }, [autoPrint, sale?.id, config, saleItems, payment?.id])

  const workspaceError = error || documentLineEditor.error

  if (loading) {
    return <div className="text-center p-8 text-zinc-400 font-bold bg-slate-900 min-h-screen">⏳ กำลังโหลดข้อมูลใบเสร็จเต็มรูปแบบ...</div>
  }

  if (workspaceError) {
    return <div className="text-center p-8 text-rose-400 font-bold bg-slate-900 min-h-screen">เกิดข้อผิดพลาด: {workspaceError}</div>
  }

  if (!sale || !Array.isArray(saleItems) || saleItems.length === 0 || !payment || !config) {
    return <div className="text-center p-8 text-zinc-400 font-bold bg-slate-900 min-h-screen">ไม่พบข้อมูลใบเสร็จตามรหัสอ้างอิง</div>
  }

  return (
    <>
      <style>{`
        .bill-print-root { font-family: 'THSarabunNew', 'TH Sarabun New', 'Sarabun', system-ui, sans-serif; }
      `}</style>

      <div className="w-full min-h-screen bg-white text-black dark:bg-white dark:text-black py-8 px-4 print:p-0 print:bg-white">
        <div className="bill-print-root mx-auto max-w-[210mm] bg-white text-black dark:bg-white dark:text-black p-6 rounded-2xl border border-zinc-200 shadow-sm print:p-0 print:border-none print:shadow-none">
          <BillLayoutFullTax
            sale={sale}
            saleItems={saleItems}
            payments={[payment]}
            config={config}
            mode="full"
            taxMode="full"
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

export default PrintBillPageFullTax
