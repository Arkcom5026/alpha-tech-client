// src/features/bill/pages/PrintBillPageShortTax.jsx
// 🏛️ Premium Next-Gen POS Print Page: (Short Thermal Receipt Core Logic Restored)

import { useCallback, useEffect, useMemo } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useBillDocumentSource } from '@/features/bill/hooks/useBillDocumentSource'
import BillShortTaxPrintShell from '@/features/bill/shortTax/print/workspace/components/BillShortTaxPrintShell'
import BillShortTaxPrintState from '@/features/bill/shortTax/print/workspace/components/BillShortTaxPrintState'
import BillShortTaxPrintToolbar from '@/features/bill/shortTax/print/workspace/components/BillShortTaxPrintToolbar'
import { useBillShortTaxPrintRuntime } from '@/features/bill/shortTax/print/workspace/runtime/useBillShortTaxPrintRuntime'
import { useSaleDocumentLineEditor } from '@/features/sales/documents/workspace'
import { isConsolidatedDocumentSource } from '@/features/combinedBilling/adapters/consolidatedDocumentAdapter'

const PrintBillPageShortTax = () => {
  const params = useParams()
  const navigate = useNavigate()
  const saleId = params.id || params.saleId

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
  const returnRoute = useMemo(() => (
    isConsolidatedDocumentSource(sourceType)
      ? `/${params.shopSlug || 'advancetech'}/pos/sales/bill`
      : `/${params.shopSlug || 'advancetech'}/pos/sales/sale`
  ), [params.shopSlug, sourceType])

  const autoPrint = useMemo(() => {
    const value = String(searchParams.get('autoPrint') || '').toLowerCase()
    return value === '1' || value === 'true' || value === 'yes'
  }, [searchParams])

  const isOrdinaryReceipt = searchParams.get('document') === 'receipt'

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

  const returnFromPrint = useCallback(() => {
    navigate(returnRoute, { replace: true })
  }, [navigate, returnRoute])

  const printRuntime = useBillShortTaxPrintRuntime({
    autoPrint,
    saleId: sale?.id || null,
    saleItemsCount: saleItems?.length || 0,
    paymentId: payment?.id || null,
    config,
    returnToSale: returnFromPrint,
  })

  const workspaceError = error || (canEditDocumentLines ? documentLineEditor.error : null)
  const state = (
    <BillShortTaxPrintState
      loading={loading}
      error={workspaceError}
      hasSale={Boolean(sale)}
      hasItems={Boolean(saleItems?.length)}
      hasConfig={Boolean(config)}
      hasPayment={Boolean(payment)}
    />
  )

  if (loading || workspaceError || !sale || !saleItems?.length || !config || !payment) {
    return state
  }

  const customerType = sale.customer?.type || 'PERSON'
  const hideContactName = customerType === 'ORGANIZATION' || customerType === 'GOVERNMENT'

  return (
    <>
      <BillShortTaxPrintToolbar
        autoPrint={autoPrint}
        onBack={returnFromPrint}
        onPrint={printRuntime.printAndReturnToSale}
      />
      <BillShortTaxPrintShell
        sale={sale}
        saleItems={saleItems}
        payment={payment}
        config={config}
        hideContactName={hideContactName}
        documentTitle={isOrdinaryReceipt ? 'ใบเสร็จรับเงิน' : undefined}
        printRootRef={printRuntime.printRootRef}
        documentLineEditor={documentLineEditor}
        editableDocumentLines={canEditDocumentLines}
      />
    </>
  )
}

export default PrintBillPageShortTax