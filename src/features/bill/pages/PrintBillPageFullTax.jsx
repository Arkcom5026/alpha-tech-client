
// -----------------------
// PrintBillPageFullTax.jsx
// -----------------------
import { useLocation } from 'react-router-dom';
import BillLayoutFullTax from '../components/BillLayoutFullTax';

const PrintBillPageFullTax = () => {
  const location = useLocation();
  const payment = location.state?.payment;

  if (!payment) return <div>ไม่พบข้อมูลใบเสร็จ</div>;

  const saleItems = (payment.sale.items || []).map((i) => ({
    id: i.stockItem.id,
    productName: i.stockItem.product?.title || 'ไม่พบชื่อสินค้า',
    price: i.stockItem.sellPrice ?? 0,
    quantity: 1,
  }));

  const saleData = {
    sale: payment.sale,
    saleItems,
    payments: [payment],
    config: {
    branchName: payment.sale.branch?.name,
    address: payment.sale.branch?.address,
  },
  };

  return <BillLayoutFullTax {...saleData} />;
};

export default PrintBillPageFullTax;
