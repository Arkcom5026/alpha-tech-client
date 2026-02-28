


// src/features/deliveryNote/pages/PrintDeliveryNotePage.jsx

import { useEffect, useMemo, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import useSalesStore from '@/features/sales/store/salesStore';
import DeliveryNoteForm from '../components/DeliveryNoteForm';

const PrintDeliveryNotePage = () => {
  const { saleId } = useParams();
  const location = useLocation();

  const saleStore = useSalesStore();
  const { getSaleByIdAction, currentSale, setCurrentSale } = saleStore;

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [hideDate, setHideDate] = useState(false);

  // ✅ Avoid unstable deps from location.state object
  const navSale = useMemo(() => location.state?.sale || null, [location.key]);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (!saleId) {
        if (isMounted) setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError('');

      try {
        // ✅ Prefer navigation state (fast path)
        if (navSale && String(navSale.id) === String(saleId)) {
          setCurrentSale(navSale);
          if (isMounted) setIsLoading(false);
          return;
        }

        // ✅ Fallback: fetch from backend
        await getSaleByIdAction(saleId);
      } catch (err) {
        console.error('[PrintDeliveryNotePage] fetch sale error', err);
        if (isMounted) setError('ไม่สามารถโหลดข้อมูลใบส่งของได้');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [saleId, navSale, getSaleByIdAction, setCurrentSale]);


  if (isLoading) {
    return <div className="p-4 text-center text-gray-600">กำลังโหลดข้อมูลใบส่งของ...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-600">{error}</div>;
  }

  if (!currentSale || String(currentSale.id) !== String(saleId)) {
    return <div className="p-4 text-center text-red-600">ไม่พบข้อมูลใบส่งของ หรือข้อมูลไม่ถูกต้อง</div>;
  }

  const preparedSaleItems = (currentSale.items || []).map((item) => ({
    id: item.id,
    stockItemId: item.stockItemId ?? item.stockItem?.id,
    productName: item.stockItem?.product?.name || 'ไม่พบชื่อสินค้า',
    productModel: item.stockItem?.product?.model || '-',
    price: item.basePrice ?? 0,
    quantity: 1,
    unit: item.stockItem?.product?.unit?.name || item.stockItem?.product?.template?.unit?.name || '-',
    discount: item.discount ?? 0,
    barcode: item.stockItem?.barcode || '-',
    serialNumber: item.stockItem?.serialNumber || '-',
  }));

  const branch = currentSale.branch || {};
  const preparedConfig = {
    branchName: branch.name || '-',
    address: branch.address || '-',
    phone: branch.phone || '-',
    taxId: branch.taxId || '-',
  };

  return (
    <div className="p-4 space-y-4">
      <DeliveryNoteForm
        sale={currentSale}
        hideDate={hideDate}
        setHideDate={setHideDate}
        saleItems={preparedSaleItems}
        config={preparedConfig}      />
    </div>
  );
};

export default PrintDeliveryNotePage;


