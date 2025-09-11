import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import PaymentForm from './PaymentForm';
import usePaymentStore from '../store/paymentStore';
import useSaleStore from '@/features/sale/store/saleStore';

const PaymentPage = () => {
  const { saleId } = useParams();
  const numericSaleId = saleId ? Number(saleId) : NaN;
  const isInvalidId = Number.isNaN(numericSaleId) || numericSaleId <= 0;

  const { loadSaleOrderById, currentSale } = useSaleStore();
  const { resetPaymentForm } = usePaymentStore();

  useEffect(() => {
    // รีเซ็ตฟอร์มทุกครั้งที่เข้าหน้านี้หรือเปลี่ยน saleId และล้างอีกครั้งเมื่อออกจากหน้า
    resetPaymentForm();
    if (!isInvalidId) {
      // โหลดข้อมูลใบขายจาก :saleId รองรับ direct-link/refresh
      loadSaleOrderById(String(numericSaleId));
    }
    return () => {
      resetPaymentForm();
    };
  }, [saleId, isInvalidId, numericSaleId, loadSaleOrderById, resetPaymentForm]);

  if (isInvalidId) return <div className="p-4 text-red-600">ไม่พบรหัสใบขายที่ถูกต้อง</div>;
  if (!currentSale) return <div className="p-4">กำลังโหลดข้อมูลการขาย...</div>;

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">รับชำระเงิน</h1>
      {/* ใช้ key เพื่อบังคับ remount เมื่อเปลี่ยน saleId ป้องกัน state ค้างในฟอร์ม */}
      <PaymentForm key={saleId} saleOrder={currentSale} />
    </div>
  );
};

export default PaymentPage;
