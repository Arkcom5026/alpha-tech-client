import React, { useState } from 'react';
import usePurchaseOrderReceiptItemStore from '../store/purchaseOrderReceiptItemStore';

const PurchaseOrderReceiptItemForm = ({ item }) => {
  const { saveReceiptItem } = usePurchaseOrderReceiptItemStore();
  const [quantityReceived, setQuantityReceived] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!quantityReceived || Number(quantityReceived) <= 0) return;

    try {
      setLoading(true);
      await saveReceiptItem({
        purchaseOrderItemId: item.id,
        quantity: Number(quantityReceived),
        costPrice: item.costPrice, // ✅ เพิ่ม costPrice ใน payload
      });
      setQuantityReceived('');
    } catch (err) {
      console.error('❌ Error saving receipt item:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center space-x-2">
      <span>{item.product?.title || 'ไม่พบชื่อสินค้า'}</span>
      <input
        type="number"
        min="0"
        value={quantityReceived}
        onChange={(e) => setQuantityReceived(e.target.value)}
        className="w-24 border rounded px-2 py-1 text-sm"
        placeholder="จำนวนรับ"
      />
      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white text-sm px-3 py-1 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'กำลังบันทึก...' : 'บันทึก'}
      </button>
    </form>
  );
};

export default PurchaseOrderReceiptItemForm;
