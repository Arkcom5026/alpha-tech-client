







// ===============================
// features/bill/pages/PrintBillPageFullTax.jsx
// ===============================
import { useEffect, useMemo, useRef } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import BillLayoutFullTax from '@/features/bill/components/BillLayoutFullTax'
import { useBillStore } from '@/features/bill/store/billStore'

const PrintBillPageFullTax = () => {
  const params = useParams();
  // รองรับ route param ได้ทั้ง :id และ :saleId (กันพังจากชื่อ param ไม่ตรงกัน)
  const saleId = params.id || params.saleId;
  const printedRef = useRef(false);

  // รองรับกรณี refresh/เปิดลิงก์ตรง: PrintBillListPage จะส่ง ?paymentId=...
  const [searchParams] = useSearchParams();
  const paymentId = useMemo(() => {
    const v = searchParams.get('paymentId');
    return v ? String(v) : null;
  }, [searchParams]);
  const { sale, payment, saleItems, config, loading, error, loadSaleByIdAction, resetAction } = useBillStore();

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      try {
        // ✅ Single source of truth: ใช้ saleId จาก URL เท่านั้น (รองรับ refresh/reprint)
        if (saleId) {
          await loadSaleByIdAction(saleId, paymentId ? { paymentId } : undefined);
        }
      } catch {
        // error is handled in store
      }
    };

    if (mounted) run();
    return () => {
      mounted = false;
      resetAction();
    };
  }, [saleId, paymentId, loadSaleByIdAction, resetAction]);

  // ✅ Reset auto-print guard when saleId changes
  useEffect(() => {
    printedRef.current = false;
  }, [saleId]);

  // ✅ Auto-print: เปิดแท็บใหม่แล้วพิมพ์ทันที แต่กันยิงซ้ำ
  useEffect(() => {
    if (printedRef.current) return;
    if (!sale?.id) return;
    if (!config) return;
    if (!saleItems?.length) return;
    if (!payment) return;

    printedRef.current = true;

    const t = setTimeout(() => {
      try {
        window.focus?.();
        window.print?.();
      } catch {
        // ignore
      }
    }, 300);

    return () => clearTimeout(t);
  }, [sale?.id, config, saleItems?.length, payment?.id]);

  if (loading) {
    return <div className="text-center p-6 text-gray-700">⏳ กำลังโหลดข้อมูลใบเสร็จ...</div>;
  }
  if (error) {
    return <div className="text-center p-6 text-red-600">เกิดข้อผิดพลาด: {error}</div>;
  }
  if (!sale || !saleItems?.length || !payment || !config) {
    return <div className="text-center p-6 text-gray-700">ไม่พบข้อมูลใบเสร็จ</div>;
  }

  return (
    <>
      {/* ✅ เอกสารพิมพ์ต้องใช้ TH Sarabun New (มาตรฐานถาวร) */}
      <style>{`
        /* Font root (print CSS is handled in BillLayoutFullTax) */
        .bill-print-root { font-family: 'THSarabunNew', 'TH Sarabun New', 'Sarabun', system-ui, sans-serif; }
      `}</style>

      <div className="bill-print-root">
        <BillLayoutFullTax sale={sale} saleItems={saleItems} payments={[payment]} config={config} />
      </div>
    </>
  );
};

export default PrintBillPageFullTax;









