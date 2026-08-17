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

  const printFillerRowsToHide = useMemo(() => {
    const itemCount = Array.isArray(saleItems) ? saleItems.length : 0
    const printableGridRows = Math.max(12, itemCount)
    return Math.max(20 - printableGridRows, 0)
  }, [saleItems])

  const pinPrintFooter = useMemo(
    () => Array.isArray(saleItems) && saleItems.length > 0 && saleItems.length <= 12,
    [saleItems]
  )

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
         * Preview/print parity: this route is already the user's document
         * preview, so short invoices must use the same A4 geometry before and
         * after window.print(). This keeps row capacity, totals and signatures
         * from jumping when Chrome opens its native print preview.
         */
        .bill-print-root .print-a4 {
          width: 100% !important;
          max-width: 100% !important;
          box-sizing: border-box !important;
        }

        .bill-print-root .print-a4 tbody tr:nth-last-child(-n+${printFillerRowsToHide}) {
          display: none !important;
        }

        .bill-print-short-document .print-a4 {
          position: relative !important;
          height: 296mm !important;
          min-height: 296mm !important;
          padding: 10mm 10mm 58mm !important;
          overflow: hidden !important;
        }

        .bill-print-short-document .print-a4 > table + div {
          position: absolute !important;
          left: 10mm !important;
          right: 10mm !important;
          top: 214mm !important;
          bottom: auto !important;
          margin: 0 !important;
          padding-top: 0 !important;
          min-height: 28mm !important;
        }

        .bill-print-short-document .print-a4 > table + div + div {
          position: absolute !important;
          left: 10mm !important;
          right: 10mm !important;
          top: 246mm !important;
          bottom: auto !important;
          margin: 0 !important;
          min-height: 20mm !important;
          height: 20mm !important;
          page-break-inside: auto !important;
          break-inside: auto !important;
        }

        .bill-print-short-document .print-a4 > table + div + div > div {
          height: 20mm !important;
        }

        @media print {
          @page {
            size: A4;
            margin: 0 !important;
          }

          html, body {
            margin: 0 !important;
            padding: 0 !important;
          }

          .bill-print-page-shell {
            width: 210mm !important;
            min-height: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          .bill-print-root {
            width: 210mm !important;
            max-width: 210mm !important;
            margin: 0 !important;
          }

          .bill-print-root .print-a4 {
            width: 210mm !important;
            max-width: 210mm !important;
            min-height: 296mm !important;
            height: auto !important;
            margin: 0 !important;
            padding: 10mm !important;
            box-sizing: border-box !important;
            border: 0 !important;
            border-radius: 0 !important;
            box-shadow: none !important;
          }

          .bill-print-short-document .print-a4 {
            height: 296mm !important;
            min-height: 296mm !important;
            padding: 10mm 10mm 58mm !important;
          }
        }
      `}</style>

      <div className="bill-print-page-shell w-full min-h-screen bg-white text-black dark:bg-white dark:text-black py-8 px-4 print:p-0 print:bg-white">
        <div className={`bill-print-root ${pinPrintFooter ? 'bill-print-short-document' : ''} mx-auto w-full max-w-[210mm] box-border bg-white text-black dark:bg-white dark:text-black p-0 rounded-2xl border border-zinc-200 shadow-sm print:border-none print:shadow-none`}>
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