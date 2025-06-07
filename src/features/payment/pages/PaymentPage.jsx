import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import PaymentForm from './PaymentForm';
import usePaymentStore from '../store/paymentStore';
import useSaleStore from '@/features/sale/store/saleStore';

const PaymentPage = () => {
  const { saleId } = useParams();
  const { loadSaleOrderById, currentSale } = useSaleStore();
  const { resetPaymentForm } = usePaymentStore();

  useEffect(() => {
    if (saleId) {
      loadSaleOrderById(saleId);
      resetPaymentForm();
    }
  }, [saleId, loadSaleOrderById, resetPaymentForm]);

  if (!currentSale) return <div>กำลังโหลดข้อมูลการขาย...</div>;

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">รับชำระเงิน</h1>
      <PaymentForm saleOrder={currentSale} />
    </div>
  );
};

export default PaymentPage;
