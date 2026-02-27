









// src/features/bill/pages/PrintBillPageShortTax.jsx


import { useEffect, useMemo, useRef } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import BillLayoutShortTax from '../components/BillLayoutShortTax'
import { useBillStore } from '@/features/bill/store/billStore'

const PrintBillPageShortTax = () => {
  const params = useParams()
  // รองรับ route param ได้ทั้ง :id และ :saleId (กันพังจากชื่อ param ไม่ตรงกัน)
  const saleId = params.id || params.saleId
  const printedRef = useRef(false)

  // รองรับกรณี refresh/เปิดลิงก์ตรง: PrintBillListPage จะส่ง ?paymentId=...
  const [searchParams] = useSearchParams()
  const paymentId = useMemo(() => {
    const v = searchParams.get('paymentId')
    return v ? String(v) : null
  }, [searchParams])

  const { sale, payment, saleItems, config, loading, error, loadSaleByIdAction, resetAction } =
    useBillStore()

  useEffect(() => {
    const run = async () => {
      try {
        // ✅ Single source of truth: ใช้ saleId จาก URL เท่านั้น (รองรับ refresh/reprint)
        if (saleId) {
          // ส่ง paymentId เป็น hint ให้ store/BE ใช้เลือก payment ที่ถูกต้อง (ถ้ามีหลายรายการ)
          await loadSaleByIdAction(
            saleId,
            paymentId
              ? {
                  // ✅ support both store shapes (options.paymentId OR options.params.paymentId)
                  paymentId,
                  params: { paymentId },
                }
              : undefined
          )
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
  }, [saleId, paymentId, loadSaleByIdAction, resetAction])

  // ✅ Reset auto-print guard when saleId changes
  useEffect(() => {
    printedRef.current = false
  }, [saleId])

  // ✅ Auto-print (optional): เปิดแท็บใหม่แล้วพิมพ์ทันที แต่กันยิงซ้ำ
  useEffect(() => {
    if (printedRef.current) return
    if (!sale?.id) return
    if (!config) return
    if (!saleItems?.length) return
    if (!payment) return

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
  }, [sale?.id, config, saleItems?.length, payment?.id])

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
        /* Font root (print CSS is handled in BillLayoutShortTax) */
        .bill-print-root { font-family: 'THSarabunNew', 'TH Sarabun New', 'Sarabun', system-ui, sans-serif; }
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












