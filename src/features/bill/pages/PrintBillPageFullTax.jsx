// features/bill/pages/PrintBillPageFullTax.jsx
import { useEffect, useMemo, useRef } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import BillLayoutFullTax from '@/features/bill/components/BillLayoutFullTax';
import { useBillStore } from '@/features/bill/store/billStore';

const PrintBillPageFullTax = () => {
  const params = useParams();
  const saleId = params.saleId || params.id; // ✅ รองรับทั้ง 2 แบบ (กันพัง)
  const printedRef = useRef(false);

  const [searchParams] = useSearchParams();
  const paymentId = useMemo(() => {
    const v = searchParams.get('paymentId');
    return v ? String(v) : null;
  }, [searchParams]);

  const {
    sale,
    payment,
    saleItems,
    config,
    loading,
    error,
    loadSaleByIdAction,
    resetAction,
  } = useBillStore();

  useEffect(() => {
    const run = async () => {
      try {
        if (!saleId) return;
        await loadSaleByIdAction(saleId, paymentId ? { paymentId } : undefined);
      } catch {
        // store handles error
      }
    };

    run();
    return () => resetAction();
  }, [saleId, paymentId, loadSaleByIdAction, resetAction]);

  useEffect(() => {
    printedRef.current = false;
  }, [saleId]);

  useEffect(() => {
    if (printedRef.current) return;
    if (!sale?.id) return;
    if (!config) return;
    if (!Array.isArray(saleItems) || saleItems.length === 0) return;
    if (!payment) return;

    printedRef.current = true;

    const t = setTimeout(() => {
      try {
        window.focus?.();
        window.print?.();
      } catch {}
    }, 300);

    return () => clearTimeout(t);
  }, [sale?.id, config, saleItems, payment]);

  if (loading) return <div className="text-center p-6 text-gray-700">⏳ กำลังโหลดข้อมูลใบเสร็จ...</div>;
  if (error) return <div className="text-center p-6 text-red-600">เกิดข้อผิดพลาด: {error}</div>;

  if (!sale || !Array.isArray(saleItems) || saleItems.length === 0 || !payment || !config) {
    return <div className="text-center p-6 text-gray-700">ไม่พบข้อมูลใบเสร็จ</div>;
  }

  return (
    <>
      <style>{`
        .bill-print-root { font-family: 'THSarabunNew', 'TH Sarabun New', 'Sarabun', system-ui, sans-serif; }
      `}</style>

      <div className="bill-print-root">
        {/* ✅ debug ชัดมากว่าหน้า FULL จริง (ไม่พิมพ์) */}
        <div className="print:hidden mb-2 text-xs font-mono text-indigo-700">
          [FULL-TAX PAGE] saleId={String(saleId)} paymentId={String(paymentId || '')}
        </div>

        <BillLayoutFullTax
          sale={sale}
          saleItems={saleItems}
          payments={[payment]}
          config={config}
          // ✅ บังคับโหมดแบบปลอดภัย (layout จะใช้หรือไม่ใช้ก็ได้ ไม่พัง)
          mode="full"
          taxMode="full"
        />
      </div>
    </>
  );
};

export default PrintBillPageFullTax;