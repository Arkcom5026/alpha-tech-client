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
          paymentMethod: res.paymentMethod, // Assuming sale has a paymentMethod field
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

  // Map sale items to the format expected by BillLayoutFullTax
  const saleItems = (sale.items || []).map((i) => ({
    id: i.id, // Use SaleItem's own ID
    productName: i.stockItem.product?.name || 'ไม่พบชื่อสินค้า',
    // Corrected: Use 'price' field from SaleItem (i.price) as unit price
    amount: i.price ?? 0,
    quantity: 1, // Confirmed: quantity is always 1 per SaleItem
    unit: i.stockItem.product?.template?.unit?.name || '-', // Get unit name from product template
  }));

  const branch = sale.branch || {};
  const config = branch.receiptConfig || {};

  // Construct full configuration object for the bill layout
  const fullConfig = {
    branchName: config.branchName || branch.name || '-',
    address: config.address || branch.address || '-',
    phone: config.phone || branch.phone || '-',
    taxId: config.taxId || branch.taxId || '-',
    footerNote: config.footerNote || '',
    logoUrl: config.logoUrl || null,
    vatRate: config.vatRate || 7, // Default VAT rate if not specified
  };

  // Prepare all data required by BillLayoutFullTax
  const saleData = {
    sale,
    saleItems,
    payments: [payment], // Assuming only one payment object is needed for the layout
    config: fullConfig,
  };

  return <BillLayoutFullTax {...saleData} />;
};

export default PrintBillPageFullTax;
