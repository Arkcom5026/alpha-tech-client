// src/features/bill/pages/PrintBillPageFullTax.jsx
// 🏛️ Premium Next-Gen POS Print Page: (Full A4 Tax Invoice Core Logic Restored)

import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import BillLayoutFullTax from '@/features/bill/components/BillLayoutFullTax'
import StoreDocumentHeaderScope from '@/features/branch/documentHeader/StoreDocumentHeaderScope'
import { buildStoreDocumentHeader } from '@/features/branch/documentHeader/documentHeaderConfig'
import { useBillDocumentSource } from '@/features/bill/hooks/useBillDocumentSource'
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
    canEditDocumentLines,
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

  const documentLineEditor = useSaleDocumentLineEditor({
    saleId: canEditDocumentLines ? saleId : null,
    reload: reloadForPrint,
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

  // BillLayoutFullTax keeps a legacy 20-row visual grid by adding filler rows.
  // On paper, reserve the lower A4 area for totals/signatures while never hiding
  // actual document lines. For short documents this removes only trailing fillers.
  const printFillerRowsToHide = useMemo(() => {
    const itemCount = Array.isArray(saleItems) ? saleItems.length : 0
    const printableGridRows = Math.max(12, itemCount)
    return Math.max(20 - printableGridRows, 0)
  }, [saleItems])

  // Short invoices get a deterministic A4 frame: normal-flow header/table in the
  // upper zone, and totals/signatures pinned into a reserved lower footer zone.
  // Longer invoices keep natural pagination so a pinned footer cannot overlap lines.
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

        @media print {
          /*
           * BillLayoutFullTax owns @page { margin: 10mm }. Its legacy A4 shell
           * still requests the full 210mm x 297mm physical sheet, which is
           * larger than the 190mm x 277mm printable box and can push the
           * no-break signature block onto an otherwise empty second page.
           */
          .bill-print-page-shell {
            min-height: 0 !important;
          }

          .bill-print-root {
            width: 100% !important;
            max-width: 190mm !important;
          }

          .bill-print-root .print-a4 {
            width: 100% !important;
            max-width: 190mm !important;
            min-height: calc(297mm - 20mm) !important;
            height: auto !important;
            box-sizing: border-box !important;
          }

          /*
           * The layout's trailing rows are visual fillers, not sale lines.
           * Hide only the computed number of trailing fillers on paper so the
           * totals and signature no-break blocks stay on the first A4 sheet.
           */
          .bill-print-root .print-a4 tbody tr:nth-last-child(-n+${printFillerRowsToHide}) {
            display: none !important;
          }

          /*
           * Deterministic single-sheet frame for short invoices.
           * Do not use position:fixed: browsers repeat fixed print elements on
           * every sheet. Instead pin only this document's footer inside its own
           * A4 content box and reserve the lower 54mm for totals/signatures.
           */
          .bill-print-short-document .print-a4 {
            position: relative !important;
            height: calc(297mm - 20mm) !important;
            min-height: calc(297mm - 20mm) !important;
            padding-bottom: 54mm !important;
            overflow: hidden !important;
          }

          .bill-print-short-document .print-a4 > table + div {
            position: absolute !important;
            left: 20px !important;
            right: 20px !important;
            bottom: 25mm !important;
            margin: 0 !important;
            padding-top: 0 !important;
            min-height: 28mm !important;
          }

          .bill-print-short-document .print-a4 > table + div + div {
            position: absolute !important;
            left: 20px !important;
            right: 20px !important;
            bottom: 0 !important;
            margin: 0 !important;
            min-height: 24mm !important;
          }
        }
      `}</style>

      <div className="bill-print-page-shell w-full min-h-screen bg-white text-black dark:bg-white dark:text-black py-8 px-4 print:p-0 print:bg-white">
        <div className={`bill-print-root ${pinPrintFooter ? 'bill-print-short-document' : ''} mx-auto max-w-[210mm] bg-white text-black dark:bg-white dark:text-black p-6 rounded-2xl border border-zinc-200 shadow-sm print:p-0 print:border-none print:shadow-none`}>
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