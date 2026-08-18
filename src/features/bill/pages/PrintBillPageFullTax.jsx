// src/features/bill/pages/PrintBillPageFullTax.jsx

import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import FullTaxA4Document from '@/features/bill/components/FullTaxA4Document'
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
    return () => reset()
  }, [reloadForPrint, reset])

  useEffect(() => {
    printedRef.current = false
  }, [sourceType, sourceId, autoPrint])

  useEffect(() => {
    if (!autoPrint) return
    if (printedRef.current) return
    if (!sale?.id || !documentConfig || !Array.isArray(saleItems) || saleItems.length === 0 || !payment) return

    printedRef.current = true
    const timerId = setTimeout(() => {
      try {
        window.focus?.()
        window.print?.()
      } catch {
        // browser owns printing
      }
    }, 300)

    return () => clearTimeout(timerId)
  }, [autoPrint, sale?.id, documentConfig, saleItems, payment])

  const workspaceError = error || (canEditDocumentLines ? documentLineEditor.error : null)

  if (loading) {
    return <div className="min-h-screen bg-slate-900 p-8 text-center font-bold text-zinc-400">⏳ กำลังโหลดข้อมูลใบเสร็จเต็มรูปแบบ...</div>
  }

  if (workspaceError) {
    return <div className="min-h-screen bg-slate-900 p-8 text-center font-bold text-rose-400">เกิดข้อผิดพลาด: {workspaceError}</div>
  }

  if (!sale || !Array.isArray(saleItems) || saleItems.length === 0 || !payment || !documentConfig) {
    return <div className="min-h-screen bg-slate-900 p-8 text-center font-bold text-zinc-400">ไม่พบข้อมูลใบเสร็จตามรหัสอ้างอิง</div>
  }

  return (
    <>
      <style>{`
        @media print {
          @page { size: A4; margin: 6mm !important; }

          html,
          body,
          #root {
            margin: 0 !important;
            padding: 0 !important;
            min-height: 0 !important;
            height: auto !important;
          }

          /* Mirror the delivery-note isolation pattern so Chrome lays out the
             full-tax sheet against the same printable ancestor geometry. */
          body:has(.full-tax-print-shell) #root *:has(.full-tax-print-shell) {
            box-sizing: border-box !important;
            display: block !important;
            position: static !important;
            width: auto !important;
            max-width: none !important;
            min-width: 0 !important;
            min-height: 0 !important;
            height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
            transform: none !important;
          }

          .full-tax-print-shell,
          .full-tax-print-frame {
            display: block !important;
            position: static !important;
            width: auto !important;
            max-width: none !important;
            min-height: 0 !important;
            height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
            border: 0 !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            overflow: visible !important;
            background: #fff !important;
          }

          body .full-tax-a4-page {
            display: block !important;
            position: relative !important;
            box-sizing: border-box !important;
            width: 195mm !important;
            max-width: 195mm !important;
            height: 280mm !important;
            min-height: 280mm !important;
            max-height: 280mm !important;
            margin: 0 auto !important;
            padding: 5mm !important;
            overflow: hidden !important;
            page-break-inside: avoid !important;
            break-inside: avoid-page !important;
          }

          body .full-tax-a4-page:last-of-type {
            page-break-after: auto !important;
            break-after: auto !important;
          }
        }
      `}</style>

      <main className="full-tax-print-shell min-h-screen bg-slate-100 px-3 py-5 text-black print:bg-white print:p-0 md:px-6 md:py-8">
        <section className="full-tax-print-frame mx-auto max-w-[210mm] rounded-2xl bg-white p-3 shadow-sm print:rounded-none print:p-0 print:shadow-none md:p-5">
          <StoreDocumentHeaderScope config={documentConfig}>
            <FullTaxA4Document
              sale={sale}
              saleItems={saleItems}
              payments={[payment]}
              config={documentConfig}
              editableDocumentLines={canEditDocumentLines}
              editingLineKey={canEditDocumentLines ? documentLineEditor.editingLineKey : null}
              lineDrafts={canEditDocumentLines ? documentLineEditor.lineDrafts : {}}
              savingLineKey={canEditDocumentLines ? documentLineEditor.savingLineKey : null}
              onToggleDocumentLineEdit={canEditDocumentLines ? documentLineEditor.actions.toggle : undefined}
              onChangeDocumentLineDraft={canEditDocumentLines ? documentLineEditor.actions.change : undefined}
              onSaveDocumentLine={canEditDocumentLines ? documentLineEditor.actions.save : undefined}
            />
          </StoreDocumentHeaderScope>
        </section>
      </main>
    </>
  )
}

export default PrintBillPageFullTax