import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import POItemListForReceipt from '@/features/purchaseOrderReceiptItem/components/POItemListForReceipt';
import usePurchaseOrderReceiptStore from '../store/purchaseOrderReceiptStore';

const CreatePurchaseOrderReceiptPage = () => {
  const { poId } = useParams();
  const { currentOrder, loadOrderById, loadReceiptById } = usePurchaseOrderReceiptStore();

  const [deliveryNoteNumber, setDeliveryNoteNumber] = useState('');
  const [setDeliveredAt] = useState(new Date().toISOString().split('T')[0]);
  const [receiptId, setReceiptId] = useState(null);
  const [receiptCode, setReceiptCode] = useState(null);
  const [quantities, setQuantities] = useState({});
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (poId) {
      loadOrderById(poId);
    }
  }, [poId]);

  useEffect(() => {
    if (receiptId) {
      loadReceiptById(receiptId).then((r) => {
        setReceiptCode(r?.code || null);
        setItems(r?.items || []);
      });
    }
  }, [receiptId]);

  const handleChange = (itemId, value) => {
    setQuantities((prev) => ({ ...prev, [itemId]: value }));
  };

  if (!currentOrder) return <p>📭 ยังไม่มีข้อมูลใบสั่งซื้อ</p>;

  return (
    <div className="p-4 w-full mx-auto">
      <h1 className="text-2xl font-bold mb-4">สร้างใบรับสินค้าจากใบสั่งซื้อ</h1>

      <div className="bg-gray-50 border rounded p-4 mb-6">
        <p><strong>รหัสใบสั่งซื้อ:</strong> {currentOrder.code}</p>
        <p><strong>Supplier:</strong> {currentOrder.supplier?.name || '-'}</p>
        <p><strong>วันที่สั่งซื้อ:</strong> {new Date(currentOrder.createdAt).toLocaleDateString()}</p>
        {receiptCode && (
          <p className="mt-2 text-blue-600 font-semibold">เลขที่ใบรับสินค้า: {receiptCode}</p>
        )}
      </div>

      <div className="mt-8">
        <POItemListForReceipt
          poId={currentOrder.id}
          receiptId={receiptId}
          setReceiptId={setReceiptId}
          deliveryNoteNumber={deliveryNoteNumber}
          items={items}
          quantities={quantities}
          onQuantityChange={handleChange}
        />
      </div>
    </div>
  );
};

export default CreatePurchaseOrderReceiptPage;
