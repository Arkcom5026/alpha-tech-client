


// src/features/bill/pages/PrintBillPageShortTax.jsx


import { useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import BillLayoutShortTax from '../components/BillLayoutShortTax'
import { useBillStore } from '@/features/bill/store/billStore'

const PrintBillPageShortTax = () => {
  const { id } = useParams()
  const printedRef = useRef(false)

  const { sale, payment, saleItems, config, loading, error, loadSaleByIdAction, resetAction } =
    useBillStore()

  useEffect(() => {
    const run = async () => {
      try {
        // ✅ Single source of truth: ใช้ saleId จาก URL เท่านั้น (รองรับ refresh/reprint)
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
  }, [id, loadSaleByIdAction, resetAction])

  // ✅ Auto-print (optional): เปิดแท็บใหม่แล้วพิมพ์ทันที แต่กันยิงซ้ำ
  useEffect(() => {
    if (printedRef.current) return
    if (!sale?.id) return

    printedRef.current = true

    const t = setTimeout(() => {
      try {
        window.focus?.()
        window.print?.()
      } catch {
        // ignore
      }
    }, 300)

    return () => clearTimeout(t)
  }, [sale?.id])

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
    <>
      {/* ✅ เอกสารพิมพ์ต้องใช้ TH Sarabun New (มาตรฐานถาวร) */}
      <style>{`
        @media print {
          @page { size: auto; margin: 10mm; }
          html, body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
        .bill-print-root { font-family: "TH Sarabun New", "Sarabun", system-ui, sans-serif; }
      `}</style>

      <div className="bill-print-root">
        <BillLayoutShortTax
          sale={sale}
          saleItems={saleItems}
          payments={payment ? [payment] : []}
          config={{ ...config, hideDate: true }}
          hideContactName={hideContactName}
        />
      </div>
    </>
  )
}

export default PrintBillPageShortTax









