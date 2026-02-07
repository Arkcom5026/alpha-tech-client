import { useEffect } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import BillLayoutShortTax from '../components/BillLayoutShortTax'
import { useBillStore } from '@/features/bill/store/useBillStore'

const PrintBillPageShortTax = () => {
  const { id } = useParams()
  const location = useLocation()

  const { sale, payment, saleItems, config, loading, error, loadSaleByIdAction, resetAction } =
    useBillStore()

  useEffect(() => {
    const statePayment = location.state?.payment

    const run = async () => {
      try {
        if (statePayment?.sale?.id) {
          await loadSaleByIdAction(statePayment.sale.id)
          return
        }
        if (id) {
          await loadSaleByIdAction(id)
        }
      } catch {
        // error handled in store
      }
    }

    run()
    return () => {
      resetAction()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, location.key, loadSaleByIdAction, resetAction])

  if (loading) {
    return <div className="text-center p-6 text-gray-700">⏳ กำลังโหลดข้อมูลใบเสร็จ...</div>
  }
  if (error) {
    return <div className="text-center p-6 text-red-600">เกิดข้อผิดพลาด: {error}</div>
  }
  if (!sale || !saleItems?.length || !config) {
    return <div className="text-center p-6 text-gray-700">ไม่พบข้อมูลใบเสร็จ</div>
  }

  const customerType = sale.customer?.type || 'PERSON'
  const hideContactName = customerType === 'ORGANIZATION' || customerType === 'GOVERNMENT'

  return (
    <BillLayoutShortTax
      sale={sale}
      saleItems={saleItems}
      payments={payment ? [payment] : []}
      config={{ ...config, hideDate: true }}
      hideContactName={hideContactName}
    />
  )
}

export default PrintBillPageShortTax


