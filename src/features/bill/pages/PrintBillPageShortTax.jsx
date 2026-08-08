// src/features/bill/pages/PrintBillPageShortTax.jsx
// 🏛️ Premium Next-Gen POS Print Page: (Short Thermal Receipt Core Logic Restored)

import { useCallback, useEffect, useMemo } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import BillLayoutShortTax from '../components/BillLayoutShortTax'
import { useBillStore } from '@/features/bill/store/billStore'
import { useBillShortTaxPrintRuntime } from '@/features/bill/shortTax/print/workspace/runtime/useBillShortTaxPrintRuntime'
import { useSaleDocumentLineEditor } from '@/features/sales/documents/workspace'

const PrintBillPageShortTax = () => {
  const params = useParams()
  const navigate = useNavigate()
  const saleId = params.id || params.saleId
  const saleRoute = `/${params.shopSlug || 'advancetech'}/pos/sales/sale`

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

  const returnToSale = useCallback(() => {
    navigate(saleRoute, { replace: true })
  }, [navigate, saleRoute])

  const printRuntime = useBillShortTaxPrintRuntime({
    autoPrint,
    saleId: sale?.id || null,
    saleItemsCount: saleItems?.length || 0,
    paymentId: payment?.id || null,
    config,
    returnToSale,
  })

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
              onClick={printRuntime.printAndReturnToSale}
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
          ref={printRuntime.printRootRef}
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
