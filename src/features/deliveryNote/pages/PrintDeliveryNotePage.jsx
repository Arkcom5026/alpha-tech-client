import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import useSalesStore from '@/features/sales/store/salesStore';
import DeliveryNoteForm from '../components/DeliveryNoteForm';

const PrintDeliveryNotePage = () => {
  const { saleId } = useParams();
  const location = useLocation();

  const saleStore = useSalesStore();
  const { getSaleByIdAction, currentSale, setCurrentSale } = saleStore;

  const [isLoading, setIsLoading] = useState(true);
  const [hideDate, setHideDate] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const saleFromState = location.state?.sale;

      if (saleFromState && String(saleFromState.id) === saleId) {
        setCurrentSale(saleFromState);
        console.log("Using sale data from navigation state:", saleFromState);
      } else {
        console.log("Fetching sale data from backend for saleId:", saleId);
        await getSaleByIdAction(saleId);
      }
    };

    if (saleId) {
      fetchData();
    } else {
      setIsLoading(false);
    }
  }, [saleId, location.state, getSaleByIdAction, setCurrentSale]);

  useEffect(() => {
    if (currentSale && String(currentSale.id) === saleId) {
      setIsLoading(false);
    }
  }, [currentSale, saleId]);

  if (isLoading) {
    return <div className="p-4 text-center text-gray-600">กำลังโหลดข้อมูลใบส่งของ...</div>;
  }

  if (!currentSale || String(currentSale.id) !== String(saleId)) {
    return <div className="p-4 text-center text-red-600">ไม่พบข้อมูลใบส่งของ หรือข้อมูลไม่ถูกต้อง</div>;
  }

  const preparedSaleItems = (currentSale.items || []).map((item) => ({
    id: item.id,
    productName: item.stockItem?.product?.name || 'ไม่พบชื่อสินค้า',
    productModel: item.stockItem?.product?.model || 'ไม่พบชื่อสินค้า',
    price: item.basePrice ?? 0,
    quantity: 1,
    unit: item.stockItem?.product?.template?.unit?.name || '-',
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
        config={preparedConfig}
        showDateLine={true} // เพิ่ม flag เพื่อให้มีเส้นใต้แม้ไม่แสดงวันที่
      />
    </div>
  );
};

export default PrintDeliveryNotePage;
