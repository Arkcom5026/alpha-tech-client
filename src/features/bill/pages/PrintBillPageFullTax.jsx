

// ===============================
// features/bill/pages/PrintBillPageFullTax.jsx
// ===============================
import { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import BillLayoutFullTax from '@/features/bill/components/BillLayoutFullTax'
import { useBillStore } from '@/features/bill/store/billStore'

const PrintBillPageFullTax = () => {
  const { id } = useParams();
  const printedRef = useRef(false);
  const { sale, payment, saleItems, config, loading, error, loadSaleByIdAction, resetAction } = useBillStore();

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      try {
        // ✅ Single source of truth: ใช้ saleId จาก URL เท่านั้น (รองรับ refresh/reprint)
        if (id) {
          await loadSaleByIdAction(id);
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
  }, [id, loadSaleByIdAction, resetAction]);

  // ✅ Auto-print: เปิดแท็บใหม่แล้วพิมพ์ทันที แต่กันยิงซ้ำ
  useEffect(() => {
    if (printedRef.current) return;
    if (!sale?.id) return;

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
  }, [sale?.id]);

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
        @media print {
          @page { size: auto; margin: 10mm; }
          html, body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
        .bill-print-root { font-family: "TH Sarabun New", "Sarabun", system-ui, sans-serif; }
      `}</style>

      <div className="bill-print-root">
        <BillLayoutFullTax sale={sale} saleItems={saleItems} payments={[payment]} config={config} />
      </div>
    </>
  );
};

export default PrintBillPageFullTax;





