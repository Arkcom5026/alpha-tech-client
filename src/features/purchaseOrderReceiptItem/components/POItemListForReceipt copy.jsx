import React, { useEffect, useState } from 'react';

import usePurchaseOrderReceiptStore from '../../purchaseOrderReceipt/store/purchaseOrderReceiptStore';
import purchaseOrderReceiptItemStore from '../store/purchaseOrderReceiptItemStore';


const POItemListForReceipt = ({ poId, receiptId, setReceiptId, deliveryNoteNumber }) => {

  const { updateReceiptItemAction, addReceiptItemAction, createReceiptAction } = purchaseOrderReceiptItemStore();
  const { loadOrderById, currentOrder, loading, } = usePurchaseOrderReceiptStore();

  const [receiptQuantities, setReceiptQuantities] = useState({});
  const [saving, setSaving] = useState({});
  // ลบ savedRows แล้วใช้ item.receivedQuantity แทน
  const [editMode, setEditMode] = useState({});

  useEffect(() => {
    if (poId) loadOrderById(poId);
  }, [poId]);

  const handleQuantityChange = (itemId, value) => {
    setReceiptQuantities((prev) => ({
      ...prev,
      [itemId]: value,
    }));
  };





  const handleSaveItem = async (itemId) => {
    const item = currentOrder?.items?.find((i) => i.id === itemId);
    const quantity = Number(receiptQuantities[itemId]);
    if (!quantity || quantity <= 0) return;
    if (quantity > item.quantity) {
      alert(`จำนวนที่รับ (${quantity}) มากกว่าจำนวนที่สั่ง (${item.quantity})`);
      return;
    }

    setSaving((prev) => ({ ...prev, [itemId]: true }));

    try {
      let currentReceiptId = receiptId;

      if (!currentReceiptId) {
        const newReceipt = await createReceiptAction({
          purchaseOrderId: poId,
          deliveryNoteNumber,
        });
        currentReceiptId = newReceipt.id;
        setReceiptId(currentReceiptId);
      }

      const isSaved = item.receivedQuantity > 0;
      const isEditing = editMode[itemId];
      
      if (isSaved && isEditing) {
        await updateReceiptItemAction({
          purchaseOrderReceiptId: currentReceiptId,
          purchaseOrderItemId: itemId,
          quantity,
        });
        setEditMode((prev) => ({ ...prev, [itemId]: false }));
      } else if (!isSaved) {
        await addReceiptItemAction({
          purchaseOrderReceiptId: currentReceiptId,
          purchaseOrderItemId: itemId,
          quantity,
        });
      }
      

      setReceiptQuantities((prev) => ({ ...prev, [itemId]: '' }));
    } catch (err) {
      console.error('❌ บันทึกรายการไม่สำเร็จ:', err);
    } finally {
      setSaving((prev) => ({ ...prev, [itemId]: false }));
    }
  };


  




  if (loading) return <p>กำลังโหลดรายการสินค้า...</p>;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">รายการสินค้าในใบสั่งซื้อ</h2>
      <table className="w-full table-auto border border-gray-300 text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-2 py-1">รหัสสินค้า</th>
            <th className="border px-2 py-1">ชื่อสินค้า</th>
            <th className="border px-2 py-1">จำนวนที่สั่ง</th>
            <th className="border px-2 py-1">จำนวนที่รับ</th>
            <th className="border px-2 py-1">จัดการ</th>
          </tr>
        </thead>
        <tbody>
          {(currentOrder?.items || []).map((item) => {
            const isSaved = item.receivedQuantity > 0;
            const isEditing = editMode[item.id];
            return (
              <tr
                key={item.id}
                className={isSaved ? 'bg-blue-100' : ''}
              >
                <td className="border px-2 py-1 text-center">{item.product?.id || '-'}</td>
                <td className="border px-2 py-1">{item.product?.title}</td>
                <td className="border px-2 py-1 text-center">{item.quantity}</td>
                <td className="border px-2 py-1 text-center">
                  <input
                    type="number"
                    min="0"
                    className="w-20 text-center border rounded px-1 py-0.5"
                    value={receiptQuantities[item.id] || ''}
                    onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                    disabled={isSaved && !isEditing}
                  />
                </td>
                <td className="border px-2 py-1 text-center space-x-1">
                  {!isSaved && (
                    <button
                      onClick={() => handleSaveItem(item.id)}
                      disabled={saving[item.id] || !receiptQuantities[item.id]}
                      className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                      {saving[item.id] ? 'กำลังบันทึก...' : 'บันทึก'}
                    </button>
                  )}
                  {isSaved && !isEditing && (
                    <button
                      onClick={() => setEditMode((prev) => ({ ...prev, [item.id]: true }))}
                      className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
                    >
                      แก้ไข
                    </button>
                  )}
                  {isSaved && isEditing && (
                    <button
                      onClick={() => handleSaveItem(item.id)}
                      disabled={saving[item.id] || !receiptQuantities[item.id]}
                      className="bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 disabled:opacity-50"
                    >
                      อัปเดต
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default POItemListForReceipt;



