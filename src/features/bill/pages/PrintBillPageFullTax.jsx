

// ===============================
// features/bill/pages/PrintBillPageFullTax.jsx
// ===============================
import { useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import BillLayoutFullTax from '@/features/bill/components/BillLayoutFullTax'
import { useBillStore } from '@/features/bill/store/BillStore_tmp'

const PrintBillPageFullTax = () => {
  const { id } = useParams();
  const location = useLocation();
  const { sale, payment, saleItems, config, loading, error, loadSaleByIdAction, resetAction } = useBillStore();

  useEffect(() => {
    let mounted = true;

    // If the route provided a payment object with sale, prefer it (e.g., after checkout)
    const statePayment = location.state?.payment;
    const run = async () => {
      try {
        if (statePayment?.sale) {
          // preload from state then still normalize via store (ensures consistent rounding)
          await loadSaleByIdAction(statePayment.sale.id);
        } else if (id) {
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
  }, [id, location.state, loadSaleByIdAction, resetAction]);

  if (loading) {
    return <div className="text-center p-6 text-gray-700">⏳ กำลังโหลดข้อมูลใบเสร็จ...</div>;
  }
  if (error) {
    return <div className="text-center p-6 text-red-600">เกิดข้อผิดพลาด: {error}</div>;
  }
  if (!sale || !saleItems?.length || !payment || !config) {
    return <div className="text-center p-6 text-gray-700">ไม่พบข้อมูลใบเสร็จ</div>;
  }

  return <BillLayoutFullTax sale={sale} saleItems={saleItems} payments={[payment]} config={config} />;
};

export default PrintBillPageFullTax;


