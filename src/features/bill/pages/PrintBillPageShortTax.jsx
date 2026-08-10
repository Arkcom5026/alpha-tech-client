// src/features/bill/pages/PrintBillPageShortTax.jsx
// 🏛️ Premium Next-Gen POS Print Page: (Short Thermal Receipt Core Logic Restored)

import { useCallback, useEffect, useMemo } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useBillStore } from '@/features/bill/store/billStore'
import BillShortTaxPrintShell from '@/features/bill/shortTax/print/workspace/components/BillShortTaxPrintShell'
import BillShortTaxPrintState from '@/features/bill/shortTax/print/workspace/components/BillShortTaxPrintState'
import BillShortTaxPrintToolbar from '@/features/bill/shortTax/print/workspace/components/BillShortTaxPrintToolbar'
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

  const isOrdinaryReceipt = searchParams.get('document') === 'receipt'

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
        onBack={returnToSale}
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
      />
    </>
  )
}

export default PrintBillPageShortTax
