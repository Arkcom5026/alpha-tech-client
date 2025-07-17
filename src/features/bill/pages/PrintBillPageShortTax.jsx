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
  const [payment, setPayment] = useState(null); // State for the main Payment object or a simplified one

  useEffect(() => {
    const statePayment = location.state?.payment;

    if (statePayment && statePayment.sale) {
      // If navigating from PrintBillListPage, statePayment is a full Payment object from backend
      setSale(statePayment.sale);
      setPayment(statePayment);
    } else {
      // If direct access/refresh, fetch sale details by ID
      getSaleById(id).then((saleRes) => {
        setSale(saleRes);
        // When fetching sale by ID, we might not have full Payment details (e.g., Payment.items).
        // For simplicity, create a single payment object representing the total sale amount.
        // In a real application, you might fetch associated Payment objects and their items here.
        setPayment({
          saleId: saleRes.id,
          // Fallback payment method and amount for direct access/refresh if full payment details aren't available
          paymentMethod: 'เงินสด/โอน', // Generic method
          amount: saleRes.totalAmount, // Total amount of the sale
          note: saleRes.note || '',
          sale: saleRes,
        });
      });
    }
  }, [location.state, id]);

  if (!sale || !payment) return <div>⏳ กำลังโหลดข้อมูลใบเสร็จ...</div>;

  // Map sale items to the format expected by BillLayoutShortTax
  const saleItems = (sale.items || []).map((i) => ({
    id: i.id, // Use SaleItem's own ID
    productName: i.stockItem.product?.name || 'ไม่พบชื่อสินค้า',
    price: i.price ?? 0, // Use 'price' field from SaleItem as unit price
    quantity: 1, // Quantity is always 1 per SaleItem
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
    footerNote: config.footerNote || 'ใช้งาน POS ฟรีได้ที่ FlowAccount.com',
    logoUrl: config.logoUrl || null,
    vatRate: config.vatRate || 7, // Default VAT rate if not specified
  };

  // Prepare payments array for BillLayoutShortTax
  // If 'payment' has 'items' (from a full Payment object from backend), use them.
  // Otherwise, use the simplified 'payment' object created from getSaleById.
  const paymentsForLayout = (payment.items && Array.isArray(payment.items))
    ? payment.items
    : [{ paymentMethod: payment.paymentMethod, amount: payment.amount }];

  const saleData = {
    sale,
    saleItems,
    payments: paymentsForLayout, // Pass the prepared payments array
    config: fullConfig,
  };

  return <BillLayoutShortTax {...saleData} />;
};

export default PrintBillPageShortTax;
