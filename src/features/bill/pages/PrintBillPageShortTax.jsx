// -----------------------
// PrintBillPageFullTax.jsx
// -----------------------
import { useLocation, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getSaleById } from '@/features/sales/api/saleApi';
import BillLayoutFullTax from '../components/BillLayoutFullTax';

const PrintBillPageFullTax = () => {
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
      // If payment data is not passed via state, fetch sale details by ID
      getSaleById(id).then((res) => {
        setSale(res);
        // Create a basic payment object for BillLayoutFullTax
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

  if (!sale || !sale.items || !payment) {
    return <div className="text-center p-6 text-gray-700">⏳ กำลังโหลดข้อมูลใบเสร็จ...</div>;
  }

  const saleItems = (sale.items || []).map((i) => ({
    id: i.id,
    productName: i.stockItem.product?.name || 'ไม่พบชื่อสินค้า',
    productModel: i.stockItem.product?.model || 'ไม่รุ่นชื่อสินค้า',
    amount: i.price ?? 0,
    quantity: 1,
    unit: i.stockItem.product?.template?.unit?.name || '-',
  }));

  const branch = sale.branch || {};
  const config = branch.receiptConfig || {};

  const fullConfig = {
    branchName: config.branchName || branch.name || '-',
    address: config.address || branch.address || '-',
    phone: config.phone || branch.phone || '-',
    taxId: config.taxId || branch.taxId || '-',
    footerNote: config.footerNote || '',
    logoUrl: config.logoUrl || null,
    vatRate: config.vatRate || 7,
    hideDate: true, // ✅ เพิ่มเพื่อซ่อนไม่ให้แสดงวันที่
  };

  const saleData = {
    sale,
    saleItems,
    payments: [payment],
    config: fullConfig,
  };

  return <BillLayoutFullTax {...saleData} />;
};

export default PrintBillPageFullTax;
