// -----------------------
// PrintBillPageQuick.jsx
// -----------------------
import { useLocation } from 'react-router-dom';
import BillLayoutQuick from '../components/BillLayoutQuick';

const PrintBillPageQuick = () => {
  const location = useLocation();
  const payment = location.state?.payment;

  if (!payment) return <div>ไม่พบข้อมูลใบเสร็จ</div>;

  const saleData = {
    sale: payment.sale,
    saleItems: payment.sale.items,
    payments: [payment],
    config: payment.sale.branch?.receiptConfig || {},
  };

  return <BillLayoutQuick {...saleData} />;
};

export default PrintBillPageQuick;
