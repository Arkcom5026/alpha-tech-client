// -----------------------
// PrintBillPageShortTax.jsx (รองรับทั้งกรณีพิมพ์ทันที + พิมพ์ย้อนหลัง)
// -----------------------
import { useLocation, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getSaleById } from '@/features/sales/api/saleApi';
import BillLayoutShortTax from '../components/BillLayoutShortTax';

const PrintBillPageShortTax = () => {
  const location = useLocation();
  const { id } = useParams();
  const [sale, setSale] = useState(null);
  const [payment, setPayment] = useState(null);

  useEffect(() => {
    const statePayment = location.state?.payment;

    if (statePayment && statePayment.sale) {
      setSale(statePayment.sale);
      setPayment(statePayment);
    } else {
      getSaleById(id).then((res) => {
        setSale(res);
        setPayment({
          saleId: res.id,
          paymentMethod: res.paymentMethod,
          amount: res.totalAmount,
          note: res.note || '',
          sale: res,
        });
      });
    }
  }, [location.state, id]);

  if (!sale || !payment) return <div>⏳ กำลังโหลดข้อมูลใบเสร็จ...</div>;

  const saleItems = (sale.items || []).map((i) => ({
    id: i.stockItem.id,
    productName: i.stockItem.product?.title || 'ไม่พบชื่อสินค้า',
    price: i.stockItem.sellPrice ?? 0,
    quantity: 1,
  }));

  const branch = sale.branch || {};
  const config = branch.receiptConfig || {};

  const fullConfig = {
    branchName: config.branchName || branch.name || '-',
    address: config.address || branch.address || '-',
    phone: config.phone || branch.phone || '-',
    taxId: config.taxId || branch.taxId || '-',
    footerNote: config.footerNote || 'ใช้งาน POS ฟรีได้ที่ FlowAccount.com',
    logoUrl: config.logoUrl || null,
    vatRate: config.vatRate || 7,
  };

  const saleData = {
    sale,
    saleItems,
    payments: [payment],
    config: fullConfig,
  };

  return <BillLayoutShortTax {...saleData} />;
};

export default PrintBillPageShortTax;
