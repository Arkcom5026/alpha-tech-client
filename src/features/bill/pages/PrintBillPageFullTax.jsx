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

  // Auto-print remains opt-in only via ?autoPrint=1.
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

  // Keep the main-branch 20-row preview unchanged. On paper only, trim the
  // trailing visual filler rows down to a 15-row grid. This reserves space for
  // totals/signatures while never hiding a real sale row.
  const printFillerRowsToHide = useMemo(() => {
    const itemCount = Array.isArray(saleItems) ? saleItems.length : 0
    const printableGridRows = Math.max(15, itemCount)
    return Math.max(20 - printableGridRows, 0)
  }, [saleItems])

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

        @media print {
          /* Keep browser/app wrappers from creating an empty second fragment. */
          html,
          body,
          #root,
          .bill-print-page-shell,
          .bill-print-root {
            min-height: 0 !important;
            height: auto !important;
            margin-top: 0 !important;
            margin-bottom: 0 !important;
            padding-top: 0 !important;
            padding-bottom: 0 !important;
            overflow: visible !important;
          }

          .bill-print-page-shell {
            display: block !important;
          }

          /*
           * BillLayoutFullTax owns @page { size:A4; margin:10mm }. Keep its A4
           * width inside the 190mm printable area, but do NOT impose a paper
           * height on the flex container. A fixed/minimum page height combines
           * with the summary's mt-auto and pushes the signature into page 2.
           */
          .bill-print-root .print-a4 {
            width: 190mm !important;
            max-width: 190mm !important;
            min-height: 0 !important;
            height: auto !important;
            box-sizing: border-box !important;
          }

          /* These are trailing visual fillers from the legacy 20-row grid. */
          .bill-print-root .print-a4 tbody tr:nth-last-child(-n+${printFillerRowsToHide}) {
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