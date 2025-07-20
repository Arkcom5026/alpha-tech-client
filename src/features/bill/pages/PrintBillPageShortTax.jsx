import { useParams, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getSaleById } from '@/features/sales/api/saleApi';
import BillLayoutShortTax from '../components/BillLayoutShortTax';

const PrintBillPageShortTax = () => {
  const { id } = useParams();
  const location = useLocation();
  const [sale, setSale] = useState(null);

  useEffect(() => {
    const stateSale = location.state?.payment?.sale;
    if (stateSale) {
      setSale(stateSale);
      return;
    }

    if (typeof id !== 'string' || isNaN(Number(id))) {
      console.warn('🛑 Invalid sale ID:', id);
      return;
    }

    (async () => {
      try {
        const res = await getSaleById(id);
        setSale(res);
      } catch (err) {
        console.error('❌ Error loading sale:', err);
      }
    })();
  }, [id, location.state]);

  if (!sale || !sale.items) {
    return <div className="text-center p-6 text-gray-700">⼻ กำลังโหลดข้อมูลใบเสร็จ...</div>;
  }

  const saleItems = (sale.items || []).map((i) => ({
    id: i.id,
    productName: i.stockItem.product?.name || 'ไม่พบชื่อสินค้า',
    model: i.stockItem.product?.model || null,
    price: i.price ?? 0,
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
    hideDate: true,
  };

  const customerType = sale.customer?.type || 'PERSON';
  const hideContactName = customerType === 'ORGANIZATION' || customerType === 'GOVERNMENT';

  const saleData = {
    sale,
    saleItems,
    payments: sale.payments || [],
    config: fullConfig,
    hideContactName, // ✅ ซ่อนชื่อผู้ติดต่อเมื่อเป็นหน่วยงาน
  };

  return <BillLayoutShortTax {...saleData} />;
};

export default PrintBillPageShortTax;
