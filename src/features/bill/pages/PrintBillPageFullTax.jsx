// src/features/bill/pages/PrintBillPageFullTax.jsx
// 🏛️ Premium Next-Gen POS Print Page: (Full A4 Tax Invoice Core Logic Restored)

import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import BillLayoutFullTax from '@/features/bill/components/BillLayoutFullTax'
import StoreDocumentHeaderScope from '@/features/branch/documentHeader/StoreDocumentHeaderScope'
import { buildStoreDocumentHeader } from '@/features/branch/documentHeader/documentHeaderConfig'
import { useBillDocumentSource } from '@/features/bill/hooks/useBillDocumentSource'
import { useBillDocumentLineEditor } from '@/features/bill/hooks/useBillDocumentLineEditor'
import { executeSaleDocumentLineUpdate } from '@/features/sales/documents/workspace'
import { executeConsolidatedDocumentLineUpdate } from '@/features/combinedBilling/controllers/consolidatedDocumentLineUpdateController'

const PrintBillPageFullTax = () => {
  const params = useParams()
  const saleId = params.saleId || params.id
  const printedRef = useRef(false)

  const [searchParams] = useSearchParams()

  const paymentId = useMemo(() => {
    const value = searchParams.get('paymentId')
    return value ? String(value) : null
  }, [searchParams])

  const sourceType = useMemo(
    () => String(searchParams.get('sourceType') || 'SALE').toUpperCase(),
    [searchParams]
  )
  const sourceId = useMemo(
    () => searchParams.get('sourceId') || saleId,
    [saleId, searchParams]
  )

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
    reload,
    reset,
    isConsolidated,
    canEditDocumentLines,
    documentSourceId,
  } = useBillDocumentSource({ saleId, sourceType, sourceId, paymentId })

  const documentConfig = useMemo(() => (
    config
      ? buildStoreDocumentHeader({
          branch: sale?.branch || null,
          documentType: 'FULL_TAX_INVOICE',
          legacyConfig: config,
        })
      : null
  ), [config, sale?.branch])

  const reloadForPrint = useCallback(async () => reload(), [reload])

  const saveDocumentLine = useCallback(async ({ item, draft }) => {
    if (isConsolidated) {
      return executeConsolidatedDocumentLineUpdate({
        documentId: documentSourceId,
        lineId: item?.documentSourceLineId,
        draft,
        reload: reloadForPrint,
      })
    }

    return executeSaleDocumentLineUpdate({
      saleId,
      saleItemIds: item?.saleItemIds,
      simpleItemIds: item?.simpleItemIds,
      draft,
      reload: reloadForPrint,
    })
  }, [documentSourceId, isConsolidated, reloadForPrint, saleId])

  const documentLineEditor = useBillDocumentLineEditor({
    documentKey: `${sourceType}:${documentSourceId || ''}`,
    saveDocumentLine: canEditDocumentLines ? saveDocumentLine : null,
  })

  useEffect(() => {
    const run = async () => {
      try {
        documentLineEditor.actions.clearError()
        await reloadForPrint()
      } catch {
        // source runtime owns load errors
      }
    }

    run()

    return () => {
      reset()
    }
  }, [reloadForPrint, reset])

  useEffect(() => {
    printedRef.current = false
  }, [sourceType, sourceId, autoPrint])

  useEffect(() => {
    if (!autoPrint) return
    if (printedRef.current) return
    if (!sale?.id) return
    if (!documentConfig) return
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
  }, [autoPrint, sale?.id, documentConfig, saleItems, payment?.id])

  const workspaceError = error || (canEditDocumentLines ? documentLineEditor.error : null)

  if (loading) {
    return <div className="text-center p-8 text-zinc-400 font-bold bg-slate-900 min-h-screen">⏳ กำลังโหลดข้อมูลใบเสร็จเต็มรูปแบบ...</div>
  }

  if (workspaceError) {
    return <div className="text-center p-8 text-rose-400 font-bold bg-slate-900 min-h-screen">เกิดข้อผิดพลาด: {workspaceError}</div>
  }

  if (!sale || !Array.isArray(saleItems) || saleItems.length === 0 || !payment || !documentConfig) {
    return <div className="text-center p-8 text-zinc-400 font-bold bg-slate-900 min-h-screen">ไม่พบข้อมูลใบเสร็จตามรหัสอ้างอิง</div>
  }

  return (
    <>
      <style>{`
        .bill-print-root { font-family: 'THSarabunNew', 'TH Sarabun New', 'Sarabun', system-ui, sans-serif; }

        /*
         * Single A4 authority: screen preview and native print use the same
         * physical 210 x 297 mm sheet. BillLayoutFullTax already owns the
         * document's internal padding, so the browser must not add another
         * 10 mm @page margin and shrink/reflow the document.
         */
        .bill-print-root .print-a4 {
          width: 210mm !important;
          max-width: 210mm !important;
          min-height: 297mm !important;
          box-sizing: border-box !important;
        }

        @media print {
          @page {
            size: A4;
            margin: 0 !important;
          }

          html,
          body,
          #root,
          .bill-print-page-shell,
          .bill-print-root {
            width: 210mm !important;
            min-height: 0 !important;
            height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
          }

          .bill-print-page-shell,
          .bill-print-root {
            display: block !important;
            max-width: 210mm !important;
          }

          .bill-print-root .print-a4 {
            width: 210mm !important;
            max-width: 210mm !important;
            min-height: 297mm !important;
            height: 297mm !important;
            margin: 0 !important;
            box-sizing: border-box !important;
            overflow: hidden !important;
            border-radius: 0 !important;
          }

          /* Keep the editor column's 4% width so the printable columns do not reflow. */
          .bill-print-root .print-a4 thead th:nth-child(7),
          .bill-print-root .print-a4 tbody tr > td:nth-child(7) {
            display: table-cell !important;
            visibility: hidden !important;
          }

          /* Expanded editor rows are workspace UI and never belong on paper. */
          .bill-print-root .print-a4 tbody tr.print\\:hidden {
            display: none !important;
          }
        }
      `}</style>

      <div className="bill-print-page-shell w-full min-h-screen bg-white text-black dark:bg-white dark:text-black py-8 px-4 print:p-0 print:bg-white">
        <div className="bill-print-root mx-auto max-w-[210mm] bg-white text-black dark:bg-white dark:text-black p-6 rounded-2xl border border-zinc-200 shadow-sm print:p-0 print:border-none print:shadow-none">
          <StoreDocumentHeaderScope config={documentConfig}>
            <BillLayoutFullTax
              sale={sale}
              saleItems={saleItems}
              payments={[payment]}
              config={documentConfig}
              mode="full"
              taxMode="full"
              editableDocumentLines={canEditDocumentLines}
              editingLineKey={canEditDocumentLines ? documentLineEditor.editingLineKey : null}
              lineDrafts={canEditDocumentLines ? documentLineEditor.lineDrafts : {}}
              savingLineKey={canEditDocumentLines ? documentLineEditor.savingLineKey : null}
              onToggleDocumentLineEdit={canEditDocumentLines ? documentLineEditor.actions.toggle : undefined}
              onChangeDocumentLineDraft={canEditDocumentLines ? documentLineEditor.actions.change : undefined}
              onSaveDocumentLine={canEditDocumentLines ? documentLineEditor.actions.save : undefined}
            />
          </StoreDocumentHeaderScope>
        </div>
      </div>
    </>
  )
}

export default PrintBillPageFullTax